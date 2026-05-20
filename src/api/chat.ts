import request from './request'
import type { Conversation, Message, PaginatedResponse, RecommendedQuestion } from '@/types'

export const chatApi = {
  // 获取对话列表
  getConversations: (page = 1, pageSize = 20) => 
    request.get<unknown, PaginatedResponse<Conversation>>('/chat/conversations', {
      params: { page, page_size: pageSize }
    }),
  
  // 创建对话
  createConversation: (title?: string) => 
    request.post<unknown, Conversation>('/chat/conversations', { title }),
  
  // 删除对话
  deleteConversation: (id: number) => 
    request.delete(`/chat/conversations/${id}`),
  
  // 获取消息列表
  getMessages: (conversationId: number) => 
    request.get<unknown, Message[]>(`/chat/conversations/${conversationId}/messages`),

  // 获取推荐问题（前台，随机5条）
  getRecommendedQuestions: () =>
    request.get<unknown, RecommendedQuestion[]>('/recommended-questions'),
}

// 流式对话
export const streamChat = async (
  message: string,
  conversationId: number | null,
  onChunk: (content: string, convId: number) => void,
  onDone: (convId: number, messageId: number, tokenCount: number) => void,
  onError: (error: string) => void
) => {
  const token = localStorage.getItem('token')
  
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        message,
        ...(conversationId && { conversation_id: conversationId })
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      onError(error.message || '请求失败')
      return
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      onError('无法读取响应')
      return
    }

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          continue
        }
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          try {
            const data = JSON.parse(dataStr)
            if (data.content !== undefined) {
              onChunk(data.content, data.conversation_id)
            }
            if (data.message_id !== undefined) {
              onDone(data.conversation_id, data.message_id, data.token_count || 0)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : '网络错误')
  }
}

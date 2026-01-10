import { create } from 'zustand'
import { chatApi, streamChat } from '@/api'
import type { Conversation, Message } from '@/types'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
  loading: boolean
  loadConversations: () => Promise<void>
  createConversation: (title?: string) => Promise<Conversation>
  selectConversation: (conversation: Conversation) => Promise<void>
  deleteConversation: (id: number) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  clearCurrentConversation: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  loading: false,

  loadConversations: async () => {
    set({ loading: true })
    try {
      const res = await chatApi.getConversations()
      set({ conversations: res.items, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  createConversation: async (title?: string) => {
    const conversation = await chatApi.createConversation(title)
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation,
      messages: [],
    }))
    return conversation
  },

  selectConversation: async (conversation) => {
    set({ currentConversation: conversation, loading: true })
    try {
      const messages = await chatApi.getMessages(conversation.id)
      set({ messages, loading: false })
    } catch {
      set({ messages: [], loading: false })
    }
  },

  deleteConversation: async (id) => {
    await chatApi.deleteConversation(id)
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
      messages: state.currentConversation?.id === id ? [] : state.messages,
    }))
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null, messages: [] })
  },

  sendMessage: async (content) => {
    const { currentConversation } = get()

    // 添加用户消息到列表
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingContent: '',
    }))

    let newConversationId: number | null = null

    await streamChat(
      content,
      currentConversation?.id || null,
      // onChunk
      (chunkContent, convId) => {
        if (!newConversationId && !currentConversation) {
          newConversationId = convId
        }
        set((state) => ({
          streamingContent: state.streamingContent + chunkContent,
        }))
      },
      // onDone
      async (convId, messageId, _tokenCount) => {
        const { streamingContent, currentConversation: currConv } = get()
        
        const assistantMessage: Message = {
          id: messageId,
          role: 'assistant',
          content: streamingContent,
          created_at: new Date().toISOString(),
        }

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isStreaming: false,
          streamingContent: '',
        }))

        // 如果是新对话，更新对话列表
        if (!currConv || currConv.id !== convId) {
          await get().loadConversations()
          // 设置当前对话
          const { conversations } = get()
          const newConv = conversations.find(c => c.id === convId)
          if (newConv) {
            set({ currentConversation: newConv })
          }
        }
      },
      // onError
      (error) => {
        console.error('Stream error:', error)
        set({ isStreaming: false, streamingContent: '' })
      }
    )
  },
}))

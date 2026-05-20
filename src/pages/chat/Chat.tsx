import { useEffect, useRef, useState } from 'react'
import { useChatStore, useAuthStore } from '@/stores'
import { chatApi } from '@/api'
import type { RecommendedQuestion } from '@/types'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

export default function Chat() {
  const {
    currentConversation,
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
  } = useChatStore()
  const user = useAuthStore((s) => s.user)

  const [input, setInput] = useState('')
  const [recommendedQuestions, setRecommendedQuestions] = useState<RecommendedQuestion[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 获取推荐问题
  useEffect(() => {
    const fetchRecommendedQuestions = async () => {
      try {
        const data = await chatApi.getRecommendedQuestions()
        setRecommendedQuestions(data)
      } catch (error) {
        console.error('获取推荐问题失败:', error)
      }
    }
    fetchRecommendedQuestions()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const content = input
    setInput('')
    await sendMessage(content)
  }

  const handleSuggestedQuestion = async (question: string) => {
    await sendMessage(question)
  }

  // 空状态 - 欢迎页面
  if (!currentConversation && messages.length === 0) {
    return (
      <div className="flex flex-col h-full deep-page">
        {/* 欢迎内容 */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="mb-6 rounded-full deep-chip px-4 py-1.5 text-sm">
            RAG Knowledge Assistant
          </div>
          <h1 className="text-3xl font-semibold text-sky-50 mb-3">
            有什么我能帮你的吗？
          </h1>
          <p className="text-blue-200/75 mb-8 text-sm">从你的个人知识库中检索、归纳并生成回答</p>
          
          {/* 推荐问题 */}
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            {recommendedQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => handleSuggestedQuestion(question.content)}
                className="px-4 py-2.5 deep-chip rounded-full text-sm transition-colors"
              >
                {question.content}
              </button>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <div className="p-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative deep-panel rounded-2xl">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="发消息..."
                rows={1}
                className="w-full px-4 py-3.5 pr-24 resize-none rounded-2xl focus:outline-none text-sky-50 placeholder-blue-200/60 bg-transparent"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    input.trim() 
                      ? "deep-btn-primary text-white" 
                      : "bg-slate-800/70 text-blue-300/50"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 对话状态
  return (
    <div className="flex flex-col h-full deep-page">
      {/* 消息列表 */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'assistant' ? (
                // AI 消息 - 左对齐
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg deep-glow-icon flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <div className="flex-1 min-w-0 mr-11">
                    <div className="deep-panel rounded-2xl rounded-tl-md px-4 py-3">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        className="prose prose-sm max-w-none text-blue-50 prose-headings:text-sky-50 prose-p:text-blue-50 prose-strong:text-white prose-li:text-blue-50"
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                // 用户消息 - 右对齐
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 min-w-0 ml-11 flex justify-end">
                    <div className="deep-btn-primary text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-full">
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="头像" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* 流式响应 */}
          {isStreaming && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg deep-glow-icon flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="flex-1 min-w-0 mr-11">
                <div className="deep-panel rounded-2xl rounded-tl-md px-4 py-3">
                  {streamingContent ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      className="prose prose-sm max-w-none text-blue-50 prose-headings:text-sky-50 prose-p:text-blue-50 prose-strong:text-white prose-li:text-blue-50"
                    >
                      {streamingContent}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-blue-200/75">思考中...</span>
                  )}
                  <span className="inline-block w-2 h-4 bg-cyan-300 animate-pulse ml-1" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入框 */}
      <div className="p-4 pb-6 bg-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="relative deep-panel rounded-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="发消息..."
              disabled={isStreaming}
              rows={1}
              className="w-full px-4 py-3.5 pr-24 resize-none rounded-2xl focus:outline-none text-sky-50 placeholder-blue-200/60 disabled:opacity-60 bg-transparent"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  input.trim() && !isStreaming
                    ? "deep-btn-primary text-white" 
                    : "bg-slate-800/70 text-blue-300/50"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

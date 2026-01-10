import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '@/stores'
import { Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

// 推荐问题
const suggestedQuestions = [
  '这个知识库有什么内容？',
  '如何使用这个问答系统？',
  '帮我总结一下文档要点',
  '有哪些常见问题？',
]

export default function Chat() {
  const {
    currentConversation,
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
  } = useChatStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedQuestion = async (question: string) => {
    await sendMessage(question)
  }

  // 空状态 - 欢迎页面
  if (!currentConversation && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* 欢迎内容 */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">
            有什么我能帮你的吗？
          </h1>
          
          {/* 推荐问题 */}
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <div className="p-4 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="发消息..."
                rows={1}
                className="w-full px-4 py-3.5 pr-24 resize-none rounded-2xl focus:outline-none text-gray-800 placeholder-gray-400"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    input.trim() 
                      ? "bg-blue-500 hover:bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-400"
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* 消息列表 */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'assistant' ? (
                // AI 消息 - 左对齐
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <div className="flex-1 min-w-0 mr-11">
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        className="prose prose-sm max-w-none text-gray-700"
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
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-full">
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* 流式响应 */}
          {isStreaming && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="flex-1 min-w-0 mr-11">
                <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  {streamingContent ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      className="prose prose-sm max-w-none text-gray-700"
                    >
                      {streamingContent}
                    </ReactMarkdown>
                  ) : (
                    <span className="text-gray-400">思考中...</span>
                  )}
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入框 */}
      <div className="p-4 pb-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="发消息..."
              disabled={isStreaming}
              rows={1}
              className="w-full px-4 py-3.5 pr-24 resize-none rounded-2xl focus:outline-none text-gray-800 placeholder-gray-400 disabled:bg-gray-50"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  input.trim() && !isStreaming
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-400"
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

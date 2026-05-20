import { useState, useEffect, useCallback } from 'react'
import { adminConversationApi } from '@/api'
import type { AdminConversation, AdminConversationDetail, PaginatedResponse } from '@/types'
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, X, MessageSquare, User, Bot } from 'lucide-react'

export default function ConversationManagement() {
  const [conversations, setConversations] = useState<PaginatedResponse<AdminConversation> | null>(null)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [detailModal, setDetailModal] = useState<{ open: boolean; detail: AdminConversationDetail | null }>({ open: false, detail: null })

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminConversationApi.getList({ 
        page, 
        page_size: 20, 
        username: username || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setConversations(data)
    } catch (error) {
      console.error('获取对话列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, username, startDate, endDate])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleSearch = () => {
    setPage(1)
    fetchConversations()
  }

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await adminConversationApi.getDetail(id)
      setDetailModal({ open: true, detail })
    } catch (error) {
      console.error('获取对话详情失败:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该对话吗？')) return
    try {
      await adminConversationApi.deleteConversation(id)
      fetchConversations()
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  const totalPages = conversations ? Math.ceil(conversations.total / conversations.page_size) : 0

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">对话管理</h1>
        <p className="text-slate-500 mt-1">查看和管理用户对话记录</p>
      </div>
      
      {/* 主卡片 */}
      <div className="deep-panel rounded-2xl overflow-hidden">
        {/* 筛选栏 */}
        <div className="px-6 py-4 border-b deep-panel-header">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-36 pl-10 pr-4 py-2.5 deep-input rounded-xl transition-all"
              />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 deep-input rounded-xl transition-all"
            />
            <span className="text-slate-400">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 deep-input rounded-xl transition-all"
            />
            <button 
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2.5 deep-btn-primary rounded-xl transition-all"
            >
              <Search className="h-4 w-4" />
              搜索
            </button>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-violet-500/15 border border-violet-300/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-violet-500" />
              <span className="text-sm text-violet-700 font-medium">共 {conversations?.total || 0} 对话</span>
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p>加载中...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left py-4 px-6 font-medium text-slate-600">ID</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">标题</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">用户</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">消息数</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">创建时间</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {conversations?.items.map((conv) => (
                  <tr key={conv.id} className="border-t border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 text-slate-600">{conv.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 max-w-xs">
                        <MessageSquare className="h-4 w-4 text-violet-500 flex-shrink-0" />
                        <span className="font-medium text-slate-800 truncate" title={conv.title}>{conv.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {conv.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-700">{conv.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {conv.message_count} 条
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{new Date(conv.created_at).toLocaleString('zh-CN')}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleViewDetail(conv.id)} 
                          title="查看详情"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(conv.id)} 
                          title="删除"
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <span className="text-sm text-slate-500">共 {conversations?.total} 条记录</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                className="p-2 deep-btn-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">{page} / {totalPages}</span>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="p-2 deep-btn-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 对话详情弹窗 */}
      {detailModal.open && detailModal.detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="deep-panel-strong rounded-2xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b deep-panel-header flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-slate-800">{detailModal.detail.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  用户: {detailModal.detail.username} · {new Date(detailModal.detail.created_at).toLocaleString('zh-CN')}
                </p>
              </div>
              <button 
                onClick={() => setDetailModal({ open: false, detail: null })}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-950/20">
              {detailModal.detail.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg deep-glow-icon flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'deep-btn-primary text-white rounded-tr-md' 
                        : 'deep-panel rounded-tl-md'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {new Date(msg.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

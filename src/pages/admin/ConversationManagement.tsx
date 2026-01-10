import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminConversationApi } from '@/api'
import type { AdminConversation, AdminConversationDetail, PaginatedResponse } from '@/types'
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'

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
    <div>
      <h1 className="text-2xl font-bold mb-6">对话管理</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-36"
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <span className="text-muted-foreground">至</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">标题</th>
                      <th className="text-left py-3 px-4">用户</th>
                      <th className="text-left py-3 px-4">消息数</th>
                      <th className="text-left py-3 px-4">创建时间</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations?.items.map((conv) => (
                      <tr key={conv.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{conv.id}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={conv.title}>{conv.title}</td>
                        <td className="py-3 px-4">{conv.username}</td>
                        <td className="py-3 px-4">{conv.message_count}</td>
                        <td className="py-3 px-4">{new Date(conv.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetail(conv.id)} title="查看详情">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(conv.id)} title="删除">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">共 {conversations?.total} 条</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 对话详情弹窗 */}
      {detailModal.open && detailModal.detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[700px] max-h-[80vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{detailModal.detail.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  用户: {detailModal.detail.username} | 创建时间: {new Date(detailModal.detail.created_at).toLocaleString()}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setDetailModal({ open: false, detail: null })}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {detailModal.detail.messages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{msg.role === 'user' ? '用户' : 'AI'}</span>
                      <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

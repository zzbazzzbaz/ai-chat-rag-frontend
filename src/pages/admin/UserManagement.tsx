import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminUserApi } from '@/api'
import type { AdminUser, PaginatedResponse } from '@/types'
import { Search, UserX, UserCheck, KeyRound, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState<PaginatedResponse<AdminUser> | null>(null)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [resetPasswordModal, setResetPasswordModal] = useState<{ open: boolean; userId: number | null }>({ open: false, userId: null })
  const [newPassword, setNewPassword] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminUserApi.getUsers({ page, page_size: 20, keyword: keyword || undefined })
      setUsers(data)
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, keyword])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminUserApi.updateStatus(user.id, !user.is_active)
      fetchUsers()
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordModal.userId || !newPassword) return
    try {
      await adminUserApi.resetPassword(resetPasswordModal.userId, newPassword)
      setResetPasswordModal({ open: false, userId: null })
      setNewPassword('')
      alert('密码重置成功')
    } catch (error) {
      console.error('重置密码失败:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该用户吗？')) return
    try {
      await adminUserApi.deleteUser(id)
      fetchUsers()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }

  const totalPages = users ? Math.ceil(users.total / users.page_size) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索用户名..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-xs"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
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
                      <th className="text-left py-3 px-4">用户名</th>
                      <th className="text-left py-3 px-4">状态</th>
                      <th className="text-left py-3 px-4">注册时间</th>
                      <th className="text-left py-3 px-4">最后登录</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.items.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{user.id}</td>
                        <td className="py-3 px-4">{user.username}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.is_active ? '正常' : '禁用'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(user.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleToggleStatus(user)} title={user.is_active ? '禁用' : '启用'}>
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setResetPasswordModal({ open: true, userId: user.id })} title="重置密码">
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)} title="删除">
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
                  <span className="text-sm text-muted-foreground">共 {users?.total} 条</span>
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

      {/* 重置密码弹窗 */}
      {resetPasswordModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>重置密码</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setResetPasswordModal({ open: false, userId: null }); setNewPassword('') }}>
                  取消
                </Button>
                <Button onClick={handleResetPassword}>确定</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

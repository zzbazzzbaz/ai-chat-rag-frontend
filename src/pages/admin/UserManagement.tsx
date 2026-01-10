import { useState, useEffect, useCallback } from 'react'
import { adminUserApi } from '@/api'
import type { AdminUser, PaginatedResponse } from '@/types'
import { Search, UserX, UserCheck, KeyRound, Trash2, ChevronLeft, ChevronRight, Users, X } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState<PaginatedResponse<AdminUser> | null>(null)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [resetPasswordModal, setResetPasswordModal] = useState<{ open: boolean; userId: number | null; username: string }>({ open: false, userId: null, username: '' })
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
      setResetPasswordModal({ open: false, userId: null, username: '' })
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
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
        <p className="text-slate-500 mt-1">管理系统用户账户</p>
      </div>
      
      {/* 主卡片 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
        {/* 搜索栏 */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  placeholder="搜索用户名..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <button 
                onClick={handleSearch} 
                className="px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200/50"
              >
                搜索
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">共 {users?.total || 0} 用户</span>
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
                  <th className="text-left py-4 px-6 font-medium text-slate-600">用户名</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">状态</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">注册时间</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">最后登录</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {users?.items.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 text-slate-600">{user.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.is_active ? '正常' : '禁用'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{new Date(user.created_at).toLocaleString('zh-CN')}</td>
                    <td className="py-4 px-6 text-slate-600">{user.last_login ? new Date(user.last_login).toLocaleString('zh-CN') : '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleToggleStatus(user)} 
                          title={user.is_active ? '禁用' : '启用'}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active 
                              ? 'hover:bg-amber-50 text-amber-600' 
                              : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => setResetPasswordModal({ open: true, userId: user.id, username: user.username })} 
                          title="重置密码"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
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
            <span className="text-sm text-slate-500">共 {users?.total} 条记录</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">{page} / {totalPages}</span>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 重置密码弹窗 */}
      {resetPasswordModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50">
              <h3 className="font-semibold text-slate-800">重置密码</h3>
              <button 
                onClick={() => { setResetPasswordModal({ open: false, userId: null, username: '' }); setNewPassword('') }}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                为用户 <span className="font-medium text-slate-800">{resetPasswordModal.username}</span> 设置新密码
              </p>
              <input
                type="password"
                placeholder="输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setResetPasswordModal({ open: false, userId: null, username: '' }); setNewPassword('') }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleResetPassword}
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-200/50"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores'
import { userApi } from '@/api'
import { User, Calendar, MessageSquare, FileText, Zap, Rocket } from 'lucide-react'
import type { UserStats } from '@/types'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    userApi.getStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">个人中心</h1>
          <p className="text-slate-500 mt-1">管理你的账户信息和查看使用统计</p>
        </div>
        
        {/* 用户卡片 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-2xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user?.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.is_admin 
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700' 
                    : 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700'
                }`}>
                  {user?.is_admin ? '🚀 管理员' : '👤 普通用户'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 用户信息 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                账户信息
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">用户名</span>
                <span className="font-medium text-slate-800">{user?.username}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">账户角色</span>
                <span className="font-medium text-slate-800">{user?.is_admin ? '管理员' : '普通用户'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  注册时间
                </span>
                <span className="font-medium text-slate-800">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 使用统计 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                使用统计
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  对话数
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
                  {stats?.conversation_count ?? '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  消息数
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
                  {stats?.message_count ?? '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Token 消耗
                </span>
                <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {stats?.token_count?.toLocaleString() ?? '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

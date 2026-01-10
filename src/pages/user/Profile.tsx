import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores'
import { userApi } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Calendar, MessageSquare, FileText } from 'lucide-react'
import type { UserStats } from '@/types'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    userApi.getStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 用户信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">用户名</span>
              <span className="font-medium">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">角色</span>
              <span className="font-medium">{user?.is_admin ? '管理员' : '普通用户'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                注册时间
              </span>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 使用统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              使用统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500 flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                对话数
              </span>
              <span className="font-medium">{stats?.conversation_count ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">消息数</span>
              <span className="font-medium">{stats?.message_count ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Token 消耗</span>
              <span className="font-medium">{stats?.token_count?.toLocaleString() ?? '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

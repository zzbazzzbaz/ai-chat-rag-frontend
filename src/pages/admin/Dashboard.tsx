import { useState, useEffect } from 'react'
import { Users, MessageSquare, Database, FileText, Loader2 } from 'lucide-react'
import { adminDashboardApi, type DashboardStats } from '@/api/admin'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminDashboardApi.getStats()
        setStats(data)
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { 
      title: '用户总数', 
      value: stats?.user_count, 
      icon: Users,
      gradient: 'from-sky-400 to-blue-500',
      bgGradient: 'from-sky-50 to-blue-50',
      shadowColor: 'shadow-blue-200/50'
    },
    { 
      title: '对话总数', 
      value: stats?.conversation_count, 
      icon: MessageSquare,
      gradient: 'from-violet-400 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      shadowColor: 'shadow-purple-200/50'
    },
    { 
      title: '知识库文件', 
      value: stats?.knowledge_count, 
      icon: Database,
      gradient: 'from-emerald-400 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      shadowColor: 'shadow-teal-200/50'
    },
    { 
      title: '消息总数', 
      value: stats?.message_count, 
      icon: FileText,
      gradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      shadowColor: 'shadow-orange-200/50'
    },
  ]

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪表盘</h1>
          <p className="text-slate-500 mt-1">系统运行概览</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-700 font-medium">系统运行正常</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div 
            key={card.title}
            className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg ${card.shadowColor} p-6 hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{card.title}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              ) : (
                <span className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value ?? '-'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-blue-100/30 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/users" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-sky-50 border border-slate-100 transition-colors">
            <Users className="h-6 w-6 text-blue-500" />
            <span className="text-sm text-slate-600">用户管理</span>
          </a>
          <a href="/admin/knowledge" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-sky-50 border border-slate-100 transition-colors">
            <Database className="h-6 w-6 text-emerald-500" />
            <span className="text-sm text-slate-600">知识库管理</span>
          </a>
          <a href="/admin/conversations" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-sky-50 border border-slate-100 transition-colors">
            <MessageSquare className="h-6 w-6 text-purple-500" />
            <span className="text-sm text-slate-600">对话管理</span>
          </a>
          <a href="/admin/settings" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-sky-50 border border-slate-100 transition-colors">
            <FileText className="h-6 w-6 text-amber-500" />
            <span className="text-sm text-slate-600">系统设置</span>
          </a>
        </div>
      </div>
    </div>
  )
}

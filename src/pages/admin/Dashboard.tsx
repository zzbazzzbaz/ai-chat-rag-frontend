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
    },
    { 
      title: '对话总数', 
      value: stats?.conversation_count, 
      icon: MessageSquare,
      gradient: 'from-violet-400 to-purple-500',
    },
    { 
      title: '知识库文件', 
      value: stats?.knowledge_count, 
      icon: Database,
      gradient: 'from-emerald-400 to-teal-500',
    },
    { 
      title: '消息总数', 
      value: stats?.message_count, 
      icon: FileText,
      gradient: 'from-amber-400 to-orange-500',
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
            className="deep-panel rounded-2xl p-6 hover:border-sky-300/30 transition-colors"
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
      <div className="deep-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-sky-50 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/users" className="flex flex-col items-center gap-2 p-4 rounded-xl deep-btn-secondary transition-colors">
            <Users className="h-6 w-6 text-cyan-300" />
            <span className="text-sm text-blue-100">用户管理</span>
          </a>
          <a href="/admin/knowledge" className="flex flex-col items-center gap-2 p-4 rounded-xl deep-btn-secondary transition-colors">
            <Database className="h-6 w-6 text-emerald-500" />
            <span className="text-sm text-blue-100">知识库管理</span>
          </a>
          <a href="/admin/conversations" className="flex flex-col items-center gap-2 p-4 rounded-xl deep-btn-secondary transition-colors">
            <MessageSquare className="h-6 w-6 text-violet-300" />
            <span className="text-sm text-blue-100">对话管理</span>
          </a>
          <a href="/admin/settings" className="flex flex-col items-center gap-2 p-4 rounded-xl deep-btn-secondary transition-colors">
            <FileText className="h-6 w-6 text-amber-500" />
            <span className="text-sm text-blue-100">系统设置</span>
          </a>
        </div>
      </div>
    </div>
  )
}

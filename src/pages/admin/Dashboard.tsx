import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    { title: '用户总数', value: stats?.user_count, icon: Users },
    { title: '对话总数', value: stats?.conversation_count, icon: MessageSquare },
    { title: '知识库文件', value: stats?.knowledge_count, icon: Database },
    { title: '消息总数', value: stats?.message_count, icon: FileText },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  card.value ?? '-'
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

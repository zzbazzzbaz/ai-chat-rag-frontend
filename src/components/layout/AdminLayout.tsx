import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Database, MessageSquare, Settings, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/admin/users', icon: Users, label: '用户管理' },
  { path: '/admin/knowledge', icon: Database, label: '知识库管理' },
  { path: '/admin/conversations', icon: MessageSquare, label: '对话管理' },
  { path: '/admin/settings', icon: Settings, label: '系统设置' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">管理后台</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted',
                location.pathname === item.path && 'bg-muted'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回用户端
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

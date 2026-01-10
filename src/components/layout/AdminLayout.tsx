import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Database, MessageSquare, Settings, ArrowLeft, Rocket, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: '仪表盘', exact: true },
  { path: '/admin/users', icon: Users, label: '用户管理' },
  { path: '/admin/knowledge', icon: Database, label: '知识库管理' },
  { path: '/admin/conversations', icon: MessageSquare, label: '对话管理' },
  { path: '/admin/questions', icon: HelpCircle, label: '推荐问题' },
  { path: '/admin/settings', icon: Settings, label: '系统设置' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-white/80 flex flex-col shadow-lg shadow-blue-100/20">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">管理后台</h1>
              <p className="text-xs text-slate-500">航天知识库</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive(item)
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-blue-200/50'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 w-full px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回用户端</span>
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

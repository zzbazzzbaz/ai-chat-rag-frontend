import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LayoutDashboard, Users, Database, MessageSquare, Settings, ArrowLeft, Rocket, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores'

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
  const { appInfo, fetchAppInfo } = useAppStore()

  useEffect(() => {
    fetchAppInfo()
  }, [fetchAppInfo])

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path
    }
    return location.pathname.startsWith(item.path)
  }

  return (
    <div className="admin-shell flex h-screen deep-page">
      {/* 侧边栏 */}
      <aside className="w-64 deep-panel-strong border-r border-sky-300/15 flex flex-col">
        <div className="p-5 border-b border-sky-300/15">
          <div className="flex items-center gap-3">
            {appInfo.logo_url ? (
              <img src={appInfo.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl deep-glow-icon flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-sky-50">管理后台</h1>
              <p className="text-xs text-blue-200/75">{appInfo.app_name}</p>
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
                  ? 'deep-btn-primary text-white'
                  : 'text-blue-100 hover:bg-sky-400/10 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-300/15">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 w-full px-4 py-3 text-blue-200 hover:text-white hover:bg-sky-400/10 rounded-xl transition-colors"
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

import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Trash2,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore, useAuthStore, useAppStore } from '@/stores'

export default function UserLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { appInfo, fetchAppInfo } = useAppStore()
  const {
    conversations,
    currentConversation,
    loadConversations,
    selectConversation,
    deleteConversation,
    clearCurrentConversation,
  } = useChatStore()

  useEffect(() => {
    loadConversations()
    fetchAppInfo()
  }, [loadConversations, fetchAppInfo])

  const handleNewChat = async () => {
    clearCurrentConversation()
    navigate('/')
  }

  const handleSelectConversation = async (conv: typeof conversations[0]) => {
    await selectConversation(conv)
    navigate(`/chat/${conv.id}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="user-shell flex h-screen deep-page">
      {/* 侧边栏 */}
      <aside 
        className={cn(
          "flex flex-col deep-panel-strong border-r transition-all duration-300",
          collapsed ? "w-0 overflow-hidden" : "w-64"
        )}
      >
        {/* Logo 区域 */}
        <div className="h-14 flex items-center px-4 border-b border-sky-300/15">
          <div className="flex items-center gap-2">
            {appInfo.logo_url ? (
              <img src={appInfo.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg deep-glow-icon flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-semibold text-sky-50">{appInfo.app_name}</span>
          </div>
          <button 
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1.5 hover:bg-sky-400/10 rounded-md"
          >
            <PanelLeftClose className="w-4 h-4 text-blue-200" />
          </button>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 deep-btn-primary rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">新对话</span>
          </button>
        </div>

        {/* 历史对话 */}
        <div className="flex-1 overflow-auto px-3">
          <div className="text-xs text-blue-200/70 px-2 py-2">历史对话</div>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentConversation?.id === conv.id 
                    ? "bg-sky-400/15 text-sky-100 border border-sky-300/20" 
                    : "hover:bg-sky-400/10 text-blue-100"
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sky-400/15 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5 text-blue-200 hover:text-red-300" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 底部用户信息 */}
        <div className="p-3 border-t border-sky-300/15 space-y-1">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2 py-2 hover:bg-sky-400/10 rounded-lg cursor-pointer"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="头像" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-700 flex items-center justify-center text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-sm text-blue-50 flex-1">{user?.username || '用户'}</span>
            <ChevronRight className="w-4 h-4 text-blue-200/70" />
          </div>
          {user?.is_admin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-2 px-2 py-2 hover:bg-sky-400/10 rounded-lg text-blue-100"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">管理后台</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-sky-400/10 rounded-lg text-blue-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 折叠时的展开按钮 */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute left-2 top-3 z-10 p-2 deep-panel hover:bg-sky-400/10 rounded-lg shadow-sm border"
        >
          <PanelLeft className="w-4 h-4 text-blue-100" />
        </button>
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

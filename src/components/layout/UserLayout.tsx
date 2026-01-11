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
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside 
        className={cn(
          "flex flex-col bg-white border-r transition-all duration-300",
          collapsed ? "w-0 overflow-hidden" : "w-64"
        )}
      >
        {/* Logo 区域 */}
        <div className="h-14 flex items-center px-4 border-b">
          <div className="flex items-center gap-2">
            {appInfo.logo_url ? (
              <img src={appInfo.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-semibold text-gray-800">{appInfo.app_name}</span>
          </div>
          <button 
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1.5 hover:bg-gray-100 rounded-md"
          >
            <PanelLeftClose className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">新对话</span>
          </button>
        </div>

        {/* 历史对话 */}
        <div className="flex-1 overflow-auto px-3">
          <div className="text-xs text-gray-400 px-2 py-2">历史对话</div>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  currentConversation?.id === conv.id 
                    ? "bg-blue-50 text-blue-600" 
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 底部用户信息 */}
        <div className="p-3 border-t space-y-1">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="头像" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-sm text-gray-700 flex-1">{user?.username || '用户'}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          {user?.is_admin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">管理后台</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600"
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
          className="absolute left-2 top-3 z-10 p-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm border"
        >
          <PanelLeft className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

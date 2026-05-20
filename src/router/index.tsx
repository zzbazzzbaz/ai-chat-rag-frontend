import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Loading } from '@/components/common'
import { useAuthStore } from '@/stores'

const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const UserLayout = lazy(() => import('@/components/layout/UserLayout'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const Chat = lazy(() => import('@/pages/chat/Chat'))
const Profile = lazy(() => import('@/pages/user/Profile'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'))
const KnowledgeManagement = lazy(() => import('@/pages/admin/KnowledgeManagement'))
const ConversationManagement = lazy(() => import('@/pages/admin/ConversationManagement'))
const RecommendedQuestions = lazy(() => import('@/pages/admin/RecommendedQuestions'))
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettings'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loading size="lg" /></div>}>
      {children}
    </Suspense>
  )
}

// 需要登录的路由守卫
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useAuthStore((s) => s.initialized)
  const user = useAuthStore((s) => s.user)
  
  // 未初始化时，如果有本地缓存的用户信息则继续渲染，否则显示 loading
  if (!initialized && !user) {
    return <div className="flex h-screen items-center justify-center"><Loading size="lg" /></div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// 需要管理员权限的路由守卫
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useAuthStore((s) => s.initialized)
  
  // 未初始化时，如果有本地缓存的用户信息则继续渲染，否则显示 loading
  if (!initialized && !user) {
    return <div className="flex h-screen items-center justify-center"><Loading size="lg" /></div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!user?.is_admin) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <SuspenseWrapper><Login /></SuspenseWrapper>,
  },
  {
    path: '/register',
    element: <SuspenseWrapper><Register /></SuspenseWrapper>,
  },
  // 前台路由
  {
    path: '/',
    element: (
      <RequireAuth>
        <SuspenseWrapper><UserLayout /></SuspenseWrapper>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <SuspenseWrapper><Chat /></SuspenseWrapper> },
      { path: 'chat/:id', element: <SuspenseWrapper><Chat /></SuspenseWrapper> },
      { path: 'profile', element: <SuspenseWrapper><Profile /></SuspenseWrapper> },
    ],
  },
  // 后台路由
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <SuspenseWrapper><AdminLayout /></SuspenseWrapper>
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
      { path: 'users', element: <SuspenseWrapper><UserManagement /></SuspenseWrapper> },
      { path: 'knowledge', element: <SuspenseWrapper><KnowledgeManagement /></SuspenseWrapper> },
      { path: 'conversations', element: <SuspenseWrapper><ConversationManagement /></SuspenseWrapper> },
      { path: 'questions', element: <SuspenseWrapper><RecommendedQuestions /></SuspenseWrapper> },
      { path: 'settings', element: <SuspenseWrapper><SystemSettings /></SuspenseWrapper> },
    ],
  },
], {
  basename: import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL,
})

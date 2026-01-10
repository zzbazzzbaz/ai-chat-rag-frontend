import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { toast } from '@/components/common'
import { Rocket } from 'lucide-react'

// 星星组件
function Stars() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([])
  
  useEffect(() => {
    const newStars = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-blue-400/40 animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast('请填写用户名和密码', 'error')
      return
    }
    try {
      await login({ username, password })
      toast('登录成功', 'success')
      navigate('/')
    } catch (error) {
      toast(error instanceof Error ? error.message : '登录失败', 'error')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* 星星背景 */}
      <Stars />
      
      {/* 装饰性光晕 */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-200/50 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-xl shadow-blue-100/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">航天知识库</h1>
            <p className="text-sm text-slate-500 mt-1">探索无限知识宇宙</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full px-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-medium rounded-xl hover:from-sky-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  发射中...
                </span>
              ) : '启动登录'}
            </button>
          </form>

          {/* 注册链接 */}
          <p className="mt-6 text-center text-sm text-slate-500">
            还没有账号？
            <Link to="/register" className="text-blue-500 hover:text-blue-600 ml-1 font-medium transition-colors">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

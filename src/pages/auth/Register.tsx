import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { toast, Stars } from '@/components/common'
import { Rocket } from 'lucide-react'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast('请填写用户名和密码', 'error')
      return
    }
    if (password !== confirmPassword) {
      toast('两次输入的密码不一致', 'error')
      return
    }
    if (username.length < 3 || username.length > 20) {
      toast('用户名长度需要在 3-20 个字符之间', 'error')
      return
    }
    if (password.length < 6 || password.length > 20) {
      toast('密码长度需要在 6-20 个字符之间', 'error')
      return
    }
    try {
      await register({ username, password, confirm_password: confirmPassword })
      toast('注册成功', 'success')
      navigate('/')
    } catch (error) {
      toast(error instanceof Error ? error.message : '注册失败', 'error')
    }
  }

  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center deep-page overflow-hidden">
      {/* 微光背景 */}
      <Stars />

      {/* 注册卡片 */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="deep-panel-strong rounded-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl deep-glow-icon flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-sky-50">创建个人知识库账号</h1>
            <p className="text-sm text-blue-200/75 mt-1">开始管理你的知识资料</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名 (3-20 个字符)"
                className="w-full px-4 py-3 deep-input rounded-xl transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码 (6-20 个字符)"
                className="w-full px-4 py-3 deep-input rounded-xl transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认密码"
                className="w-full px-4 py-3 deep-input rounded-xl transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 deep-btn-primary font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  注册中...
                </span>
              ) : '立即注册'}
            </button>
          </form>

          {/* 登录链接 */}
          <p className="mt-6 text-center text-sm text-blue-200/75">
            已有账号？
            <Link to="/login" className="text-cyan-300 hover:text-cyan-100 ml-1 font-medium transition-colors">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

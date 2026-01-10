import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/common'
import { MessageSquare } from 'lucide-react'

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>创建知识库问答助手账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">用户名</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3-20 个字符"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6-20 个字符"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">确认密码</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            已有账号？<Link to="/login" className="text-blue-600 hover:underline">立即登录</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

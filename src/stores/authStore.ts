import { create } from 'zustand'
import { authApi } from '@/api'
import type { User, LoginParams, RegisterParams } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (params: LoginParams) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (params) => {
    set({ loading: true })
    try {
      const res = await authApi.login(params)
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ 
        token: res.access_token, 
        user: res.user,
        isAuthenticated: true,
        loading: false 
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  register: async (params) => {
    set({ loading: true })
    try {
      await authApi.register(params)
      // 注册成功后自动登录
      await get().login({ username: params.username, password: params.password })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // 忽略错误
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false })
      return
    }
    
    try {
      const user = await authApi.me()
      set({ user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))

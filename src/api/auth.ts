import request from './request'
import type { LoginParams, RegisterParams, LoginResponse, User } from '@/types'

export const authApi = {
  // 用户注册
  register: (data: RegisterParams) => 
    request.post<unknown, { id: number; username: string; created_at: string }>('/auth/register', data),
  
  // 用户登录
  login: (data: LoginParams) => 
    request.post<unknown, LoginResponse>('/auth/login', data),
  
  // 退出登录
  logout: () => 
    request.post('/auth/logout'),
  
  // 获取当前用户
  me: () => 
    request.get<unknown, User>('/auth/me'),
}

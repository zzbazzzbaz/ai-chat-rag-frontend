import request from './request'
import type { User, UserStats } from '@/types'

export const userApi = {
  // 获取个人信息
  getProfile: () => 
    request.get<unknown, User>('/user/profile'),
  
  // 获取使用统计
  getStats: () => 
    request.get<unknown, UserStats>('/user/stats'),
}

import axios from 'axios'
import type { ApiResponse } from '@/types'

const request = axios.create({
  baseURL: `${import.meta.env.BASE_URL}api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<unknown>
    if (res.code !== 0) {
      // 业务错误
      if (res.code === 2001) {
        // Token 过期
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = `${import.meta.env.BASE_URL}login`
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data as never
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = `${import.meta.env.BASE_URL}login`
    }
    return Promise.reject(error)
  }
)

export default request

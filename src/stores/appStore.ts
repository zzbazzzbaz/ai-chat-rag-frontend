import { create } from 'zustand'
import request from '@/api/request'

interface AppInfo {
  app_name: string
  logo_url: string | null
}

interface AppStore {
  appInfo: AppInfo
  loading: boolean
  fetchAppInfo: () => Promise<void>
}

export const useAppStore = create<AppStore>((set) => ({
  appInfo: {
    app_name: '知识库问答助手',
    logo_url: null,
  },
  loading: false,
  fetchAppInfo: async () => {
    set({ loading: true })
    try {
      const data = await request.get<unknown, AppInfo>('/config/app-info')
      set({ appInfo: data })
    } catch (error) {
      console.error('获取应用信息失败:', error)
    } finally {
      set({ loading: false })
    }
  },
}))

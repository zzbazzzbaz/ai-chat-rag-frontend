import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ToastContainer } from '@/components/common'
import { useEffect } from 'react'
import { useAuthStore, useAppStore } from '@/stores'

function App() {
  const loadUser = useAuthStore((s) => s.loadUser)
  const { appInfo, fetchAppInfo } = useAppStore()

  useEffect(() => {
    loadUser()
    fetchAppInfo()
  }, [loadUser, fetchAppInfo])

  // 动态更新页面标题和 favicon
  useEffect(() => {
    document.title = appInfo.app_name
    
    if (appInfo.logo_url) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) {
        link.href = appInfo.logo_url
      }
    }
  }, [appInfo.app_name, appInfo.logo_url])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App

import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ToastContainer } from '@/components/common'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores'

function App() {
  const loadUser = useAuthStore((s) => s.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

export default App

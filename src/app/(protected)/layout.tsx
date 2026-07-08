'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'
import { ToastContainer } from 'react-toastify'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        
        <div className="flex-1 flex flex-col md:ml-64">
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
          
          <BottomNav />
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </>
  )
}
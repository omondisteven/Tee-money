'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'

const publicPages = ['/login', '/register']

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isPublicPage = publicPages.includes(pathname || '')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          setIsAuthenticated(true)
          // If on a public page but authenticated, redirect to dashboard
          if (isPublicPage) {
            router.push('/dashboard')
          }
        } else {
          setIsAuthenticated(false)
          // If on a protected page and not authenticated, redirect to login
          if (!isPublicPage) {
            router.push('/login')
          }
        }
      } catch (error) {
        setIsAuthenticated(false)
        if (!isPublicPage) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, isPublicPage, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // For public pages (login/register), render without layout
  if (isPublicPage) {
    return <>{children}</>
  }

  // For authenticated pages, render with full layout
  return (
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
  )
}
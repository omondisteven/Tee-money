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
  const pathname = usePathname()
  const router = useRouter()

  const isPublicPage = publicPages.includes(pathname || '')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok && !isPublicPage) {
          router.push('/login')
        }
      } catch (error) {
        if (!isPublicPage) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, isPublicPage, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile: slides in, Desktop: always visible */}
      <div 
        className={`
          fixed md:relative inset-y-0 left-0 z-50 
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          transition-transform duration-300 ease-in-out
          w-64 flex-shrink-0
        `}
      >
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          isMobileMenuOpen={sidebarOpen}
        />
        
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
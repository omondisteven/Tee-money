'use client'

import { useEffect, useState } from 'react'
import { FiMenu, FiUser, FiBell } from 'react-icons/fi'

interface User {
  name: string
  email: string
}

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {getGreeting()}, {user?.name || 'User'} 👋
            </h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              Welcome back to your dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <FiBell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3 border-l border-gray-200 pl-3">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
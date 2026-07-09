'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiMenu, 
  FiUser, 
  FiBell, 
  FiLogOut, 
  FiSettings, 
  FiUser as FiUserIcon,
  FiX,
  FiChevronDown
} from 'react-icons/fi'
import { toast } from 'react-toastify'

interface User {
  name: string
  email: string
}

interface TopbarProps {
  onMenuClick?: () => void
  isMobileMenuOpen?: boolean
}

export default function Topbar({ onMenuClick, isMobileMenuOpen }: TopbarProps) {
  const [user, setUser] = useState<User | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to TeeMoney! 🎉', read: false },
    { id: 2, message: 'Start tracking your expenses today', read: false },
  ])
  const router = useRouter()
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  const handleNotificationClick = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    setShowNotifications(false)
    toast.info('Notification marked as read')
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left section: Menu button + Greeting */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5 text-gray-600" />
            ) : (
              <FiMenu className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-gray-800">
              {getGreeting()}, {user?.name || 'User'} 👋
            </h2>
            <p className="text-sm text-gray-500">
              Welcome back to your dashboard
            </p>
          </div>
          <div className="sm:hidden">
            <h2 className="text-base font-semibold text-gray-800">
              {getGreeting().split(' ')[0]}
            </h2>
          </div>
        </div>

        {/* Right section: Notifications + Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications Button */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              aria-label="Notifications"
            >
              <FiBell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <p className={`text-sm ${!notification.read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <span className="inline-block mt-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiBell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Button */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email || 'user@email.com'}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      router.push('/dashboard')
                    }}
                    className="w-full text-left flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <FiUserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      router.push('/profile')
                    }}
                    className="w-full text-left flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <FiSettings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      handleLogout()
                    }}
                    className="w-full text-left flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
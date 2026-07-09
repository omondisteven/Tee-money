'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiTrendingUp, 
  FiPieChart, 
  FiTarget, 
  FiLogOut,
  FiUser
} from 'react-icons/fi'

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/transactions', icon: FiTrendingUp, label: 'Transactions' },
  { path: '/budgets', icon: FiPieChart, label: 'Budgets' },
  { path: '/goals', icon: FiTarget, label: 'Goals' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 shadow-soft">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">$</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Finance Tracker</h1>
            <p className="text-xs text-gray-500">Manage your money</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-8 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          )
        })}

        {/* Profile Link */}
        <Link
          href="/profile"
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/profile'
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <FiUser className={`w-5 h-5 ${pathname === '/profile' ? 'text-blue-600' : ''}`} />
          <span className="font-medium">Profile</span>
          {pathname === '/profile' && (
            <div className="ml-auto w-1.5 h-8 bg-blue-600 rounded-full"></div>
          )}
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
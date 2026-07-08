'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiPieChart, 
  FiTarget,
  FiSettings,
  FiTrendingUp
} from 'react-icons/fi'

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Home' },
  { path: '/transactions', icon: FiTrendingUp, label: 'Statistics' },
  { path: '/budgets', icon: FiPieChart, label: 'Budget' },
  { path: '/goals', icon: FiTarget, label: 'Goals' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-1 px-3 py-1 rounded-lg transition-all ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : ''}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
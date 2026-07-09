'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiTrendingUp, 
  FiPieChart, 
  FiTarget,
  FiBarChart2
} from 'react-icons/fi'

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Home' },
  { path: '/transactions', icon: FiTrendingUp, label: 'Trancts' },
  { path: '/budgets', icon: FiPieChart, label: 'Budget' },
  { path: '/goals', icon: FiTarget, label: 'Goals' },
  { path: '/stats', icon: FiBarChart2, label: 'Stats' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white z-40 shadow-lg">
      <div className="flex items-center justify-around h-14 sm:h-16 px-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-lg transition-all min-w-[48px] ${
                isActive 
                  ? 'text-white bg-white/20 backdrop-blur-sm' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-white' : 'text-white/70'}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </div>
              <span className={`text-[9px] sm:text-xs ${isActive ? 'font-semibold text-white' : 'text-white/70'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
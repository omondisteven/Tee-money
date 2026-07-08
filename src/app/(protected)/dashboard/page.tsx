'use client'

import { useEffect, useState } from 'react'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiPlus,
  FiHome,
  FiPieChart,
  FiTarget,
  FiSettings,
  FiGift
} from 'react-icons/fi'
import Link from 'next/link'

interface DashboardData {
  summary: {
    totalIncome: number
    totalExpenses: number
    balance: number
  }
  expensesByCategory: Record<string, number>
  recentTransactions: any[]
  budgets: any[]
  goals: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const dashboardData = await res.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const { summary, recentTransactions } = data || {
    summary: { totalIncome: 0, totalExpenses: 0, balance: 0 },
    recentTransactions: []
  }

  // Get current month
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="pb-20">
      {/* Header with Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 mb-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <h1 className="text-3xl font-bold mt-1">${summary.balance.toFixed(2)}</h1>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
            <FiGift className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs">Total Income</p>
            <p className="text-lg font-semibold text-green-300">
              +${summary.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-xs">{currentMonth}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs">Total Expenses</p>
            <p className="text-lg font-semibold text-red-300">
              -${summary.totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          href="/transactions?type=income"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
            <FiTrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Income</span>
        </Link>
        
        <Link
          href="/transactions?type=expense"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <FiTrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Expend</span>
        </Link>
        
        <Link
          href="/transactions/new"
          className="bg-blue-600 rounded-2xl p-4 shadow-sm flex flex-col items-center hover:bg-blue-700 transition-colors"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <FiPlus className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-white">Add</span>
        </Link>
      </div>

      {/* Income vs Expenses Chart Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Your Income</h3>
          <span className="text-2xl">💰</span>
        </div>
        <div className="h-32 flex items-end justify-between gap-2">
          {[40, 60, 30, 80, 50, 70, 45, 65, 35, 75, 55, 85].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${height}%` }}
              />
              <span className="text-[8px] text-gray-400">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
          <Link href="/transactions" className="text-sm text-blue-600 font-medium">
            See All →
          </Link>
        </div>
        
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <FiTrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <FiTrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{transaction.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold text-sm ${
                  transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiDollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Add your first expense to get started!</p>
            <p className="text-sm text-gray-400 mt-1">Track your spending easily</p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import BudgetForm from '@/components/budgets/BudgetForm'
import BudgetList from '@/components/budgets/BudgetList'
import { FiPlus, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remaining: number
  usedPercentage: number
  categoryCount: number
}

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    usedPercentage: 0,
    categoryCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgetSummary()
  }, [refreshKey])

  const fetchBudgetSummary = async () => {
    try {
      const res = await fetch('/api/budgets/summary')
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Error fetching budget summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetAdded = () => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Budgets</h2>
        <p className="text-xs sm:text-sm text-gray-500">Track your spending limits</p>
      </div>

      {/* Total Budget Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-blue-200" />
            <h3 className="font-semibold text-white/90">Total Budget</h3>
          </div>
          <span className="text-xs text-blue-200 bg-white/20 px-3 py-1 rounded-full">
            {summary.categoryCount} {summary.categoryCount === 1 ? 'Category' : 'Categories'}
          </span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">
              ${summary.totalBudget.toFixed(2)}
            </p>
            <p className="text-sm text-blue-200 mt-1">
              Total allocated budget
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-green-300">
              ${summary.remaining.toFixed(2)}
            </p>
            <p className="text-xs text-blue-200">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-blue-200 mb-1">
            <span>Used: ${summary.totalSpent.toFixed(2)}</span>
            <span>{summary.usedPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                summary.usedPercentage > 90 ? 'bg-red-400' :
                summary.usedPercentage > 70 ? 'bg-yellow-400' :
                'bg-green-400'
              }`}
              style={{ width: `${Math.min(summary.usedPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <FiDollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">
            ${summary.totalBudget.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-500">Total Budget</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <FiTrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">
            ${summary.totalSpent.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-500">Total Spent</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <FiTrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">
            ${summary.remaining.toFixed(2)}
          </p>
          <p className="text-[10px] text-gray-500">Remaining</p>
        </div>
      </div>

      {/* Budget List */}
      <BudgetList key={refreshKey} onUpdate={fetchBudgetSummary} />

      {/* Floating Action Button - Mobile Only */}
      <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          aria-label="Set budget"
        >
          <FiPlus className="w-7 h-7" />
        </button>
      </div>

      {/* Desktop Add Button (hidden on mobile) */}
      <div className="hidden md:flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all"
        >
          <FiPlus className="w-5 h-5" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Set Budget</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <BudgetForm onSuccess={handleBudgetAdded} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Import missing icon
import { FiX } from 'react-icons/fi'
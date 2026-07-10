'use client'

import { useState, useEffect } from 'react'
import BudgetForm from '@/components/budgets/BudgetForm'
import BudgetList from '@/components/budgets/BudgetList'
import { FiPlus, FiPieChart, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi'

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
    <div className="pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Budgets</h2>
          <p className="text-xs sm:text-sm text-gray-500">Track your spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Set Budget</span>
        </button>
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

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <BudgetForm onSuccess={handleBudgetAdded} />
        </div>
      )}

      {/* Budget List */}
      <BudgetList key={refreshKey} onUpdate={fetchBudgetSummary} />
    </div>
  )
}
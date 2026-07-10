'use client'

import { useState } from 'react'
import GoalForm from '@/components/goals/GoalForm'
import GoalList from '@/components/goals/GoalList'
import { FiPlus } from 'react-icons/fi'

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleGoalAdded = () => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Financial Goals</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Track your savings goals - update progress from Transactions
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            💡 Goals with progress cannot be deleted. Edit to update name or target amount.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <GoalForm onSuccess={handleGoalAdded} />
        </div>
      )}

      {/* Goal List */}
      <GoalList key={refreshKey} />
    </div>
  )
}
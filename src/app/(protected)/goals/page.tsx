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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <GoalForm onSuccess={handleGoalAdded} />
        </div>
      )}

      <GoalList key={refreshKey} />
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiTrash2, FiTarget, FiCheck, FiX } from 'react-icons/fi'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  icon: string
}

interface GoalListProps {
  readOnly?: boolean
}

export default function GoalList({ readOnly = false }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      } else {
        const errorData = await res.json()
        console.error('Failed to fetch goals:', errorData)
        toast.error('Failed to load goals')
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete goal')
      }

      toast.success('Goal deleted successfully')
      await fetchGoals()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎯</span>
        </div>
        <p className="text-gray-500 font-medium">No goals set</p>
        <p className="text-sm text-gray-400 mt-1">Create your first financial goal!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => {
        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        const daysRemaining = Math.ceil(
          (new Date(goal.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
        const isOverdue = daysRemaining < 0
        const isComplete = percentage >= 100

        return (
          <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{goal.icon || '🎯'}</span>
                <div>
                  <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                  <p className="text-sm text-gray-500">
                    Target: ${goal.targetAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  aria-label="Delete goal"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-800">
                  ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                  {isOverdue 
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days remaining`}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-2">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <FiCheck className="w-3 h-3" />
                  Completed!
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <FiX className="w-3 h-3" />
                  Overdue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  In Progress
                </span>
              )}
            </div>

            {!readOnly && (
              <div className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-2">
                <span className="flex items-center gap-1">
                  <FiTarget className="w-3 h-3" />
                  Update from Transactions page
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
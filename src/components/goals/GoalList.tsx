'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  icon: string
}

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProgress = async (id: string, currentAmount: number) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount }),
      })

      if (!res.ok) {
        throw new Error('Failed to update goal')
      }

      toast.success('Goal progress updated!')
      fetchGoals()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete goal')
      }

      toast.success('Goal deleted successfully')
      fetchGoals()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading goals...</div>
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No goals set. Create your first financial goal!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => {
        const percentage = Math.min(
          (goal.currentAmount / goal.targetAmount) * 100,
          100
        )
        const daysRemaining = Math.ceil(
          (new Date(goal.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )

        return (
          <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{goal.icon}</span>
                <div>
                  <h4 className="font-semibold">{goal.name}</h4>
                  <p className="text-sm text-gray-500">
                    ${goal.currentAmount.toFixed(2)} / $
                    {goal.targetAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(goal.id)}
                className="text-red-600 hover:text-red-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                <span className="text-gray-500">
                  {daysRemaining > 0
                    ? `${daysRemaining} days remaining`
                    : 'Deadline passed'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max={goal.targetAmount}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Update progress"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = parseFloat((e.target as HTMLInputElement).value)
                    if (!isNaN(value) && value >= 0) {
                      handleUpdateProgress(goal.id, value)
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector(
                    `#goal-${goal.id}-input`
                  ) as HTMLInputElement
                  const value = parseFloat(input.value)
                  if (!isNaN(value) && value >= 0) {
                    handleUpdateProgress(goal.id, value)
                  }
                }}
                disabled={updating === goal.id}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updating === goal.id ? '...' : 'Update'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
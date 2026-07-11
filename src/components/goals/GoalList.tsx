'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiTrash2, FiEdit2, FiCheck, FiX, FiTarget, FiSave } from 'react-icons/fi'

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
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<{
    name: string
    targetAmount: string
  }>({
    name: '',
    targetAmount: '',
  })

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
        toast.error('Failed to load goals')
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string, currentAmount: number) => {
    if (currentAmount > 0) {
      toast.error(
        `Cannot delete "${name}" - it has progress of $${currentAmount.toFixed(2)}. ` +
        `Only goals with no progress can be deleted.`
      )
      return
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete goal')
      }

      toast.success(`Goal "${name}" deleted successfully`)
      await fetchGoals()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditStart = (goal: Goal) => {
    setEditingGoal(goal.id)
    setEditFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
    })
  }

  const handleEditCancel = () => {
    setEditingGoal(null)
    setEditFormData({ name: '', targetAmount: '' })
  }

  const handleEditSave = async (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    if (!editFormData.name.trim()) {
      toast.error('Goal name is required')
      return
    }

    const targetAmount = parseFloat(editFormData.targetAmount)
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error('Please enter a valid target amount')
      return
    }

    if (targetAmount < goal.currentAmount) {
      toast.error(`Target amount cannot be less than current progress ($${goal.currentAmount.toFixed(2)})`)
      return
    }

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          targetAmount: targetAmount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to update goal')
      }

      toast.success('Goal updated successfully!')
      setEditingGoal(null)
      setEditFormData({ name: '', targetAmount: '' })
      await fetchGoals()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update goal')
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
        const hasProgress = goal.currentAmount > 0
        const isEditing = editingGoal === goal.id

        return (
          <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            {/* Header with Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-3xl">{goal.icon || '🎯'}</span>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Goal name"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h4 className="font-semibold text-gray-800 truncate">{goal.name}</h4>
                  )}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Target:</span>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={editFormData.targetAmount}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                          className="w-24 pl-5 pr-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 truncate">
                      Target: ${goal.targetAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => handleEditSave(goal.id)}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors rounded-lg hover:bg-green-50"
                      aria-label="Save changes"
                      title="Save changes"
                    >
                      <FiSave className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                      aria-label="Cancel edit"
                      title="Cancel"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditStart(goal)}
                      className="p-2 text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                      aria-label="Edit goal"
                      title="Edit goal"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id, goal.name, goal.currentAmount)}
                      className={`p-2 transition-colors rounded-lg ${
                        hasProgress
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      aria-label="Delete goal"
                      title={hasProgress ? 'Cannot delete goal with progress' : 'Delete goal'}
                      disabled={hasProgress}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
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

            {/* Status Badges */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
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
              {hasProgress && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <FiTarget className="w-3 h-3" />
                  ${goal.currentAmount.toFixed(2)} saved
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
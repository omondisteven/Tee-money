'use client'

import { useEffect, useState } from 'react'
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
}

interface BudgetListProps {
  onUpdate?: () => void
}

export default function BudgetList({ onUpdate }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState<string>('')

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets')
      if (res.ok) {
        const data = await res.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, category: string) => {
    if (!confirm(`Delete budget for "${category}"?`)) return

    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete budget')
      }

      toast.success(`Budget for "${category}" deleted`)
      await fetchBudgets()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditStart = (budget: Budget) => {
    setEditingId(budget.id)
    setEditAmount(budget.amount.toString())
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditAmount('')
  }

  const handleEditSave = async (id: string) => {
    const newAmount = parseFloat(editAmount)
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: newAmount }),
      })

      if (!res.ok) {
        throw new Error('Failed to update budget')
      }

      toast.success('Budget updated successfully')
      setEditingId(null)
      setEditAmount('')
      await fetchBudgets()
      if (onUpdate) onUpdate()
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

  if (budgets.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiPieChart className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No budgets set</p>
        <p className="text-sm text-gray-400 mt-1">Create your first budget</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
        const isOverBudget = budget.spent > budget.amount

        return (
          <div key={budget.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800">{budget.category}</h4>
                  {isOverBudget && (
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      Over Budget
                    </span>
                  )}
                </div>
                {editingId === budget.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-32 pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => handleEditSave(budget.id)}
                      className="p-1.5 text-green-600 hover:text-green-700 transition-colors rounded-lg hover:bg-green-50"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Budget: ${budget.amount.toFixed(2)} · Spent: ${budget.spent.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditStart(budget)}
                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                  aria-label="Edit budget"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(budget.id, budget.category)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  aria-label="Delete budget"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    isOverBudget ? 'bg-red-600' :
                    percentage > 70 ? 'bg-yellow-500' :
                    'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={`font-medium ${
                  isOverBudget ? 'text-red-600' :
                  percentage > 70 ? 'text-yellow-600' :
                  'text-gray-500'
                }`}>
                  {isOverBudget ? '⚠️ Over budget!' :
                   percentage > 70 ? '⚠️ Close to limit' :
                   `${percentage.toFixed(1)}% used`}
                </span>
                <span className="text-gray-500">
                  ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Import missing icon
import { FiPieChart } from 'react-icons/fi'
'use client'

import { useEffect, useState } from 'react'
import { FiTrash2, FiEdit2, FiCheck, FiX, FiPieChart } from 'react-icons/fi'
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

// Color palette for categories
const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FF8A5C', '#A8E6CF', '#FFB7B2', '#B5B8C3',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F1948A', '#82E0AA',
  '#F8C471', '#A3E4D7', '#D7BDE2', '#FADBD8', '#A9DFBF',
  '#F5CBA7', '#AED6F1', '#D5F5E3', '#FAD7A0', '#D2B4DE'
]

function getColorForCategory(categoryName: string): string {
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % categoryColors.length
  return categoryColors[index]
}

function getTextColorForBackground(hexColor: string) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#333333' : '#FFFFFF'
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
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete budget')
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

  // This is the key fix - using the same logic as BudgetForm
  const handleEditSave = async (id: string) => {
    const newAmount = parseFloat(editAmount)
    
    // Validate amount
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0')
      return
    }

    // Find the budget to check current spent amount
    const budget = budgets.find(b => b.id === id)
    if (budget && newAmount < budget.spent) {
      toast.error(`Amount cannot be less than already spent ($${budget.spent.toFixed(2)})`)
      return
    }

    try {
      // Use the same API call pattern that works in BudgetForm
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          category: budget?.category,
          amount: newAmount 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to update budget')
      }

      toast.success(`Budget updated for "${budget?.category}"`)
      setEditingId(null)
      setEditAmount('')
      await fetchBudgets()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update budget')
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
        const bgColor = getColorForCategory(budget.category)
        const textColor = getTextColorForBackground(bgColor)

        return (
          <div key={budget.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: bgColor }}
                  />
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
                      aria-label="Save changes"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                      aria-label="Cancel edit"
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
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: isOverBudget ? '#EF4444' : bgColor,
                  }}
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
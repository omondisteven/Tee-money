'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiCheck, FiX, FiTarget } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  isDefault: boolean
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  icon: string
}

// Predefined color palette for categories and goals
const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#FF8A5C', '#A8E6CF', '#FFB7B2', '#B5B8C3',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F1948A', '#82E0AA',
  '#F8C471', '#A3E4D7', '#D7BDE2', '#FADBD8', '#A9DFBF',
  '#F5CBA7', '#AED6F1', '#D5F5E3', '#FAD7A0', '#D2B4DE'
]

function getRandomColor() {
  return categoryColors[Math.floor(Math.random() * categoryColors.length)]
}

function getTextColorForBackground(hexColor: string) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#333333' : '#FFFFFF'
}

type TransactionType = 'INCOME' | 'EXPENSE' | 'GOAL_UPDATE'

export default function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({})
  const [goalColorMap, setGoalColorMap] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as TransactionType,
    category: '',
    goalId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (formData.type === 'GOAL_UPDATE') {
      fetchGoals()
    } else {
      fetchCategories(formData.type)
    }
  }, [formData.type])

  // Generate random colors for categories
  useEffect(() => {
    const colorMap: Record<string, string> = {}
    categories.forEach(cat => {
      colorMap[cat.id] = getRandomColor()
    })
    setCategoryColorMap(colorMap)
  }, [categories])

  // Generate random colors for goals
  useEffect(() => {
    const colorMap: Record<string, string> = {}
    goals.forEach(goal => {
      colorMap[goal.id] = getRandomColor()
    })
    setGoalColorMap(colorMap)
  }, [goals])

  const fetchCategories = async (type: string) => {
    try {
      const res = await fetch(`/api/categories?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].name }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
        if (data.length > 0 && !formData.goalId) {
          setFormData(prev => ({ ...prev, goalId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          type: formData.type,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create category')
      }

      const newCategory = await res.json()
      setCategories([...categories, newCategory])
      setFormData(prev => ({ ...prev, category: newCategory.name }))
      setNewCategoryName('')
      setIsAddingCategory(false)
      toast.success('Category added successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      }

      if (formData.type === 'GOAL_UPDATE') {
        if (!formData.goalId) {
          toast.error('Please select a goal')
          setLoading(false)
          return
        }
        payload.goalId = formData.goalId
        payload.category = 'Goal Update'
      } else {
        if (!formData.category) {
          toast.error('Please select a category')
          setLoading(false)
          return
        }
        payload.category = formData.category
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create transaction')
      }

      toast.success('Transaction added successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderTypeSelector = () => (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() => {
          setFormData({ ...formData, type: 'INCOME', category: '', goalId: '' })
          setIsAddingCategory(false)
          setNewCategoryName('')
        }}
        className={`py-3 rounded-xl font-medium transition-colors ${
          formData.type === 'INCOME'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        Income
      </button>
      <button
        type="button"
        onClick={() => {
          setFormData({ ...formData, type: 'EXPENSE', category: '', goalId: '' })
          setIsAddingCategory(false)
          setNewCategoryName('')
        }}
        className={`py-3 rounded-xl font-medium transition-colors ${
          formData.type === 'EXPENSE'
            ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        Expense
      </button>
      <button
        type="button"
        onClick={() => {
          setFormData({ ...formData, type: 'GOAL_UPDATE', category: '', goalId: '' })
          setIsAddingCategory(false)
          setNewCategoryName('')
        }}
        className={`py-3 rounded-xl font-medium transition-colors ${
          formData.type === 'GOAL_UPDATE'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        <span className="flex items-center justify-center gap-1">
          <FiTarget className="w-4 h-4" />
          Goal
        </span>
      </button>
    </div>
  )

  const renderCategoryGrid = () => {
    if (formData.type === 'GOAL_UPDATE') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Goal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((goal) => {
              const bgColor = goalColorMap[goal.id] || '#6B7280'
              const textColor = getTextColorForBackground(bgColor)
              const isSelected = formData.goalId === goal.id
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, goalId: goal.id })
                    setIsAddingCategory(false)
                    setNewCategoryName('')
                  }}
                  className="p-3 rounded-xl text-left transition-all border-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    borderColor: isSelected ? '#ffffff' : bgColor,
                    boxShadow: isSelected ? '0 0 0 2px #3B82F6, 0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.icon || '🎯'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{goal.name}</p>
                      <p className="text-xs opacity-80">
                        ${goal.currentAmount.toFixed(0)} / ${goal.targetAmount.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-white/50 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  {isSelected && (
                    <span className="absolute top-1 right-1 text-[10px]">✓</span>
                  )}
                </button>
              )
            })}
          </div>
          {goals.length === 0 && (
            <div className="text-center py-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">No goals set</p>
              <p className="text-xs text-gray-400">Create a goal in the Goals page first</p>
            </div>
          )}
        </div>
      )
    }

    // Income/Expense categories
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const bgColor = categoryColorMap[cat.id] || '#6B7280'
            const textColor = getTextColorForBackground(bgColor)
            const isSelected = formData.category === cat.name
            
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, category: cat.name })
                  setIsAddingCategory(false)
                  setNewCategoryName('')
                }}
                className="py-2 px-3 rounded-xl text-sm font-medium transition-all border-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 relative"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  borderColor: isSelected ? '#ffffff' : bgColor,
                  boxShadow: isSelected ? '0 0 0 2px #3B82F6, 0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <span className="flex items-center justify-center gap-1">
                  {cat.name}
                  {isSelected && <span className="text-[10px]">✓</span>}
                </span>
                {cat.isDefault && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-white/80 text-gray-700 rounded-full px-1">
                    D
                  </span>
                )}
              </button>
            )
          })}
          
          {/* Add New Category Button */}
          {!isAddingCategory ? (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="py-2 px-3 rounded-xl text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center gap-1"
            >
              <FiPlus className="w-4 h-4" />
              Add New
            </button>
          ) : (
            <div className="col-span-3 bg-gray-50 rounded-xl p-3 border-2 border-blue-300">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Enter category name..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCategory()
                    }
                    if (e.key === 'Escape') {
                      setIsAddingCategory(false)
                      setNewCategoryName('')
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  aria-label="Save category"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false)
                    setNewCategoryName('')
                  }}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  aria-label="Cancel"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter to save, Escape to cancel</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderTypeSelector()}
      
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount ($)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
            $
          </span>
          <input
            type="number"
            required
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-4 text-2xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
      </div>

      {renderCategoryGrid()}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <input
          type="text"
          placeholder="Add a note..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date
        </label>
        <input
          type="date"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={loading || (formData.type !== 'GOAL_UPDATE' ? !formData.category : !formData.goalId)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-lg"
      >
        {loading ? 'Adding...' : 'Save'}
      </button>
    </form>
  )
}
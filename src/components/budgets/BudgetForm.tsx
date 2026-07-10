'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  isDefault: boolean
}

interface ExistingBudget {
  category: string
  amount: number
  spent: number
}

// Predefined color palette for categories
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

interface BudgetFormProps {
  onSuccess: () => void
}

export default function BudgetForm({ onSuccess }: BudgetFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [existingBudgets, setExistingBudgets] = useState<ExistingBudget[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({})
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [duplicateCategory, setDuplicateCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchExistingBudgets()
  }, [])

  // Generate random colors for categories
  useEffect(() => {
    const colorMap: Record<string, string> = {}
    categories.forEach(cat => {
      colorMap[cat.id] = getRandomColor()
    })
    setCategoryColorMap(colorMap)
  }, [categories])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=EXPENSE')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].name }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchExistingBudgets = async () => {
    try {
      const res = await fetch('/api/budgets')
      if (res.ok) {
        const data = await res.json()
        setExistingBudgets(data)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const handleCategorySelect = (categoryName: string) => {
    // Check if this category already has a budget
    const existing = existingBudgets.find(b => b.category === categoryName)
    
    if (existing) {
      setDuplicateCategory(categoryName)
      setShowDuplicateWarning(true)
      // Still select the category but show warning
      setFormData(prev => ({ ...prev, category: categoryName }))
    } else {
      setDuplicateCategory(null)
      setShowDuplicateWarning(false)
      setFormData(prev => ({ ...prev, category: categoryName }))
      setIsAddingCategory(false)
      setNewCategoryName('')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    // Check if category already exists in budgets
    const existing = existingBudgets.find(b => b.category === newCategoryName.trim())
    if (existing) {
      toast.error(`"${newCategoryName.trim()}" already has a budget set. Please edit the existing budget.`)
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          type: 'EXPENSE',
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
      // Refresh existing budgets
      await fetchExistingBudgets()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditExisting = () => {
    if (duplicateCategory) {
      setShowDuplicateWarning(false)
      // The user can now edit the amount for the existing category
      toast.info(`Edit the budget for "${duplicateCategory}" by changing the amount below.`)
    }
  }

  const handleProceedAnyway = () => {
    setShowDuplicateWarning(false)
    toast.warning(`You're setting a new budget for "${duplicateCategory}". The existing budget will be updated.`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category) {
      toast.error('Please select a category')
      return
    }

    const existing = existingBudgets.find(b => b.category === formData.category)
    if (existing && !showDuplicateWarning) {
      // If the user selected a category with existing budget and dismissed warning,
      // they might want to update it
      const confirmUpdate = confirm(
        `"${formData.category}" already has a budget of $${existing.amount.toFixed(2)}.\n\n` +
        `Do you want to update it to $${parseFloat(formData.amount).toFixed(2)}?`
      )
      if (!confirmUpdate) {
        return
      }
    }

    setLoading(true)

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to set budget')
      }

      toast.success(`Budget set successfully for "${formData.category}"!`)
      setShowDuplicateWarning(false)
      setDuplicateCategory(null)
      await fetchExistingBudgets()
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Get existing budget info for the selected category
  const getExistingBudgetInfo = () => {
    if (!formData.category) return null
    return existingBudgets.find(b => b.category === formData.category)
  }

  const existingInfo = getExistingBudgetInfo()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Duplicate Warning Banner */}
      {showDuplicateWarning && duplicateCategory && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800">Budget Already Exists</h4>
              <p className="text-sm text-amber-700 mt-1">
                "{duplicateCategory}" already has a budget of 
                ${existingBudgets.find(b => b.category === duplicateCategory)?.amount.toFixed(2)}.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleEditExisting}
                  className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  Edit Existing
                </button>
                <button
                  type="button"
                  onClick={handleProceedAnyway}
                  className="px-3 py-1 text-sm bg-amber-200 text-amber-900 rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const bgColor = categoryColorMap[cat.id] || '#6B7280'
            const textColor = getTextColorForBackground(bgColor)
            const isSelected = formData.category === cat.name
            const hasBudget = existingBudgets.some(b => b.category === cat.name)
            
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 relative ${
                  hasBudget ? 'ring-2 ring-amber-400 ring-offset-1' : ''
                }`}
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
                {hasBudget && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-white rounded-full px-1">
                    $
                  </span>
                )}
                {cat.isDefault && !hasBudget && (
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

        {/* Existing Budget Info */}
        {existingInfo && !showDuplicateWarning && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="w-3 h-3" />
            <span>
              Existing: ${existingInfo.amount.toFixed(2)} · 
              Spent: ${existingInfo.spent.toFixed(2)} 
              {existingInfo.spent > 0 && ` · ${((existingInfo.spent / existingInfo.amount) * 100).toFixed(0)}% used`}
            </span>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">
          💡 Only expense categories can be used for budgets
          {existingInfo && ` · 🔄 This category already has a budget`}
        </p>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monthly Budget ($)
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
            className="w-full pl-8 pr-4 py-4 text-2xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        {existingInfo && !showDuplicateWarning && (
          <p className="text-xs text-gray-400 mt-1">
            Current budget: ${existingInfo.amount.toFixed(2)}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !formData.category}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-lg"
      >
        {loading ? 'Setting Budget...' : existingInfo ? 'Update Budget' : 'Set Budget'}
      </button>
    </form>
  )
}
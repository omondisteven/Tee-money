'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiPlus, FiCheck, FiX } from 'react-icons/fi'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  isDefault: boolean
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
  // Simple contrast checker - returns white for dark colors, black for light colors
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#333333' : '#FFFFFF'
}

export default function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchCategories(formData.type as 'INCOME' | 'EXPENSE')
  }, [formData.type])

  // Generate random colors for categories whenever they change
  useEffect(() => {
    const colorMap: Record<string, string> = {}
    categories.forEach(cat => {
      colorMap[cat.id] = getRandomColor()
    })
    setCategoryColorMap(colorMap)
  }, [categories])

  const fetchCategories = async (type: string) => {
    try {
      const res = await fetch(`/api/categories?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
        // Auto-select first category if none selected
        if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].name }))
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
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
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
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

  const availableCategories = categories || []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setFormData({ ...formData, type: 'INCOME', category: '' })
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
            setFormData({ ...formData, type: 'EXPENSE', category: '' })
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
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount
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

      {/* Category Grid with Permanent Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableCategories.map((cat) => {
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
                className="py-2 px-3 rounded-xl text-sm font-medium transition-all border-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
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
                  {isSelected && (
                    <span className="text-[10px]">✓</span>
                  )}
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
        disabled={loading || !formData.category}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 text-lg"
      >
        {loading ? 'Adding...' : 'Save'}
      </button>
    </form>
  )
}
'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

const categories = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Healthcare', 'Entertainment', 'Education', 'Other'],
}

export default function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

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

  const availableCategories = categories[formData.type as keyof typeof categories] || []

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'INCOME', category: '' })}
          className={`py-3 rounded-xl font-medium transition-colors ${
            formData.type === 'INCOME'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Income
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: '' })}
          className={`py-3 rounded-xl font-medium transition-colors ${
            formData.type === 'EXPENSE'
              ? 'bg-red-500 text-white shadow-md'
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

      {/* Category Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat })}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                formData.category === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
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
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
      >
        {loading ? 'Adding...' : 'Save'}
      </button>
    </form>
  )
}
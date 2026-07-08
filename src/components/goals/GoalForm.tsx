'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

const icons = ['🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💼', '🏥', '🎮', '📚']

export default function GoalForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    icon: '🎯',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create goal')
      }

      toast.success('Goal created successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Goal Name
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Amount ($)
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          >
            {icons.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Creating goal...' : 'Create Goal'}
      </button>
    </form>
  )
}
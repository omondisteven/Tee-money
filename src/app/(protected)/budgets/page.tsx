'use client'

import { useState } from 'react'
import BudgetForm from '@/components/budgets/BudgetForm'
import BudgetList from '@/components/budgets/BudgetList'
import { FiPlus } from 'react-icons/fi'

export default function BudgetsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleBudgetAdded = () => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budgets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Set Budget</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <BudgetForm onSuccess={handleBudgetAdded} />
        </div>
      )}

      <BudgetList key={refreshKey} />
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
}

export default function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading budgets...</div>
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No budgets set. Create your first budget!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
        const isOverBudget = budget.spent > budget.amount

        return (
          <div key={budget.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">{budget.category}</h4>
              <div className="text-sm">
                <span className="font-medium">
                  ${budget.spent.toFixed(2)}
                </span>
                <span className="text-gray-500"> / ${budget.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    isOverBudget ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isOverBudget
                  ? `Over budget by $${(budget.spent - budget.amount).toFixed(2)}`
                  : `${percentage.toFixed(1)}% used`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
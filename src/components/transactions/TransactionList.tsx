'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description?: string
  date: string
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions?limit=50')
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete transaction')
      }

      toast.success('Transaction deleted successfully')
      fetchTransactions()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiTrendingUp className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No transactions yet</p>
        <p className="text-sm text-gray-400 mt-1">Start tracking your finances</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'INCOME' ? (
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <FiTrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{transaction.category}</p>
              <p className="text-xs text-gray-400">
                {new Date(transaction.date).toLocaleDateString()}
                {transaction.description && ` • ${transaction.description}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className={`font-bold ${
              transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </p>
            <button
              onClick={() => handleDelete(transaction.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
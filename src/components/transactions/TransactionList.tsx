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

interface TransactionListProps {
  filter?: 'all' | 'income' | 'expense'
}

export default function TransactionList({ filter = 'all' }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      // Build URL with filter
      let url = '/api/transactions?limit=100'
      if (filter === 'income') {
        url += '&type=INCOME'
      } else if (filter === 'expense') {
        url += '&type=EXPENSE'
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
        setTotalCount(data.total)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
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

  // Get filter label for empty state
  const getFilterLabel = () => {
    switch (filter) {
      case 'income': return 'income'
      case 'expense': return 'expense'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {filter === 'income' ? (
            <FiTrendingUp className="w-10 h-10 text-gray-400" />
          ) : filter === 'expense' ? (
            <FiTrendingDown className="w-10 h-10 text-gray-400" />
          ) : (
            <FiTrendingUp className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <p className="text-gray-500 font-medium">
          No {getFilterLabel()} transactions yet
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {filter === 'all' 
            ? 'Start tracking your finances' 
            : `Add your first ${getFilterLabel()} transaction`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Total count */}
      <p className="text-xs text-gray-400 px-1">
        Showing {transactions.length} {getFilterLabel()} transactions
        {totalCount > transactions.length && ` (${totalCount} total)`}
      </p>

      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'INCOME' ? (
                <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              ) : (
                <FiTrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {transaction.category}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {new Date(transaction.date).toLocaleDateString()}
                {transaction.description && ` • ${transaction.description}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
            <p className={`font-bold text-sm sm:text-base ${
              transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </p>
            <button
              onClick={() => handleDelete(transaction.id)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Delete transaction"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiTrash2, FiEdit2, FiCheck, FiX, FiTrendingUp, FiTrendingDown, FiSave } from 'react-icons/fi'

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE' | 'GOAL_UPDATE'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<{
    amount: string
    description: string
  }>({
    amount: '',
    description: '',
  })

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
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
      } else {
        toast.error('Failed to load transactions')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, category: string) => {
    if (!confirm(`Delete transaction for "${category}"?`)) return

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to delete transaction')
      }

      toast.success(`Transaction for "${category}" deleted`)
      await fetchTransactions()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete transaction')
    }
  }

  const handleEditStart = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditFormData({
      amount: transaction.amount.toString(),
      description: transaction.description || '',
    })
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditFormData({ amount: '', description: '' })
  }

  const handleEditSave = async (id: string) => {
    const newAmount = parseFloat(editFormData.amount)
    
    if (isNaN(newAmount) || newAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const transaction = transactions.find(t => t.id === id)
    if (!transaction) {
      toast.error('Transaction not found')
      return
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transaction.type,
          category: transaction.category,
          amount: newAmount,
          description: editFormData.description || transaction.description,
          date: transaction.date,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to update transaction')
      }

      toast.success('Transaction updated successfully')
      setEditingId(null)
      await fetchTransactions()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update transaction')
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
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiTrendingUp className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No transactions found</p>
        <p className="text-sm text-gray-400 mt-1">Add your first transaction</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                transaction.type === 'INCOME' ? 'bg-green-100' : 
                transaction.type === 'EXPENSE' ? 'bg-red-100' : 'bg-purple-100'
              }`}>
                {transaction.type === 'INCOME' ? (
                  <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                ) : transaction.type === 'EXPENSE' ? (
                  <FiTrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                ) : (
                  <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  {transaction.category}
                </p>
                {editingId === transaction.id ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editFormData.amount}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-32 pl-7 pr-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                    <input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                    {transaction.description && ` • ${transaction.description}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {editingId === transaction.id ? (
                <>
                  <button
                    onClick={() => handleEditSave(transaction.id)}
                    className="p-1.5 text-green-600 hover:text-green-700 transition-colors rounded-lg hover:bg-green-50"
                    aria-label="Save changes"
                  >
                    <FiSave className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
                    aria-label="Cancel edit"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditStart(transaction)}
                    className="p-1.5 text-blue-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                    aria-label="Edit transaction"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id, transaction.category)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    aria-label="Delete transaction"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          {editingId !== transaction.id && (
            <div className="mt-1 text-right">
              <p className={`font-bold text-sm sm:text-base ${
                transaction.type === 'INCOME' ? 'text-green-600' : 
                transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-purple-600'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
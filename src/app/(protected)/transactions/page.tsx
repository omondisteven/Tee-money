'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiX } from 'react-icons/fi'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionList from '@/components/transactions/TransactionList'

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTransactionAdded = () => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          <p className="text-sm text-gray-500">Track your money flow</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-6 h-6" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Add Transaction</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <TransactionForm onSuccess={handleTransactionAdded} />
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <TransactionList key={refreshKey} />
    </div>
  )
}
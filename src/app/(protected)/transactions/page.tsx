'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FiPlus, FiSearch, FiX } from 'react-icons/fi'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionList from '@/components/transactions/TransactionList'

type FilterType = 'all' | 'income' | 'expense'

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filter, setFilter] = useState<FilterType>('all')
  const [counts, setCounts] = useState({ all: 0, income: 0, expense: 0 })

  // Get filter from URL on mount
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'income') {
      setFilter('income')
    } else if (typeParam === 'expense') {
      setFilter('expense')
    } else {
      setFilter('all')
    }
  }, [searchParams])

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [allRes, incomeRes, expenseRes] = await Promise.all([
          fetch('/api/transactions?limit=1'),
          fetch('/api/transactions?limit=1&type=INCOME'),
          fetch('/api/transactions?limit=1&type=EXPENSE'),
        ])
        
        const allData = await allRes.json()
        const incomeData = await incomeRes.json()
        const expenseData = await expenseRes.json()
        
        setCounts({
          all: allData.total || 0,
          income: incomeData.total || 0,
          expense: expenseData.total || 0,
        })
      } catch (error) {
        console.error('Error fetching counts:', error)
      }
    }
    
    fetchCounts()
  }, [])

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    const params = new URLSearchParams()
    if (newFilter !== 'all') {
      params.set('type', newFilter)
    }
    router.push(`/transactions?${params.toString()}`)
    setRefreshKey(prev => prev + 1)
  }

  const handleTransactionAdded = () => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  const getPageTitle = () => {
    switch (filter) {
      case 'income':
        return 'Transactions: Income'
      case 'expense':
        return 'Transactions: Expenses'
      default:
        return 'Transactions: All'
    }
  }

  const getSubtitle = () => {
    switch (filter) {
      case 'income':
        return 'Viewing all your income transactions'
      case 'expense':
        return 'Viewing all your expense transactions'
      default:
        return 'Track your income and expenses'
    }
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
        <p className="text-xs sm:text-sm text-gray-500">{getSubtitle()}</p>
      </div>

      {/* Filter Buttons with Counts */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('all')}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
          <span className={`text-xs ${filter === 'all' ? 'text-blue-200' : 'text-gray-400'}`}>
            ({counts.all})
          </span>
        </button>
        <button
          onClick={() => handleFilterChange('income')}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            filter === 'income'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Income
          <span className={`text-xs ${filter === 'income' ? 'text-green-200' : 'text-gray-400'}`}>
            ({counts.income})
          </span>
        </button>
        <button
          onClick={() => handleFilterChange('expense')}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            filter === 'expense'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expenses
          <span className={`text-xs ${filter === 'expense' ? 'text-red-200' : 'text-gray-400'}`}>
            ({counts.expense})
          </span>
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

      {/* Transaction List */}
      <TransactionList key={refreshKey} filter={filter} />

      {/* Floating Action Button - Mobile Only */}
      <div className="md:hidden fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          aria-label="Add transaction"
        >
          <FiPlus className="w-7 h-7" />
        </button>
      </div>

      {/* Desktop Add Button (hidden on mobile) */}
      <div className="hidden md:flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:shadow-lg transition-all"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
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
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiPlus,
  FiHome,
  FiPieChart,
  FiTarget,
  FiSettings,
  FiGift
} from 'react-icons/fi'
import Link from 'next/link'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface DashboardData {
  summary: {
    totalIncome: number
    totalExpenses: number
    balance: number
  }
  expensesByCategory: Record<string, number>
  incomeByCategory: Record<string, number>
  recentTransactions: any[]
  budgets: any[]
  goals: any[]
  monthlyData: {
    month: string
    income: number
    expenses: number
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const dashboardData = await res.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error loading dashboard data</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const { summary, expensesByCategory, incomeByCategory, recentTransactions, monthlyData } = data

  // Prepare expense chart data
  const expenseCategories = Object.keys(expensesByCategory)
  const expenseAmounts = Object.values(expensesByCategory)
  const hasExpenses = expenseCategories.length > 0 && expenseAmounts.some(a => a > 0)

  // Prepare income chart data
  const incomeCategories = Object.keys(incomeByCategory)
  const incomeAmounts = Object.values(incomeByCategory)
  const hasIncome = incomeCategories.length > 0 && incomeAmounts.some(a => a > 0)

  // Prepare monthly chart data
  const hasMonthlyData = monthlyData && monthlyData.length > 0

  const expenseBarData = {
    labels: expenseCategories,
    datasets: [
      {
        label: 'Expenses',
        data: expenseAmounts,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const monthlyBarData = {
    labels: monthlyData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Income',
        data: monthlyData?.map(d => d.income) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: monthlyData?.map(d => d.expenses) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const doughnutChartData = {
    labels: expenseCategories,
    datasets: [
      {
        data: expenseAmounts,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
      },
    ],
  }

  // Get current month
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="pb-20">
      {/* Header with Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 mb-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Balance</p>
            <h1 className="text-3xl font-bold mt-1">${summary.balance.toFixed(2)}</h1>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
            <FiGift className="w-6 h-6" />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-xs">Total Income</p>
            <p className="text-lg font-semibold text-green-300">
              +${summary.totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-blue-100 text-xs">{currentMonth}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-xs">Total Expenses</p>
            <p className="text-lg font-semibold text-red-300">
              -${summary.totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link
          href="/transactions?type=income"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
            <FiTrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Income</span>
        </Link>
        
        <Link
          href="/transactions?type=expense"
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2">
            <FiTrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Expend</span>
        </Link>
        
        <Link
          href="/transactions"
          className="bg-blue-600 rounded-2xl p-4 shadow-sm flex flex-col items-center hover:bg-blue-700 transition-colors"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
            <FiPlus className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-medium text-white">Add</span>
        </Link>
      </div>

      {/* Monthly Income vs Expenses Chart */}
      {hasMonthlyData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Income vs Expenses</h3>
          <div className="h-48">
            <Bar
              data={monthlyBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      boxWidth: 8,
                      padding: 12,
                      font: {
                        size: 11,
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Expense Breakdown Charts */}
      {hasExpenses && (
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Expense Breakdown</h3>
            <div className="h-48">
              <Bar
                data={expenseBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Category Distribution</h3>
            <div className="h-48 flex items-center justify-center">
              <div className="w-44 h-44">
                <Doughnut
                  data={doughnutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 8,
                          usePointStyle: true,
                          pointStyle: 'circle',
                          font: {
                            size: 10,
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!hasExpenses && !hasIncome && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPieChart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No Data Yet</h3>
          <p className="text-sm text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
          <Link
            href="/transactions"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Link>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
          <Link href="/transactions" className="text-sm text-blue-600 font-medium">
            See All →
          </Link>
        </div>
        
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <FiTrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <FiTrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{transaction.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold text-sm ${
                  transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiDollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first transaction to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
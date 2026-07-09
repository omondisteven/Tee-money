'use client'

import { useEffect, useState } from 'react'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiCalendar
} from 'react-icons/fi'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface StatsData {
  summary: {
    totalIncome: number
    totalExpenses: number
    balance: number
  }
  monthlyData: {
    month: string
    income: number
    expenses: number
  }[]
  categoryData: {
    category: string
    amount: number
  }[]
  recentTransactions: any[]
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchStats()
  }, [timeRange])

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?range=${timeRange}`)
      if (res.ok) {
        const statsData = await res.json()
        setData(statsData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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
        <p className="text-gray-500">Error loading statistics</p>
      </div>
    )
  }

  const { summary, monthlyData, categoryData } = data

  // Prepare chart data
  const barChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const doughnutChartData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        data: categoryData.map(d => d.amount),
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

  const stats = [
    {
      title: 'Total Balance',
      value: `$${summary.balance.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Income',
      value: `$${summary.totalIncome.toFixed(2)}`,
      icon: FiTrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: `$${summary.totalExpenses.toFixed(2)}`,
      icon: FiTrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="pb-24">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Statistics</h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">View your financial insights</p>

      {/* Time Range Filter */}
      <div className="flex gap-2 mb-4">
        {(['week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              timeRange === range
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-3"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-lg font-bold mt-2">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiBarChart2 className="w-4 h-4 text-blue-600" />
          Income vs Expenses
        </h3>
        <div className="h-52">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 16,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiPieChart className="w-4 h-4 text-blue-600" />
            Category Distribution
          </h3>
          <div className="h-52 flex items-center justify-center">
            <div className="w-48 h-48">
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
      )}

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white">
        <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
          <FiCalendar className="w-4 h-4" />
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-blue-100 text-xs">Average Income</p>
            <p className="text-lg font-bold">
              ${(summary.totalIncome / (monthlyData.length || 1)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Average Expenses</p>
            <p className="text-lg font-bold">
              ${(summary.totalExpenses / (monthlyData.length || 1)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Savings Rate</p>
            <p className="text-lg font-bold">
              {summary.totalIncome > 0 
                ? `${((1 - summary.totalExpenses / summary.totalIncome) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Total Transactions</p>
            <p className="text-lg font-bold">
              {monthlyData.reduce((acc, d) => acc + d.income + d.expenses, 0).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
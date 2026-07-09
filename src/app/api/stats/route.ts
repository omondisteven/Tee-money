import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || 'month'

    // Get date range based on filter
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (range) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    }

    // Get all transactions within date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate summary
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    // Group by month for chart
    const monthlyMap = new Map<string, { income: number; expenses: number }>()
    
    transactions.forEach(t => {
      const month = t.date.toLocaleString('default', { month: 'short' })
      const existing = monthlyMap.get(month) || { income: 0, expenses: 0 }
      
      if (t.type === 'INCOME') {
        existing.income += t.amount
      } else {
        existing.expenses += t.amount
      }
      
      monthlyMap.set(month, existing)
    })

    const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }))

    // Group by category for doughnut chart
    const categoryMap = new Map<string, number>()
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const existing = categoryMap.get(t.category) || 0
        categoryMap.set(t.category, existing + t.amount)
      })

    const categoryData = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6) // Top 6 categories

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
      monthlyData,
      categoryData,
      recentTransactions: transactions.slice(0, 5),
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
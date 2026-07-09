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

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // ========================
    // 1. CURRENT MONTH DATA
    // ========================
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    // Expenses by category (current month)
    const expensesByCategory = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    // ========================
    // 2. YEARLY DATA (Last 6 months)
    // ========================
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const startOfMonthLoop = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonthLoop = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonthLoop,
            lte: endOfMonthLoop,
          },
        },
      })
      
      const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
      
      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        income,
        expenses,
      })
    }

    // ========================
    // 3. RECENT TRANSACTIONS
    // ========================
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
    })

    // ========================
    // 4. BUDGETS & GOALS
    // ========================
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
    })

    const goals = await prisma.goal.findMany({
      where: { userId },
    })

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
      expensesByCategory,
      recentTransactions,
      budgets,
      goals,
      monthlyData,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
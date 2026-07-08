import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get all transactions for this month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    // Get expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5,
    })

    // Get budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: now.getMonth(),
        year: now.getFullYear(),
      },
    })

    // Get goals
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
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
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
    const month = now.getMonth()
    const year = now.getFullYear()

    // Get all budgets for the current month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
    })

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
    const remaining = totalBudget - totalSpent
    const usedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    const categoryCount = budgets.length

    return NextResponse.json({
      totalBudget,
      totalSpent,
      remaining,
      usedPercentage,
      categoryCount,
    })
  } catch (error) {
    console.error('Error fetching budget summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
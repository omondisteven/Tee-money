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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type')

    const where: any = { userId }
    if (type) where.type = type

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: offset,
      take: limit,
    })

    const total = await prisma.transaction.count({ where })

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type, category, goalId, amount, description, date } = await request.json()

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    let transactionData: any = {
      userId,
      type,
      amount: parsedAmount,
      description,
      date: date ? new Date(date) : new Date(),
    }

    if (type === 'GOAL_UPDATE') {
      // Handle goal update
      if (!goalId) {
        return NextResponse.json(
          { error: 'Goal ID is required for goal updates' },
          { status: 400 }
        )
      }

      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
      })

      if (!goal) {
        return NextResponse.json(
          { error: 'Goal not found' },
          { status: 404 }
        )
      }

      if (goal.userId !== userId) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      const newAmount = goal.currentAmount + parsedAmount
      if (newAmount > goal.targetAmount) {
        return NextResponse.json(
          { error: `Amount would exceed goal target of $${goal.targetAmount.toFixed(2)}` },
          { status: 400 }
        )
      }

      // Update goal
      await prisma.goal.update({
        where: { id: goalId },
        data: { currentAmount: newAmount },
      })

      transactionData.goalId = goalId
      transactionData.category = `Goal: ${goal.name}`

      // This is a deduction from wallet (like expense)
      // We'll handle budget updates for goals later
    } else {
      // Handle regular income/expense
      if (!category) {
        return NextResponse.json(
          { error: 'Category is required' },
          { status: 400 }
        )
      }

      // Find or create category
      let categoryRecord = await prisma.category.findFirst({
        where: {
          userId,
          name: category,
          type,
        },
      })

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            type,
            userId,
            isDefault: false,
          },
        })
      }

      transactionData.category = category
      transactionData.categoryId = categoryRecord.id

      // Update budget spent if it's an expense
      if (type === 'EXPENSE') {
        const now = new Date()
        const month = now.getMonth()
        const year = now.getFullYear()

        const budget = await prisma.budget.findUnique({
          where: {
            userId_category_month_year: {
              userId,
              category,
              month,
              year,
            },
          },
        })

        if (budget) {
          await prisma.budget.update({
            where: { id: budget.id },
            data: { spent: budget.spent + parsedAmount },
          })
        }
      }
    }

    const transaction = await prisma.transaction.create({
      data: transactionData,
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
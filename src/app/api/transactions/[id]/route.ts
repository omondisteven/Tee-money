import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type, category, amount, description, date } = await request.json()

    if (!type || !category || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: type, category, amount' },
        { status: 400 }
      )
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const newAmount = parseFloat(amount)
    if (isNaN(newAmount) || newAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // If it was an expense, revert the budget spent
    if (transaction.type === 'EXPENSE') {
      const transactionDate = new Date(transaction.date)
      const month = transactionDate.getMonth()
      const year = transactionDate.getFullYear()

      const budget = await prisma.budget.findUnique({
        where: {
          userId_category_month_year: {
            userId,
            category: transaction.category,
            month,
            year,
          },
        },
      })

      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: budget.spent - transaction.amount },
        })
      }
    }

    // If it was a GOAL_UPDATE, revert the goal progress
    if (transaction.type === 'GOAL_UPDATE' && transaction.goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: transaction.goalId },
      })

      if (goal) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { currentAmount: Math.max(0, goal.currentAmount - transaction.amount) },
        })
      }
    }

    // Update the transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        type,
        category,
        amount: newAmount,
        description,
        date: date ? new Date(date) : new Date(),
      },
    })

    // If it's an expense, update the budget spent
    if (type === 'EXPENSE') {
      const newDate = date ? new Date(date) : new Date()
      const month = newDate.getMonth()
      const year = newDate.getFullYear()

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
          data: { spent: budget.spent + newAmount },
        })
      }
    }

    // If it's a GOAL_UPDATE, update the goal progress
    if (type === 'GOAL_UPDATE' && updatedTransaction.goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: updatedTransaction.goalId },
      })

      if (goal) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { currentAmount: goal.currentAmount + newAmount },
        })
      }
    }

    return NextResponse.json(updatedTransaction)
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // If it's an expense, update the budget spent
    if (transaction.type === 'EXPENSE') {
      const transactionDate = new Date(transaction.date)
      const month = transactionDate.getMonth()
      const year = transactionDate.getFullYear()

      const budget = await prisma.budget.findUnique({
        where: {
          userId_category_month_year: {
            userId,
            category: transaction.category,
            month,
            year,
          },
        },
      })

      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: { spent: budget.spent - transaction.amount },
        })
      }
    }

    // If it's a GOAL_UPDATE, revert the goal progress
    if (transaction.type === 'GOAL_UPDATE' && transaction.goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: transaction.goalId },
      })

      if (goal) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { currentAmount: Math.max(0, goal.currentAmount - transaction.amount) },
        })
      }
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Transaction deleted successfully' 
    })
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
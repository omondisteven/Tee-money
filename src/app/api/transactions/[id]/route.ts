import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()

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
          data: { spent: Math.max(0, budget.spent - transaction.amount) },
        })
      }
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
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

    const { type, category, amount, description, date } = await request.json()

    // If it was an expense, revert the budget spent
    if (transaction.type === 'EXPENSE') {
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()

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
          data: { spent: Math.max(0, budget.spent - transaction.amount) },
        })
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        type,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
      },
    })

    // If it's an expense, update the budget spent
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
          data: { spent: budget.spent + parseFloat(amount) },
        })
      }
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
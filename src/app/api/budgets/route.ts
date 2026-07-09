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

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
    })

    return NextResponse.json(budgets)
  } catch (error) {
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

    const { category, amount } = await request.json()

    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month,
          year,
        },
      },
      update: {
        amount: parseFloat(amount),
      },
      create: {
        userId,
        category,
        amount: parseFloat(amount),
        month,
        year,
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
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
    const category = searchParams.get('category')

    const where: any = { userId }
    if (type) where.type = type
    if (category) where.category = category

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

    const { type, category, amount, description, date } = await request.json()

    // Validate required fields
    if (!type || !category || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      // Create new category if it doesn't exist
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          type,
          userId,
          isDefault: false,
        },
      })
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        category,
        categoryId: categoryRecord.id,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
      },
    })

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
          data: { spent: budget.spent + parseFloat(amount) },
        })
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
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

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    })

    return NextResponse.json(goals)
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

    const { name, targetAmount, deadline, icon } = await request.json()

    const goal = await prisma.goal.create({
      data: {
        userId,
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline),
        icon,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
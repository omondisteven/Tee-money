import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const { name, targetAmount, currentAmount } = await request.json()

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
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

    const updateData: any = {}

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Goal name is required' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (targetAmount !== undefined) {
      const newTarget = parseFloat(targetAmount)
      if (isNaN(newTarget) || newTarget <= 0) {
        return NextResponse.json(
          { error: 'Invalid target amount' },
          { status: 400 }
        )
      }
      if (newTarget < goal.currentAmount) {
        return NextResponse.json(
          { error: `Target amount cannot be less than current progress ($${goal.currentAmount.toFixed(2)})` },
          { status: 400 }
        )
      }
      updateData.targetAmount = newTarget
    }

    if (currentAmount !== undefined) {
      const newCurrent = parseFloat(currentAmount)
      if (isNaN(newCurrent) || newCurrent < 0) {
        return NextResponse.json(
          { error: 'Invalid current amount' },
          { status: 400 }
        )
      }
      if (newCurrent > goal.targetAmount) {
        return NextResponse.json(
          { error: `Current amount cannot exceed target amount` },
          { status: 400 }
        )
      }
      updateData.currentAmount = newCurrent
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedGoal)
  } catch (error: any) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update goal',
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

    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
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

    // Check if goal has progress
    if (goal.currentAmount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete goal with progress' },
        { status: 400 }
      )
    }

    await prisma.goal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}
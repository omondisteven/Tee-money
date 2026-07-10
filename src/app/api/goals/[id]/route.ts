import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT request received for goal ID:', params.id)
    
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      console.log('Unauthorized: No userId found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)

    const { currentAmount } = body

    if (currentAmount === undefined || currentAmount === null) {
      console.log('Missing currentAmount in request')
      return NextResponse.json(
        { error: 'Current amount is required' },
        { status: 400 }
      )
    }

    // Find the goal
    const goal = await prisma.goal.findUnique({
      where: { id: params.id },
    })

    if (!goal) {
      console.log('Goal not found:', params.id)
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    console.log('Found goal:', goal)

    // Check if goal belongs to user
    if (goal.userId !== userId) {
      console.log('Goal belongs to different user:', goal.userId, userId)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Validate amount
    const newAmount = parseFloat(currentAmount)
    if (isNaN(newAmount) || newAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (newAmount > goal.targetAmount) {
      return NextResponse.json(
        { error: `Amount cannot exceed target amount of $${goal.targetAmount.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id: params.id },
      data: {
        currentAmount: newAmount,
      },
    })

    console.log('Goal updated successfully:', updatedGoal)

    return NextResponse.json(updatedGoal)
  } catch (error: any) {
    console.error('Error updating goal:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
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

    await prisma.goal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
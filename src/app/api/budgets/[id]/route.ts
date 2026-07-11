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

    const { amount } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    })

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    if (budget.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (parseFloat(amount) < budget.spent) {
      return NextResponse.json(
        { error: `Amount cannot be less than already spent ($${budget.spent.toFixed(2)})` },
        { status: 400 }
      )
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        amount: parseFloat(amount),
      },
    })

    return NextResponse.json(updatedBudget)
  } catch (error: any) {
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update budget',
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

    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    })

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    if (budget.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if budget has spending
    if (budget.spent > 0) {
      return NextResponse.json(
        { error: 'Cannot delete budget with spending' },
        { status: 400 }
      )
    }

    await prisma.budget.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
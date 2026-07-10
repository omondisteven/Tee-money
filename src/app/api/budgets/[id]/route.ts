import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== BUDGET UPDATE START ===')
    console.log('Budget ID:', params.id)
    
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      console.log('❌ Unauthorized: No userId found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log('📦 Request body:', body)
    } catch (parseError) {
      console.log('❌ Failed to parse request body')
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { amount } = body

    if (amount === undefined || amount === null) {
      console.log('❌ Missing amount in request')
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      )
    }

    // Validate amount
    const newAmount = parseFloat(amount)
    console.log('💰 Parsed amount:', newAmount)

    if (isNaN(newAmount) || newAmount <= 0) {
      console.log('❌ Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid amount. Please enter a valid number greater than 0.' },
        { status: 400 }
      )
    }

    // Find the budget
    console.log('🔍 Finding budget...')
    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    })

    if (!budget) {
      console.log('❌ Budget not found:', params.id)
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found budget:', { 
      id: budget.id, 
      category: budget.category, 
      amount: budget.amount,
      spent: budget.spent,
      userId: budget.userId 
    })

    // Check if budget belongs to user
    if (budget.userId !== userId) {
      console.log('❌ Budget belongs to different user:', budget.userId, userId)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if new amount is less than already spent
    if (newAmount < budget.spent) {
      console.log('❌ Amount cannot be less than already spent:', newAmount, budget.spent)
      return NextResponse.json(
        { error: `Amount cannot be less than already spent ($${budget.spent.toFixed(2)})` },
        { status: 400 }
      )
    }

    // Update the budget
    console.log('🔄 Updating budget...')
    const updatedBudget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        amount: newAmount,
      },
    })

    console.log('✅ Budget updated successfully:', updatedBudget)
    console.log('=== BUDGET UPDATE END ===\n')

    return NextResponse.json(updatedBudget)
  } catch (error: any) {
    console.error('❌ Error updating budget:', error)
    console.error('❌ Error stack:', error.stack)
    console.log('=== BUDGET UPDATE FAILED ===\n')
    
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
    console.log('=== BUDGET DELETE START ===')
    console.log('Budget ID:', params.id)
    
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      console.log('❌ Unauthorized: No userId found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    })

    if (!budget) {
      console.log('❌ Budget not found:', params.id)
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    if (budget.userId !== userId) {
      console.log('❌ Budget belongs to different user')
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.budget.delete({
      where: { id: params.id },
    })

    console.log('✅ Budget deleted successfully')
    console.log('=== BUDGET DELETE END ===\n')

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting budget:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
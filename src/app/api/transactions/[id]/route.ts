// src\app\api\transactions\[id]\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== TRANSACTION DELETE START ===')
    console.log('Transaction ID:', params.id)
    
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      console.log('❌ Unauthorized: No userId found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the transaction
    console.log('🔍 Finding transaction...')
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      console.log('❌ Transaction not found:', params.id)
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found transaction:', { 
      id: transaction.id, 
      type: transaction.type, 
      category: transaction.category,
      amount: transaction.amount,
      userId: transaction.userId 
    })

    // Check if transaction belongs to user
    if (transaction.userId !== userId) {
      console.log('❌ Transaction belongs to different user:', transaction.userId, userId)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // If it's an expense, update the budget spent
    if (transaction.type === 'EXPENSE') {
      console.log('💰 Updating budget for expense...')
      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()

      try {
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
          console.log('✅ Found budget, updating spent...')
          await prisma.budget.update({
            where: { id: budget.id },
            data: { spent: Math.max(0, budget.spent - transaction.amount) },
          })
          console.log('✅ Budget updated successfully')
        } else {
          console.log('ℹ️ No budget found for this category, skipping update')
        }
      } catch (budgetError) {
        console.error('❌ Error updating budget:', budgetError)
        // Don't fail the transaction deletion if budget update fails
        // Just log the error and continue
      }
    }

    // Delete the transaction
    console.log('🗑️ Deleting transaction...')
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    console.log('✅ Transaction deleted successfully')
    console.log('=== TRANSACTION DELETE END ===\n')

    return NextResponse.json({ 
      success: true,
      message: 'Transaction deleted successfully' 
    })
  } catch (error: any) {
    console.error('❌ Error deleting transaction:', error)
    console.error('❌ Error stack:', error.stack)
    console.log('=== TRANSACTION DELETE FAILED ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to delete transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

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
    console.log('=== TRANSACTION UPDATE START ===')
    console.log('Transaction ID:', params.id)
    
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      console.log('❌ Unauthorized: No userId found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
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

    const { type, category, amount, description, date } = body

    if (!type || !category || !amount) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: type, category, amount' },
        { status: 400 }
      )
    }

    // Find the transaction
    console.log('🔍 Finding transaction...')
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      console.log('❌ Transaction not found:', params.id)
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found transaction:', { 
      id: transaction.id, 
      type: transaction.type, 
      category: transaction.category,
      amount: transaction.amount,
      userId: transaction.userId 
    })

    // Check if transaction belongs to user
    if (transaction.userId !== userId) {
      console.log('❌ Transaction belongs to different user:', transaction.userId, userId)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const newAmount = parseFloat(amount)
    if (isNaN(newAmount) || newAmount <= 0) {
      console.log('❌ Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Handle budget updates if transaction type changes or amount changes
    let budgetUpdateError: string | null = null

    try {
      // If it was an expense, revert the budget spent
      if (transaction.type === 'EXPENSE') {
        console.log('💰 Reverting old expense from budget...')
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
          console.log('✅ Found budget, reverting spent...')
          await prisma.budget.update({
            where: { id: budget.id },
            data: { spent: Math.max(0, budget.spent - transaction.amount) },
          })
          console.log('✅ Budget reverted successfully')
        }
      }

      // Update the transaction
      console.log('🔄 Updating transaction...')
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
      console.log('✅ Transaction updated successfully')

      // If it's an expense, update the budget spent
      if (type === 'EXPENSE') {
        console.log('💰 Adding new expense to budget...')
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
          console.log('✅ Found budget, adding spent...')
          await prisma.budget.update({
            where: { id: budget.id },
            data: { spent: budget.spent + newAmount },
          })
          console.log('✅ Budget updated successfully')
        }
      }

      console.log('=== TRANSACTION UPDATE END ===\n')
      return NextResponse.json(updatedTransaction)
    } catch (error) {
      // Catch any budget update errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown budget update error'
      console.error('❌ Error updating budget:', errorMessage)
      budgetUpdateError = errorMessage
      
      // Still return the updated transaction but with a warning
      console.log('⚠️ Transaction updated but budget update failed')
      console.log('=== TRANSACTION UPDATE END ===\n')
      
      return NextResponse.json(
        { 
          warning: 'Transaction updated but budget update failed',
          details: process.env.NODE_ENV === 'development' ? budgetUpdateError : undefined
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Error updating transaction:', error)
    console.error('❌ Error stack:', error.stack)
    console.log('=== TRANSACTION UPDATE FAILED ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to update transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
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
      date: transaction.date,
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

    // If it's an expense, update the budget spent using the transaction's date
    if (transaction.type === 'EXPENSE') {
      console.log('💰 Updating budget for expense...')
      // FIX: Use transaction date, not today's date
      const transactionDate = new Date(transaction.date)
      const month = transactionDate.getMonth()
      const year = transactionDate.getFullYear()

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
          const newSpent = budget.spent - transaction.amount
          await prisma.budget.update({
            where: { id: budget.id },
            data: { spent: newSpent },
          })
          console.log('✅ Budget updated successfully')
        } else {
          console.log('ℹ️ No budget found for this category/month, skipping update')
        }
      } catch (budgetError: any) {
        console.error('❌ Error updating budget:', budgetError)
        console.error('❌ Error code:', budgetError.code)
        console.error('❌ Error meta:', budgetError.meta)
        // Don't fail the transaction deletion if budget update fails
        // Just log the error and continue
      }
    }

    // If it's a GOAL_UPDATE, revert the goal progress
    if (transaction.type === 'GOAL_UPDATE' && transaction.goalId) {
      console.log('🎯 Reverting goal progress...')
      try {
        const goal = await prisma.goal.findUnique({
          where: { id: transaction.goalId },
        })

        if (goal) {
          const newAmount = Math.max(0, goal.currentAmount - transaction.amount)
          await prisma.goal.update({
            where: { id: goal.id },
            data: { currentAmount: newAmount },
          })
          console.log('✅ Goal progress reverted successfully')
        }
      } catch (goalError: any) {
        console.error('❌ Error updating goal:', goalError)
        console.error('❌ Error code:', goalError.code)
        console.error('❌ Error meta:', goalError.meta)
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
    console.error('❌ Error code:', error.code)
    console.error('❌ Error meta:', error.meta)
    console.error('❌ Error stack:', error.stack)
    console.log('=== TRANSACTION DELETE FAILED ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to delete transaction',
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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
      date: transaction.date,
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

    // Handle budget updates using the transaction's date
    const transactionDate = new Date(transaction.date)
    const oldMonth = transactionDate.getMonth()
    const oldYear = transactionDate.getFullYear()

    // If it was an expense, revert the budget spent using the old month/year
    if (transaction.type === 'EXPENSE') {
      console.log('💰 Reverting old expense from budget...')
      try {
        const budget = await prisma.budget.findUnique({
          where: {
            userId_category_month_year: {
              userId,
              category: transaction.category,
              month: oldMonth,  // Use the correct field name 'month'
              year: oldYear,    // Use the correct field name 'year'
            },
          },
        })

        if (budget) {
          console.log('✅ Found budget, reverting spent...')
          await prisma.budget.update({
            where: { id: budget.id },
            data: { spent: budget.spent - transaction.amount },
          })
          console.log('✅ Budget reverted successfully')
        }
      } catch (budgetError: any) {
        console.error('❌ Error reverting budget:', budgetError)
        console.error('❌ Error code:', budgetError.code)
        console.error('❌ Error meta:', budgetError.meta)
      }
    }

    // If it was a GOAL_UPDATE, revert the goal progress
    if (transaction.type === 'GOAL_UPDATE' && transaction.goalId) {
      console.log('🎯 Reverting goal progress...')
      try {
        const goal = await prisma.goal.findUnique({
          where: { id: transaction.goalId },
        })

        if (goal) {
          const newAmount = Math.max(0, goal.currentAmount - transaction.amount)
          await prisma.goal.update({
            where: { id: goal.id },
            data: { currentAmount: newAmount },
          })
          console.log('✅ Goal progress reverted successfully')
        }
      } catch (goalError: any) {
        console.error('❌ Error reverting goal:', goalError)
        console.error('❌ Error code:', goalError.code)
        console.error('❌ Error meta:', goalError.meta)
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

    // If it's an expense, update the budget spent using the new transaction date
    if (type === 'EXPENSE') {
      console.log('💰 Adding new expense to budget...')
      const newDate = date ? new Date(date) : new Date()
      const newMonth = newDate.getMonth()
      const newYear = newDate.getFullYear()

      try {
        const budget = await prisma.budget.findUnique({
          where: {
            userId_category_month_year: {
              userId,
              category,
              month: newMonth,  // Use the correct field name 'month'
              year: newYear,    // Use the correct field name 'year'
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
      } catch (budgetError: any) {
        console.error('❌ Error adding to budget:', budgetError)
        console.error('❌ Error code:', budgetError.code)
        console.error('❌ Error meta:', budgetError.meta)
      }
    }

    // If it's a GOAL_UPDATE, update the goal progress
    if (type === 'GOAL_UPDATE' && updatedTransaction.goalId) {
      console.log('🎯 Updating goal progress...')
      try {
        const goal = await prisma.goal.findUnique({
          where: { id: updatedTransaction.goalId },
        })

        if (goal) {
          await prisma.goal.update({
            where: { id: goal.id },
            data: { currentAmount: goal.currentAmount + newAmount },
          })
          console.log('✅ Goal progress updated successfully')
        }
      } catch (goalError: any) {
        console.error('❌ Error updating goal:', goalError)
        console.error('❌ Error code:', goalError.code)
        console.error('❌ Error meta:', goalError.meta)
      }
    }

    console.log('=== TRANSACTION UPDATE END ===\n')
    return NextResponse.json(updatedTransaction)
  } catch (error: any) {
    console.error('❌ Error updating transaction:', error)
    console.error('❌ Error code:', error.code)
    console.error('❌ Error meta:', error.meta)
    console.error('❌ Error stack:', error.stack)
    console.log('=== TRANSACTION UPDATE FAILED ===\n')
    
    return NextResponse.json(
      { 
        error: 'Failed to update transaction',
        code: error.code,
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
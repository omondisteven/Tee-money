import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Test database connection first
    try {
      await prisma.$connect()
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 500 }
      )
    }

    // Check if user exists
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })
    } catch (findError: any) {
      console.error('Error finding user:', findError)
      return NextResponse.json(
        { error: 'Error checking user existence' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists. Please login instead.' },
        { status: 400 }
      )
    }

    // Hash password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(password, 10)
    } catch (hashError: any) {
      console.error('Error hashing password:', hashError)
      return NextResponse.json(
        { error: 'Error processing password' },
        { status: 500 }
      )
    }

    // Create user
    let user
    try {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
        },
      })
    } catch (createError: any) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please login.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
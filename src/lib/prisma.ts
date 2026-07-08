import { PrismaClient } from '@prisma/client'

// For Prisma v7, we need to handle the constructor differently
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  // In production, try without adapter first
  try {
    prisma = new PrismaClient()
  } catch (error) {
    // If that fails, try with the adapter
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const { Pool } = await import('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
    
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter })
  }
} else {
  // In development, use the adapter approach
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const { Pool } = await import('pg')
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
}

export { prisma }
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Parse the connection string for Vercel PostgreSQL
const connectionString = process.env.DATABASE_URL || ''

// Create a connection pool with SSL configuration for Vercel
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Vercel PostgreSQL
  },
})

// Create the Prisma adapter
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
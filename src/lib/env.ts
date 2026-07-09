// src\lib\env.ts
export function validateEnv() {
  if (!process.env.TM_PRISMA_DATABASE_URL) {
    throw new Error('TM_PRISMA_DATABASE_URL environment variable is not set')
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
}
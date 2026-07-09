import { NextRequest } from 'next/server'
import { verifyToken } from './jwt'
import { prisma } from './db'

export const getUserIdFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return null
  }

  const decoded = verifyToken(token) as { userId: string } | null

  if (!decoded) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  })

  return user ? user.id : null
}

export const validateAuth = async (request: NextRequest) => {
  const userId = await getUserIdFromRequest(request)
  if (!userId) {
    return { error: 'Unauthorized', status: 401 }
  }
  return { userId }
}
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const signToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
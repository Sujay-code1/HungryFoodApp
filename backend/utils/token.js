import jwt from 'jsonwebtoken'

export const genToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dev_secret'
  if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET not set — using dev fallback')
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' })
}
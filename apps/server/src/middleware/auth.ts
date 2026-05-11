import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export type AuthUser = {
  id: string
  role: 'ADMIN' | 'CASHIER'
  email: string
}

export type AuthRequest = Request & { user?: AuthUser }

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthUser
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireRole(...roles: Array<'ADMIN' | 'CASHIER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    return next()
  }
}

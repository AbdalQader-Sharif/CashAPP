import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { config } from '../config.js'
import { prisma } from '../db.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
})

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid credentials payload' })
  }

  const user = await prisma.users.findUnique({ where: { email: parsed.data.email } })
  if (!user || !user.active) return res.status(401).json({ message: 'Invalid credentials' })

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, config.jwtSecret, {
    expiresIn: '12h'
  })

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  })
})

authRouter.get('/session', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.users.findUnique({ where: { id: req.user!.id } })
  if (!user) return res.status(404).json({ message: 'User not found' })
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

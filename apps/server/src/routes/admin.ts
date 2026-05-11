import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../db.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const settingsSchema = z.object({
  shopName: z.string().min(2),
  taxPercentage: z.number().nonnegative(),
  currency: z.string().min(1),
  receiptFooter: z.string().min(2),
  language: z.string().min(2)
})

export const adminRouter = Router()
adminRouter.use(requireAuth, requireRole('ADMIN'))

adminRouter.get('/dashboard', async (_req, res) => {
  const [orders, topSelling] = await Promise.all([
    prisma.orders.findMany({ where: { status: 'COMPLETED' }, include: { items: true } }),
    prisma.orderItems.groupBy({
      by: ['name'],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    })
  ])

  const dailySales = orders.reduce<Record<string, number>>((acc, order) => {
    const day = order.createdAt.toISOString().slice(0, 10)
    acc[day] = (acc[day] ?? 0) + order.total
    return acc
  }, {})

  const revenue = orders.reduce((sum, order) => sum + order.total, 0)
  res.json({
    totalOrders: orders.length,
    revenue,
    topSelling,
    dailySales: Object.entries(dailySales).map(([date, total]) => ({ date, total }))
  })
})

adminRouter.get('/employees', async (_req, res) => {
  const users = await prisma.users.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
  })
  res.json(users)
})

adminRouter.get('/audit-logs', async (_req, res) => {
  const logs = await prisma.auditLogs.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } }
  })
  res.json(logs)
})

adminRouter.get('/reports', async (req, res) => {
  const orders = await prisma.orders.findMany({ where: { status: 'COMPLETED' }, include: { user: true } })
  if (req.query.format === 'csv') {
    const csv = ['reference,cashier,total,createdAt', ...orders.map((o) => `${o.reference},${o.user.name},${o.total},${o.createdAt.toISOString()}`)].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    return res.send(csv)
  }
  return res.json(orders)
})

adminRouter.put('/settings', async (req: AuthRequest, res) => {
  const parsed = settingsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid settings payload' })

  const existing = await prisma.settings.findFirst()
  const settings = existing
    ? await prisma.settings.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.settings.create({ data: parsed.data })

  await prisma.auditLogs.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE',
      entity: 'SETTINGS',
      details: 'Updated global settings'
    }
  })

  return res.json(settings)
})

adminRouter.post('/employees', async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['ADMIN', 'CASHIER'])
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid employee payload' })

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  const user = await prisma.users.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash
    }
  })
  await prisma.auditLogs.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      details: `Created user ${user.email}`
    }
  })
  return res.status(201).json(user)
})

adminRouter.patch('/employees/:id', async (req, res) => {
  const schema = z.object({ active: z.boolean() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const user = await prisma.users.update({ where: { id: req.params.id }, data: parsed.data })
  return res.json(user)
})

adminRouter.patch('/employees/:id/reset-password', async (req, res) => {
  const schema = z.object({ password: z.string().min(8) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid payload' })
  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  const user = await prisma.users.update({ where: { id: req.params.id }, data: { passwordHash } })
  return res.json({ id: user.id })
})

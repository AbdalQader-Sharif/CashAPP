import { Router } from 'express'
import { PaymentMethod } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const itemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  note: z.string().optional()
})

const createOrderSchema = z.object({
  items: z.array(itemSchema).min(1),
  discount: z.number().nonnegative().default(0),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
  splitPayments: z.array(z.object({ method: z.nativeEnum(PaymentMethod), amount: z.number().positive() })).optional(),
  hold: z.boolean().optional()
})

export const ordersRouter = Router()

ordersRouter.get('/recent', requireAuth, async (_req, res) => {
  const orders = await prisma.orders.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { items: true, payments: true, user: { select: { name: true } } }
  })
  return res.json(orders)
})

ordersRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid order payload' })

  const settings = await prisma.settings.findFirstOrThrow()
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const taxable = subtotal - parsed.data.discount
  const tax = Number((taxable * (settings.taxPercentage / 100)).toFixed(2))
  const total = Number((taxable + tax).toFixed(2))

  const order = await prisma.orders.create({
    data: {
      reference: `ORD-${Date.now()}`,
      userId: req.user!.id,
      status: parsed.data.hold ? 'HELD' : 'COMPLETED',
      notes: parsed.data.notes,
      subtotal,
      discount: parsed.data.discount,
      tax,
      total,
      items: {
        create: parsed.data.items.map((item) => ({
          ...item,
          lineTotal: Number((item.unitPrice * item.quantity).toFixed(2))
        }))
      },
      payments: {
        create: parsed.data.paymentMethod === 'SPLIT'
          ? (parsed.data.splitPayments ?? []).map((payment) => ({ method: payment.method, amount: payment.amount }))
          : [{ method: parsed.data.paymentMethod, amount: total }]
      }
    },
    include: { items: true, payments: true }
  })

  return res.status(201).json(order)
})

ordersRouter.post('/:id/resume', requireAuth, async (_req, res) => {
  const orderId = String(_req.params.id)
  const order = await prisma.orders.update({ where: { id: orderId }, data: { status: 'COMPLETED' } })
  return res.json(order)
})

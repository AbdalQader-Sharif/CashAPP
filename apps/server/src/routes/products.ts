import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  unavailable: z.boolean().default(false)
})

export const productsRouter = Router()

productsRouter.get('/', requireAuth, async (req, res) => {
  const category = req.query.category as string | undefined
  const products = await prisma.products.findMany({
    where: {
      ...(category ? { category: { name: category } } : {}),
      unavailable: false
    },
    include: { category: true },
    orderBy: { name: 'asc' }
  })
  return res.json(products)
})

productsRouter.get('/categories', requireAuth, async (_req, res) => {
  const categories = await prisma.categories.findMany({ orderBy: { name: 'asc' } })
  return res.json(categories)
})

productsRouter.post('/', requireAuth, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid product payload' })

  const product = await prisma.products.create({ data: parsed.data })
  await prisma.inventory.create({ data: { productId: product.id, quantity: parsed.data.stock } })
  await prisma.auditLogs.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: product.id,
      details: `Created product ${product.name}`
    }
  })
  return res.status(201).json(product)
})

productsRouter.put('/:id', requireAuth, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const productId = String(req.params.id)
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Invalid product payload' })

  const product = await prisma.products.update({ where: { id: productId }, data: parsed.data })
  await prisma.inventory.upsert({
    where: { productId: product.id },
    create: { productId: product.id, quantity: parsed.data.stock },
    update: { quantity: parsed.data.stock }
  })
  await prisma.auditLogs.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: product.id,
      details: `Updated product ${product.name}`
    }
  })
  return res.json(product)
})

productsRouter.delete('/:id', requireAuth, requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const productId = String(req.params.id)
  await prisma.products.delete({ where: { id: productId } })
  await prisma.auditLogs.create({
    data: {
      userId: req.user!.id,
      action: 'DELETE',
      entity: 'PRODUCT',
      entityId: productId,
      details: 'Deleted product'
    }
  })
  return res.status(204).send()
})

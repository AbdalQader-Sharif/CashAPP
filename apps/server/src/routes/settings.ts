import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

export const settingsRouter = Router()

settingsRouter.get('/', requireAuth, async (_req, res) => {
  const settings = await prisma.settings.findFirst()
  return res.json(settings)
})

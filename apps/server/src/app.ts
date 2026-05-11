import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { authRouter } from './routes/auth.js'
import { productsRouter } from './routes/products.js'
import { ordersRouter } from './routes/orders.js'
import { adminRouter } from './routes/admin.js'
import { settingsRouter } from './routes/settings.js'
import { errorHandler } from './middleware/error.js'

export const app = express()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
})

app.use(cors())
app.use(express.json())
app.use('/api', apiLimiter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authLimiter, authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/admin', adminRouter)

app.use(errorHandler)

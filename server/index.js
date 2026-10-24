import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import publicCatalogRouter from './routes/publicCatalog.js'
import adminProductsRouter from './routes/adminProducts.js'
import adminBrandsRouter from './routes/adminBrands.js'
import adminCategoriesRouter from './routes/adminCategories.js'
import adminCustomersRouter from './routes/adminCustomers.js'
import adminOrdersRouter from './routes/adminOrders.js'
import orderRoutes from './routes/orderRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
)
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fancy Atelier Parfums API',
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use('/api', publicCatalogRouter)
app.use('/api/users', userRoutes)
app.use('/api/admin/brands', adminBrandsRouter)
app.use('/api/admin/categories', adminCategoriesRouter)
app.use('/api/admin', adminProductsRouter)
app.use('/api/admin', adminCustomersRouter)
app.use('/api/admin', adminOrdersRouter)
app.use('/api', orderRoutes)
app.use('/api', couponRoutes)

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[API Server] Fancy Atelier Parfums Express API running on http://localhost:${PORT}`)
})

export default app

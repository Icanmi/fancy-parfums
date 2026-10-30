import { Router } from 'express'
import { getCustomerOrders, createCustomerOrder } from '../services/orderService.js'

const router = Router()

/**
 * GET /api/orders
 * Returns orders for the authenticated Clerk user or by email query.
 */
router.get('/orders', async (req, res, next) => {
  try {
    const clerkUserId =
      req.headers['x-clerk-user-id'] ||
      extractUserIdFromToken(req.headers.authorization) ||
      req.query.clerkUserId

    const customerEmail = req.query.customerEmail

    if (!clerkUserId && !customerEmail) {
      return res.status(401).json({ success: false, error: 'Authentication or customerEmail required.' })
    }

    const orders = await getCustomerOrders(clerkUserId, customerEmail)
    res.json({ success: true, data: orders, count: orders.length })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/orders
 * Creates a new order in Neon PostgreSQL.
 */
router.post('/orders', async (req, res, next) => {
  try {
    const { orderData, items } = req.body
    if (!orderData) {
      return res.status(400).json({ success: false, error: 'orderData is required.' })
    }

    const order = await createCustomerOrder(orderData, items || [])
    res.status(201).json({
      success: true,
      data: order,
    })
  } catch (err) {
    next(err)
  }
})

function extractUserIdFromToken(authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(json)?.sub || null
  } catch {
    return null
  }
}

export default router

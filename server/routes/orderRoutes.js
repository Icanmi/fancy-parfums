import { Router } from 'express'
import { getCustomerOrders } from '../services/orderService.js'

const router = Router()

/**
 * GET /api/orders
 * Returns orders for the authenticated Clerk user.
 * Reads clerk_user_id from the x-clerk-user-id header (set by frontend) or
 * from a decoded Bearer token sub field.
 */
router.get('/orders', async (req, res, next) => {
  try {
    // Accept clerk user id from a header (frontend sets this after Clerk auth)
    const clerkUserId =
      req.headers['x-clerk-user-id'] ||
      extractUserIdFromToken(req.headers.authorization)

    if (!clerkUserId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' })
    }

    const orders = await getCustomerOrders(clerkUserId)
    res.json({ success: true, data: orders, count: orders.length })
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

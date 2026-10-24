import { Router } from 'express'
import { getAdminOrders, getAdminOrderById, setOrderStatus } from '../services/orderService.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require administrator authentication
router.use(requireAdmin)

// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const { search, status, sortBy, sortDir } = req.query
    const orders = await getAdminOrders({ search, status, sortBy, sortDir })
    res.json({ success: true, data: orders, count: orders.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await getAdminOrderById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required in request body' })
    }
    const updated = await setOrderStatus(req.params.id, status)
    res.json({ success: true, message: `Order status updated to ${status}`, data: updated })
  } catch (err) {
    next(err)
  }
})

export default router

import express from 'express'
import { query } from '../lib/db.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/admin/customers — List registered customers from Neon
router.get('/customers', requireAdmin, async (req, res, next) => {
  try {
    const { search } = req.query
    const conditions = []
    const params = []

    if (search) {
      params.push(`%${search}%`)
      const idx = params.length
      conditions.push(`(p.first_name ILIKE $${idx} OR p.last_name ILIKE $${idx} OR p.email ILIKE $${idx})`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sql = `
      SELECT 
        p.*,
        COALESCE(COUNT(o.id), 0)::int AS "ordersCount",
        COALESCE(SUM(o.total), 0)::numeric AS "totalSpent"
      FROM public.profiles p
      LEFT JOIN public.orders o ON o.clerk_user_id = p.clerk_user_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `

    const profiles = await query(sql, params)

    const customers = profiles.map((p) => {
      const city = p.shipping_address?.city || p.shipping_address?.state || 'Lagos'
      return {
        id: p.id,
        clerkUserId: p.clerk_user_id,
        firstName: p.first_name || 'Atelier',
        lastName: p.last_name || 'Member',
        email: p.email,
        phone: p.phone || '—',
        city,
        shippingAddress: p.shipping_address || {},
        ordersCount: Number(p.ordersCount || 0),
        totalSpent: Number(p.totalSpent || 0),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }
    })

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    })
  } catch (err) {
    next(err)
  }
})

export default router

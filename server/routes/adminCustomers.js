import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/admin/customers — List registered customers from Supabase
router.get('/customers', requireAdmin, async (req, res, next) => {
  try {
    const { search } = req.query

    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: profiles, error } = await query
    if (error) throw error

    // Fetch order aggregates for each customer if orders exist
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('clerk_user_id, total, status')

    const orderStatsByUser = {}
    if (orders) {
      for (const ord of orders) {
        if (!ord.clerk_user_id) continue
        if (!orderStatsByUser[ord.clerk_user_id]) {
          orderStatsByUser[ord.clerk_user_id] = { count: 0, total: 0 }
        }
        orderStatsByUser[ord.clerk_user_id].count += 1
        orderStatsByUser[ord.clerk_user_id].total += Number(ord.total || 0)
      }
    }

    const customers = (profiles || []).map((p) => {
      const stats = orderStatsByUser[p.clerk_user_id] || { count: 0, total: 0 }
      const city = p.shipping_address?.city || (p.shipping_address?.state) || 'Lagos'

      return {
        id: p.id,
        clerkUserId: p.clerk_user_id,
        firstName: p.first_name || 'Atelier',
        lastName: p.last_name || 'Member',
        email: p.email,
        phone: p.phone || '—',
        city,
        shippingAddress: p.shipping_address || {},
        ordersCount: stats.count,
        totalSpent: stats.total,
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

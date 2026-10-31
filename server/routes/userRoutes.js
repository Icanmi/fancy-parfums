import express from 'express'
import { query } from '../lib/db.js'
import { parseJwt } from '../middleware/authMiddleware.js'

// Admin emails — must match the list in authMiddleware.js
const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || 'admin@fancyatelier.com,owner@fancyatelier.com,lenovo@gmail.com'
)
  .toLowerCase()
  .split(',')
  .map((e) => e.trim())

const router = express.Router()

// GET /api/users/me/role — returns the effective role for the signed-in Clerk user.
// Resolution order:
//   1. profiles.role = 'admin' in Neon  (set by DB migration / manual promotion)
//   2. Email from JWT matches ADMIN_EMAILS list  (works before profile row is created)
//   3. Default → 'customer'
// Authorization: Bearer <clerk-session-token>
router.get('/me/role', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authenticated' })
    }

    const payload = parseJwt(token)
    if (!payload?.sub) {
      return res.status(401).json({ success: false, error: 'Invalid token' })
    }

    // 1. Check Neon profile first
    const rows = await query(
      'SELECT role, email FROM public.profiles WHERE clerk_user_id = $1 LIMIT 1',
      [payload.sub]
    )

    if (rows.length > 0 && rows[0].role === 'admin') {
      return res.json({ success: true, role: 'admin' })
    }

    // 2. Fallback: check email from JWT against admin list
    //    (covers newly registered Clerk accounts before UserSync has run)
    const jwtEmail = (
      payload.email ||
      payload.primary_email_address ||
      payload.email_addresses?.[0]?.email_address ||
      ''
    ).toLowerCase().trim()

    if (jwtEmail && ADMIN_EMAILS.includes(jwtEmail)) {
      // Promote the profile in the DB if it already exists
      if (rows.length > 0) {
        await query(
          'UPDATE public.profiles SET role = $1 WHERE clerk_user_id = $2',
          ['admin', payload.sub]
        )
      }
      return res.json({ success: true, role: 'admin' })
    }

    // 3. Default to customer
    return res.json({ success: true, role: rows.length > 0 ? rows[0].role : 'customer' })
  } catch (err) {
    next(err)
  }
})

// POST /api/users/sync — Sync / upsert Clerk user into Neon profiles table
router.post('/sync', async (req, res, next) => {
  try {
    const { clerkUserId, email, firstName, lastName, phone, shippingAddress } = req.body

    if (!clerkUserId) {
      return res.status(400).json({ success: false, error: 'clerkUserId is required' })
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'email is required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const addr = shippingAddress ? JSON.stringify(shippingAddress) : null

    const sql = `
      INSERT INTO public.profiles (
        clerk_user_id, email, first_name, last_name, phone, shipping_address, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, COALESCE($6::jsonb, '{}'::jsonb), now()
      )
      ON CONFLICT (clerk_user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
        last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        shipping_address = CASE WHEN EXCLUDED.shipping_address != '{}'::jsonb THEN EXCLUDED.shipping_address ELSE profiles.shipping_address END,
        updated_at = now()
      RETURNING *
    `

    const rows = await query(sql, [
      clerkUserId,
      cleanEmail,
      firstName || null,
      lastName || null,
      phone || null,
      addr
    ])

    res.json({
      success: true,
      message: 'User profile synced to Neon',
      profile: rows[0],
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/me/:clerkUserId — Get profile for a Clerk user
router.get('/me/:clerkUserId', async (req, res, next) => {
  try {
    const { clerkUserId } = req.params

    const rows = await query(
      'SELECT * FROM public.profiles WHERE clerk_user_id = $1 LIMIT 1',
      [clerkUserId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' })
    }

    res.json({
      success: true,
      profile: rows[0],
    })
  } catch (err) {
    next(err)
  }
})

export default router

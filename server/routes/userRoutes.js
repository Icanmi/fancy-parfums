import express from 'express'
import { query } from '../lib/db.js'

const router = express.Router()

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

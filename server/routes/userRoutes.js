import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const router = express.Router()

// POST /api/users/sync — Sync / upsert Clerk user into Supabase profiles table
router.post('/sync', async (req, res, next) => {
  try {
    const { clerkUserId, email, firstName, lastName, phone, shippingAddress } = req.body

    if (!clerkUserId) {
      return res.status(400).json({ success: false, error: 'clerkUserId is required' })
    }

    if (!email) {
      return res.status(400).json({ success: false, error: 'email is required' })
    }

    const payload = {
      clerk_user_id: clerkUserId,
      email: email.trim().toLowerCase(),
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    }

    if (shippingAddress) {
      payload.shipping_address = shippingAddress
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'clerk_user_id' })
      .select('*')
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'User profile synced to Supabase',
      profile: data,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/me/:clerkUserId — Get profile for a Clerk user
router.get('/me/:clerkUserId', async (req, res, next) => {
  try {
    const { clerkUserId } = req.params

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ success: false, error: 'Profile not found' })
    }

    res.json({
      success: true,
      profile: data,
    })
  } catch (err) {
    next(err)
  }
})

export default router

import { Router } from 'express'
import { query } from '../lib/db.js'
import { verifyPassword, signAdminToken, verifyAdminToken } from '../lib/adminAuthUtils.js'

const router = Router()

/**
 * POST /api/admin/auth/login
 * Authenticates an administrator against Neon PostgreSQL
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      })
    }

    const cleanEmail = email.trim().toLowerCase()

    const rows = await query(
      'SELECT id, name, email, password_hash, role FROM public.admin_users WHERE LOWER(email) = $1 LIMIT 1',
      [cleanEmail]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.',
      })
    }

    const admin = rows[0]
    const isValid = verifyPassword(password, admin.password_hash)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials.',
      })
    }

    const token = signAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    })

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/admin/auth/me
 * Retrieves current admin profile from Neon session token
 */
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Administrator authentication required.',
      })
    }

    const payload = verifyAdminToken(token)
    if (!payload || !payload.sub) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired administrator session.',
      })
    }

    const rows = await query(
      'SELECT id, name, email, role FROM public.admin_users WHERE id = $1 LIMIT 1',
      [payload.sub]
    )

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Admin account not found.',
      })
    }

    return res.json({
      success: true,
      admin: rows[0],
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/auth/logout
 */
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Administrator session cleared.',
  })
})

export default router


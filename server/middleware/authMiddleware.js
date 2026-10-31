import dotenv from 'dotenv'
import { verifyAdminToken } from '../lib/adminAuthUtils.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_test_0z5kelXcQZxN5humahdopHxRPjvbcmqY9SX246YZJh'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@fancyatelier.com,owner@fancyatelier.com,lenovo@gmail.com')
  .toLowerCase()
  .split(',')
  .map((e) => e.trim())

/**
 * Verifies Neon Admin authentication or legacy Clerk administrator privileges.
 */
export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    // 1. Check for optional server-to-server admin secret
    const adminSecret = req.headers['x-admin-secret']
    if (adminSecret && adminSecret === process.env.ADMIN_SECRET_KEY) {
      req.user = { role: 'admin', authType: 'secret' }
      return next()
    }

    if (!token) {
      // In local dev/demo environment without active session,
      // allow if explicit dev header is provided, otherwise return 401.
      if (process.env.NODE_ENV === 'development' && req.headers['x-dev-admin'] === 'true') {
        req.user = { role: 'admin', email: 'dev-admin@fancyatelier.com' }
        return next()
      }
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No authorization token provided.',
      })
    }

    // 2. First verify as dedicated Neon Admin Token
    const adminPayload = verifyAdminToken(token)
    if (adminPayload && adminPayload.sub && adminPayload.role === 'admin') {
      req.user = {
        id: adminPayload.sub,
        email: adminPayload.email,
        name: adminPayload.name,
        role: adminPayload.role,
        authType: 'neon',
      }
      return next()
    }

    // 3. Fallback: Decode token payload (Clerk JWT format)
    const payload = parseJwt(token)
    if (!payload || !payload.sub) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization token.',
      })
    }

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please sign in again.',
      })
    }

    // Verify admin role or authorized admin email
    const userRole = payload.role || payload.org_role || payload.public_metadata?.role || payload.metadata?.role
    const userEmail = (payload.email || payload.primary_email || '').toLowerCase()

    const isAdmin =
      userRole === 'admin' ||
      ADMIN_EMAILS.includes(userEmail) ||
      payload.sub.startsWith('admin_')

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Administrator privileges required.',
      })
    }

    req.user = {
      id: payload.sub,
      email: userEmail,
      role: 'admin',
      authType: 'clerk',
      ...payload,
    }

    next()
  } catch (err) {
    console.error('Authentication middleware error:', err)
    return res.status(401).json({
      success: false,
      error: 'Authentication failed.',
    })
  }
}

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('binary')
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

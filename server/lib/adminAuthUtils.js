import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const ADMIN_SECRET =
  process.env.ADMIN_JWT_SECRET || 'fancy_atelier_parfums_admin_secret_key_2026_neon'

/**
 * Hash a password using scrypt with a unique random 16-byte salt
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a plain-text password against a stored salt:hash string
 */
export function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || !storedHash.includes(':')) return false
    const [salt, originalHash] = storedHash.split(':')
    const keyBuffer = Buffer.from(originalHash, 'hex')
    const derivedBuffer = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer)
  } catch {
    return false
  }
}

/**
 * Sign an admin session token (base64url payload + HMAC-SHA256 signature)
 * Valid for 7 days
 */
export function signAdminToken(admin) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role || 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify an admin session token
 */
export function verifyAdminToken(token) {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signature] = parts

    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url')

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    return payload
  } catch {
    return null
  }
}


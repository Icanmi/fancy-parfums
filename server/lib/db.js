/**
 * Neon PostgreSQL Client — SERVER SIDE ONLY
 *
 * Uses @neondatabase/serverless over HTTPS with automatic retry
 * to handle Neon serverless compute cold-starts seamlessly.
 * NEVER expose this file or its database connection string to the browser.
 */

import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn(
    '[db] WARNING: DATABASE_URL is not set in environment.\n' +
    '  Ensure DATABASE_URL is present in .env.local'
  )
}

export const sql = databaseUrl ? neon(databaseUrl) : null

export const isNeonConfigured = () => Boolean(sql)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Execute a SQL query with parameters.
 * Automatically retries up to 3 times on transient connection drops / compute wake-ups.
 * @param {string} text - SQL statement (e.g. 'SELECT * FROM products WHERE id = $1')
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of result rows
 */
export async function query(text, params = []) {
  if (!sql) {
    throw new Error('Database is not configured. DATABASE_URL is missing.')
  }

  const MAX_RETRIES = 3
  const BACKOFF_DELAYS = [400, 1000, 2000]

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await sql.query(text, params)
    } catch (err) {
      const isConnectionError =
        err?.message?.includes('fetch failed') ||
        err?.message?.includes('connection') ||
        err?.message?.includes('network') ||
        err?.cause?.code === 'ECONNRESET' ||
        err?.cause?.code === 'ETIMEDOUT'

      if (isConnectionError && attempt < MAX_RETRIES) {
        const delay = BACKOFF_DELAYS[attempt] || 1000
        console.warn(
          `[db] Neon compute wake-up / transient connection error on attempt ${attempt + 1}. Retrying in ${delay}ms...`
        )
        await sleep(delay)
        continue
      }

      // If non-connection error or exceeded retries, throw
      throw err
    }
  }
}

export default { sql, query, isNeonConfigured }

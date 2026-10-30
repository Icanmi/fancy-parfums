/**
 * Neon PostgreSQL Client — SERVER SIDE ONLY
 *
 * Uses @neondatabase/serverless over HTTPS for resilient, serverless database access.
 * NEVER expose this file or its database connection string to the browser.
 */

import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED

if (!databaseUrl) {
  console.warn(
    '[db] WARNING: DATABASE_URL is not set in environment.\n' +
    '  Ensure DATABASE_URL is present in .env.local'
  )
}

export const sql = databaseUrl ? neon(databaseUrl) : null

export const isNeonConfigured = () => Boolean(sql)

/**
 * Execute a SQL query with parameters.
 * @param {string} text - SQL statement (e.g. 'SELECT * FROM products WHERE id = $1')
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of result rows
 */
export async function query(text, params = []) {
  if (!sql) {
    throw new Error('Database is not configured. DATABASE_URL is missing.')
  }
  return sql.query(text, params)
}

export default { sql, query, isNeonConfigured }

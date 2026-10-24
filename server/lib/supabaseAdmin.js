/**
 * Supabase Admin Client — SERVER SIDE ONLY
 *
 * Uses the service_role key to bypass RLS for privileged admin operations.
 * NEVER expose this file or its key to the browser.
 *
 * Required in .env.local:
 *   SUPABASE_URL=https://your-project.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   ← Dashboard → Settings → API → service_role
 *
 * The service_role key bypasses all Row Level Security policies.
 * All security is enforced by the Express middleware (requireAdmin), not by RLS.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://anafmqhkphrexlwgrlmt.supabase.co'

// Service role key MUST be used here so RLS does not block admin mutations.
// If only the anon key is available, RLS policies must explicitly allow all operations.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||   // ← add this to .env.local for proper security
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_N4j59PtNsN7cHMXsyRAt8g_C-YN_mEQ'

const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

if (!usingServiceRole) {
  console.warn(
    '[supabaseAdmin] WARNING: Running with anon key, not service_role key.\n' +
    '  Add SUPABASE_SERVICE_ROLE_KEY to .env.local from:\n' +
    '  Supabase Dashboard → Project Settings → API → service_role\n' +
    '  RLS policies must permit all product mutations for the API to work correctly.'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

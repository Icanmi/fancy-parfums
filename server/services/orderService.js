import { supabaseAdmin } from '../lib/supabaseAdmin.js'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

/**
 * Fetch all orders for admin (with order items joined).
 */
export async function getAdminOrders({ search, status, sortBy = 'created_at', sortDir = 'desc' } = {}) {
  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order(sortBy, { ascending: sortDir === 'asc' })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Fetch a single order by ID with items.
 */
export async function getAdminOrderById(id) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Update order status (admin only).
 */
export async function setOrderStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`)
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch orders belonging to a specific Clerk user.
 */
export async function getCustomerOrders(clerkUserId) {
  if (!clerkUserId) return []

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('clerk_user_id', clerkUserId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Validate a coupon code against the Supabase coupons table.
 * Returns coupon data if valid, throws if invalid.
 */
export async function validateCoupon(code) {
  if (!code) throw new Error('Coupon code is required.')

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single()

  if (error || !data) {
    throw new Error('Invalid or expired coupon code.')
  }

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    throw new Error('This coupon code has expired.')
  }

  // Check usage limit
  if (data.usage_limit !== null && data.times_used >= data.usage_limit) {
    throw new Error('This coupon code has reached its usage limit.')
  }

  return data
}

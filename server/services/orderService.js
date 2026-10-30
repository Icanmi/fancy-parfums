import { query } from '../lib/db.js'

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

/**
 * Fetch all orders for admin (with order items joined).
 */
export async function getAdminOrders({ search, status, sortBy = 'created_at', sortDir = 'desc' } = {}) {
  const conditions = []
  const params = []

  if (status && status !== 'all') {
    params.push(status)
    conditions.push(`o.status = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    const idx = params.length
    conditions.push(`(o.order_number ILIKE $${idx} OR o.customer_email ILIKE $${idx} OR o.customer_name ILIKE $${idx})`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const validSortCols = ['id', 'order_number', 'total', 'created_at', 'status']
  const safeSort = validSortCols.includes(sortBy) ? `o.${sortBy}` : 'o.created_at'
  const safeDir = String(sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  const sql = `
    SELECT 
      o.*,
      COALESCE(
        json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS order_items
    FROM public.orders o
    LEFT JOIN public.order_items oi ON oi.order_id = o.id
    ${whereClause}
    GROUP BY o.id
    ORDER BY ${safeSort} ${safeDir}
  `

  return query(sql, params)
}

/**
 * Fetch a single order by ID with items.
 */
export async function getAdminOrderById(id) {
  const sql = `
    SELECT 
      o.*,
      COALESCE(
        json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS order_items
    FROM public.orders o
    LEFT JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.id = $1
    GROUP BY o.id
    LIMIT 1
  `
  const rows = await query(sql, [id])
  return rows[0] || null
}

/**
 * Update order status (admin only).
 */
export async function setOrderStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`)
  }

  const rows = await query(
    `UPDATE public.orders
     SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  )

  if (rows.length === 0) {
    throw new Error('Order not found.')
  }

  return rows[0]
}

/**
 * Fetch orders belonging to a specific Clerk user or customer email.
 */
export async function getCustomerOrders(clerkUserId, customerEmail) {
  const conditions = []
  const params = []

  if (clerkUserId && customerEmail) {
    params.push(clerkUserId, customerEmail)
    conditions.push('(o.clerk_user_id = $1 OR o.customer_email = $2)')
  } else if (clerkUserId) {
    params.push(clerkUserId)
    conditions.push('o.clerk_user_id = $1')
  } else if (customerEmail) {
    params.push(customerEmail)
    conditions.push('o.customer_email = $1')
  } else {
    return []
  }

  const sql = `
    SELECT 
      o.*,
      COALESCE(
        json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS order_items
    FROM public.orders o
    LEFT JOIN public.order_items oi ON oi.order_id = o.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `

  return query(sql, params)
}

/**
 * Create a new customer order and associated order items in Neon PostgreSQL.
 */
export async function createCustomerOrder(orderData, items = []) {
  const orderNumber = orderData.orderNumber || `ORD-${Date.now()}`
  const subtotal = Number(orderData.subtotal || 0)
  const shippingFee = Number(orderData.shippingFee || 0)
  const discount = Number(orderData.discount || 0)
  const total = Number(orderData.total || (subtotal + shippingFee - discount))
  const shippingAddress = typeof orderData.shippingAddress === 'object'
    ? JSON.stringify(orderData.shippingAddress)
    : '{}'

  const insertOrderSql = `
    INSERT INTO public.orders (
      order_number, clerk_user_id, status, payment_status,
      subtotal, shipping_fee, discount, total,
      customer_name, customer_email, customer_phone,
      shipping_address, delivery_method, payment_method,
      promo_code, paystack_reference,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, $10, $11,
      $12::jsonb, $13, $14,
      $15, $16,
      now(), now()
    )
    RETURNING *
  `

  const orderRows = await query(insertOrderSql, [
    orderNumber,
    orderData.clerkUserId || null,
    orderData.status || 'pending',
    orderData.paymentStatus || 'pending',
    subtotal,
    shippingFee,
    discount,
    total,
    orderData.customerName || 'Customer',
    orderData.customerEmail || 'customer@example.com',
    orderData.customerPhone || '',
    shippingAddress,
    orderData.deliveryMethod || 'standard',
    orderData.paymentMethod || 'paystack',
    orderData.promoCode || null,
    orderData.paystackReference || null,
  ])

  const order = orderRows[0]

  if (order && items.length > 0) {
    for (const item of items) {
      const prodId = typeof item.productId === 'number' ? item.productId : (typeof item.id === 'number' ? item.id : null)
      const qty = Math.max(1, parseInt(item.quantity || 1, 10))
      const unitPrice = Number(item.price || item.unitPrice || 0)
      const itemSubtotal = unitPrice * qty

      await query(
        `INSERT INTO public.order_items (
          order_id, product_id, name, brand, size, quantity, unit_price, subtotal, image_url, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`,
        [
          order.id,
          prodId,
          item.name || 'Perfume',
          item.brand || null,
          item.size || null,
          qty,
          unitPrice,
          itemSubtotal,
          item.image || item.image_url || null,
        ]
      )
    }
  }

  return getAdminOrderById(order.id)
}

/**
 * Validate a coupon code against the coupons table.
 * Returns coupon data if valid, throws if invalid.
 */
export async function validateCoupon(code) {
  if (!code) throw new Error('Coupon code is required.')

  const rows = await query(
    `SELECT * FROM public.coupons
     WHERE code = $1 AND is_active = true
     LIMIT 1`,
    [code.toUpperCase().trim()]
  )

  if (rows.length === 0) {
    throw new Error('Invalid or expired coupon code.')
  }

  const data = rows[0]

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

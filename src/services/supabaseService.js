import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { PRODUCTS } from '../data/products'
import { BRANDS } from '../data/brands'
import { CATEGORIES } from '../data/categories'

// ─── Products ─────────────────────────────────────────────────────────────

export async function fetchProducts({ category, brand, gender, isFeatured, limit } = {}) {
  if (!isSupabaseConfigured()) {
    return filterLocalProducts({ category, brand, gender, isFeatured, limit })
  }

  try {
    let query = supabase
      .from('products')
      .select('*, brands(name, slug), categories(name, slug)')
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (category) query = query.eq('category_id', category)
    if (brand) query = query.eq('brand_id', brand)
    if (gender) query = query.eq('gender', gender)
    if (isFeatured) query = query.eq('is_featured', true)
    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return filterLocalProducts({ category, brand, gender, isFeatured, limit })
    }
    return data
  } catch (err) {
    console.warn('Supabase fetchProducts fallback:', err)
    return filterLocalProducts({ category, brand, gender, isFeatured, limit })
  }
}

export async function fetchProductBySlug(slug) {
  if (!isSupabaseConfigured()) {
    return PRODUCTS.find((p) => p.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(name, slug), categories(name, slug)')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return PRODUCTS.find((p) => p.slug === slug) || null
    }
    return data
  } catch (err) {
    console.warn('Supabase fetchProductBySlug fallback:', err)
    return PRODUCTS.find((p) => p.slug === slug) || null
  }
}

function filterLocalProducts({ category, brand, gender, isFeatured, limit } = {}) {
  let list = [...PRODUCTS]
  if (category) list = list.filter((p) => p.categorySlug === category || p.category === category)
  if (brand) list = list.filter((p) => p.brandSlug === brand || p.brand === brand)
  if (gender) list = list.filter((p) => p.gender?.toLowerCase() === gender?.toLowerCase())
  if (isFeatured) list = list.filter((p) => p.isFeatured)
  if (limit) list = list.slice(0, limit)
  return list
}

// ─── Categories & Brands ──────────────────────────────────────────────────

export async function fetchCategories() {
  if (!isSupabaseConfigured()) return CATEGORIES
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (error || !data || data.length === 0) return CATEGORIES
    return data
  } catch (err) {
    console.warn('Supabase fetchCategories fallback:', err)
    return CATEGORIES
  }
}

export async function fetchBrands() {
  if (!isSupabaseConfigured()) return BRANDS
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true })

    if (error || !data || data.length === 0) return BRANDS
    return data
  } catch (err) {
    console.warn('Supabase fetchBrands fallback:', err)
    return BRANDS
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────

export async function createOrder(orderData, items = []) {
  if (!isSupabaseConfigured()) {
    return { data: { id: orderData.id, ...orderData }, error: null }
  }

  try {
    // 1. Insert order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderData.orderNumber,
        clerk_user_id: orderData.clerkUserId || null,
        status: orderData.status || 'pending',
        payment_status: orderData.paymentStatus || 'pending',
        subtotal: orderData.subtotal,
        shipping_fee: orderData.shippingFee || 0,
        discount: orderData.discount || 0,
        total: orderData.total,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        delivery_method: orderData.deliveryMethod,
        payment_method: orderData.paymentMethod,
        promo_code: orderData.promoCode || null,
        paystack_reference: orderData.paystackReference || null,
      })
      .select()
      .single()

    if (orderError) {
      console.warn('Supabase order insert error, using local state:', orderError)
      return { data: orderData, error: null }
    }

    // 2. Insert order items
    if (order && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: typeof item.productId === 'number' ? item.productId : null,
        name: item.name,
        brand: item.brand,
        size: item.size || null,
        quantity: item.quantity,
        unit_price: item.price || item.unitPrice,
        subtotal: (item.price || item.unitPrice) * item.quantity,
        image_url: item.image || item.image_url || null,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) console.warn('Supabase order items insert error:', itemsError)
    }

    return { data: order, error: null }
  } catch (err) {
    console.warn('Supabase createOrder fallback:', err)
    return { data: orderData, error: null }
  }
}

export async function fetchCustomerOrders(clerkUserId, customerEmail) {
  if (!isSupabaseConfigured()) return []

  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (clerkUserId) {
      query = query.or(`clerk_user_id.eq.${clerkUserId},customer_email.eq.${customerEmail}`)
    } else if (customerEmail) {
      query = query.eq('customer_email', customerEmail)
    } else {
      return []
    }

    const { data, error } = await query
    if (error || !data) return []
    return data
  } catch (err) {
    console.warn('Supabase fetchCustomerOrders fallback:', err)
    return []
  }
}

// ─── Customer Profiles ────────────────────────────────────────────────────

export async function syncCustomerProfile(user, address = {}) {
  if (!isSupabaseConfigured() || !user) return null

  try {
    const clerkUserId = user.id
    const email = user.primaryEmailAddress?.emailAddress
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    const phone = user.phoneNumbers?.[0]?.phoneNumber || address.phone || ''

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          clerk_user_id: clerkUserId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          shipping_address: address,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'clerk_user_id' }
      )
      .select()
      .single()

    if (error) console.warn('Supabase syncCustomerProfile warning:', error)
    return data
  } catch (err) {
    console.warn('Supabase syncCustomerProfile error:', err)
    return null
  }
}

export async function fetchCustomerProfile(clerkUserId) {
  if (!isSupabaseConfigured() || !clerkUserId) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────

export async function fetchWishlist(clerkUserId) {
  if (!isSupabaseConfigured() || !clerkUserId) return []

  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id, products(*)')
      .eq('clerk_user_id', clerkUserId)

    if (error || !data) return []
    return data.map((w) => w.products).filter(Boolean)
  } catch {
    return []
  }
}

export async function addToWishlist(clerkUserId, productId) {
  if (!isSupabaseConfigured() || !clerkUserId) return false

  try {
    const { error } = await supabase
      .from('wishlists')
      .upsert({ clerk_user_id: clerkUserId, product_id: productId }, { onConflict: 'clerk_user_id, product_id' })
    return !error
  } catch {
    return false
  }
}

export async function removeFromWishlist(clerkUserId, productId) {
  if (!isSupabaseConfigured() || !clerkUserId) return false

  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('clerk_user_id', clerkUserId)
      .eq('product_id', productId)
    return !error
  } catch {
    return false
  }
}

// ─── Newsletter ───────────────────────────────────────────────────────────

export async function subscribeNewsletter(email) {
  if (!email || !isSupabaseConfigured()) return { success: true }

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: email.trim().toLowerCase(), is_subscribed: true }, { onConflict: 'email' })
    return { success: !error, error }
  } catch (err) {
    return { success: false, error: err }
  }
}

// ─── Coupons ──────────────────────────────────────────────────────────────

export async function validateCoupon(code) {
  if (!code || !isSupabaseConfigured()) return null

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

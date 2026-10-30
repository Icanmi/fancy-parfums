/**
 * Neon Client Service — Express REST API Client
 *
 * Communicates with the Express API backed by Neon Serverless PostgreSQL.
 * Provides fallback to local catalogue for uninterrupted offline browsing.
 */

import axios from 'axios'
import { PRODUCTS } from '../data/products'
import { BRANDS } from '../data/brands'
import { CATEGORIES } from '../data/categories'

const API_BASE = '/api'

// Helper for local product filtering when offline
function filterLocalProducts({ category, brand, gender, isFeatured, limit } = {}) {
  let list = [...PRODUCTS]
  if (category) list = list.filter((p) => p.categorySlug === category || p.category === category || String(p.categoryId) === String(category))
  if (brand) list = list.filter((p) => p.brandSlug === brand || p.brand === brand || String(p.brandId) === String(brand))
  if (gender) list = list.filter((p) => p.gender?.toLowerCase() === gender?.toLowerCase())
  if (isFeatured) list = list.filter((p) => p.isFeatured)
  if (limit) list = list.slice(0, limit)
  return list
}

// ─── Products ─────────────────────────────────────────────────────────────

export async function fetchProducts({ category, brand, gender, isFeatured, limit } = {}) {
  try {
    const params = {}
    if (category) params.category = category
    if (brand) params.brand = brand
    if (gender) params.gender = gender
    if (isFeatured) params.isFeatured = true
    if (limit) params.limit = limit

    const res = await axios.get(`${API_BASE}/products`, { params })
    if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return filterLocalProducts({ category, brand, gender, isFeatured, limit })
  } catch (err) {
    console.warn('API fetchProducts fallback to local:', err?.message)
    return filterLocalProducts({ category, brand, gender, isFeatured, limit })
  }
}

export async function fetchProductBySlug(slug) {
  try {
    const res = await axios.get(`${API_BASE}/products/${slug}`)
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    return PRODUCTS.find((p) => p.slug === slug) || null
  } catch (err) {
    console.warn('API fetchProductBySlug fallback to local:', err?.message)
    return PRODUCTS.find((p) => p.slug === slug) || null
  }
}

// ─── Categories & Brands ──────────────────────────────────────────────────

export async function fetchCategories() {
  try {
    const res = await axios.get(`${API_BASE}/categories`)
    if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return CATEGORIES
  } catch (err) {
    console.warn('API fetchCategories fallback to local:', err?.message)
    return CATEGORIES
  }
}

export async function fetchBrands() {
  try {
    const res = await axios.get(`${API_BASE}/brands`)
    if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return BRANDS
  } catch (err) {
    console.warn('API fetchBrands fallback to local:', err?.message)
    return BRANDS
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────

export async function createOrder(orderData, items = []) {
  try {
    const res = await axios.post(`${API_BASE}/orders`, { orderData, items })
    if (res.data?.success && res.data?.data) {
      return { data: res.data.data, error: null }
    }
    return { data: { id: orderData.id || `ORD-${Date.now()}`, ...orderData }, error: null }
  } catch (err) {
    console.warn('API createOrder fallback to local state:', err?.message)
    return { data: { id: orderData.id || `ORD-${Date.now()}`, ...orderData }, error: null }
  }
}

export async function fetchCustomerOrders(clerkUserId, customerEmail) {
  try {
    const headers = {}
    if (clerkUserId) headers['x-clerk-user-id'] = clerkUserId
    const params = {}
    if (customerEmail) params.customerEmail = customerEmail

    const res = await axios.get(`${API_BASE}/orders`, { headers, params })
    return res.data?.data || []
  } catch (err) {
    console.warn('API fetchCustomerOrders fallback:', err?.message)
    return []
  }
}

// ─── Customer Profiles ────────────────────────────────────────────────────

export async function syncCustomerProfile(user, address = {}) {
  if (!user) return null

  try {
    const payload = {
      clerkUserId: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phoneNumbers?.[0]?.phoneNumber || address.phone || '',
      shippingAddress: address,
    }

    const res = await axios.post(`${API_BASE}/users/sync`, payload)
    return res.data?.profile || null
  } catch (err) {
    console.warn('API syncCustomerProfile error:', err?.message)
    return null
  }
}

export async function fetchCustomerProfile(clerkUserId) {
  if (!clerkUserId) return null

  try {
    const res = await axios.get(`${API_BASE}/users/me/${clerkUserId}`)
    return res.data?.profile || null
  } catch {
    return null
  }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────

export async function fetchWishlist(clerkUserId) {
  try {
    const stored = localStorage.getItem(`atelier_wishlist_${clerkUserId}`)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export async function addToWishlist(clerkUserId, product) {
  try {
    const current = await fetchWishlist(clerkUserId)
    if (!current.some((p) => p.id === product.id)) {
      current.push(product)
      localStorage.setItem(`atelier_wishlist_${clerkUserId}`, JSON.stringify(current))
    }
    return true
  } catch {
    return false
  }
}

export async function removeFromWishlist(clerkUserId, productId) {
  try {
    const current = await fetchWishlist(clerkUserId)
    const filtered = current.filter((p) => p.id !== productId)
    localStorage.setItem(`atelier_wishlist_${clerkUserId}`, JSON.stringify(filtered))
    return true
  } catch {
    return false
  }
}

// ─── Newsletter ───────────────────────────────────────────────────────────

export async function subscribeNewsletter(email) {
  if (!email) return { success: true }
  try {
    return { success: true }
  } catch (err) {
    return { success: false, error: err }
  }
}

// ─── Coupons ──────────────────────────────────────────────────────────────

export async function validateCoupon(code) {
  if (!code) return null

  try {
    const res = await axios.post(`${API_BASE}/coupons/validate`, { code })
    if (res.data?.valid) {
      return res.data
    }
    return null
  } catch {
    return null
  }
}

export default {
  fetchProducts,
  fetchProductBySlug,
  fetchCategories,
  fetchBrands,
  createOrder,
  fetchCustomerOrders,
  syncCustomerProfile,
  fetchCustomerProfile,
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  subscribeNewsletter,
  validateCoupon,
}

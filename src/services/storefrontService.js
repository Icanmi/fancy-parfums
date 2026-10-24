import axios from 'axios'
import { PRODUCTS, BEST_SELLERS } from '../data/products'
import { CATEGORIES } from '../data/categories'
import { BRANDS } from '../data/brands'

const API_BASE = '/api'

export function normalizeProduct(p) {
  if (!p) return null

  const brandName = p.brands?.name || p.brand || ''
  const brandSlug = p.brands?.slug || p.brandSlug || p.brand_slug || brandName.toLowerCase().replace(/\s+/g, '-')
  const categoryName = p.categories?.name || p.category || ''
  const categorySlug = p.categories?.slug || p.categorySlug || p.category_slug || categoryName.toLowerCase().replace(/\s+/g, '-')
  const mainImage = p.image_url || (Array.isArray(p.images) && p.images[0]) || p.image || '/images/sauvage.jpg'
  const imageList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [mainImage]

  return {
    ...p,
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: Number(p.price || 0),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : p.compareAtPrice ? Number(p.compareAtPrice) : null,
    image: mainImage,
    images: imageList,
    brand: brandName,
    brandSlug,
    category: categoryName,
    categorySlug,
    gender: p.gender || 'Unisex',
    fragranceFamily: p.fragrance_family || p.fragranceFamily || '',
    concentration: p.concentration || 'Eau de Parfum',
    sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [p.size || p.default_size || '100ml'],
    defaultSize: p.default_size || p.size || p.defaultSize || '100ml',
    stockQuantity: p.stock_quantity !== undefined ? Number(p.stock_quantity) : p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0,
    rating: p.rating || 4.8,
    reviewCount: p.review_count || p.reviewCount || 15,
    badge: p.is_bestseller || p.isBestSeller ? 'bestseller' : p.is_new || p.isNew ? 'new' : null,
    isFeatured: Boolean(p.is_featured ?? p.isFeatured),
    isBestSeller: Boolean(p.is_bestseller ?? p.isBestSeller),
    isNew: Boolean(p.is_new ?? p.isNew),
    notes: p.notes && typeof p.notes === 'object' ? p.notes : { top: [], middle: [], base: [] },
    longevity: p.longevity || 'Long Lasting (6-8 hrs)',
    sillage: p.sillage || 'Moderate',
  }
}

export async function fetchStorefrontProducts(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/products`, { params })
    if (res.data?.data && res.data.data.length > 0) {
      return res.data.data.map(normalizeProduct)
    }
  } catch (err) {
    console.warn('[storefrontService] Failed to fetch products from API, using fallback:', err.message)
  }
  return PRODUCTS.map(normalizeProduct)
}

export async function fetchStorefrontProductByIdOrSlug(idOrSlug) {
  try {
    const res = await axios.get(`${API_BASE}/products/${idOrSlug}`)
    if (res.data?.data) {
      return normalizeProduct(res.data.data)
    }
  } catch (err) {
    console.warn(`[storefrontService] Failed to fetch product ${idOrSlug}, searching fallback:`, err.message)
  }

  const match = PRODUCTS.find((p) => String(p.id) === String(idOrSlug) || p.slug === idOrSlug)
  return match ? normalizeProduct(match) : null
}

export async function fetchStorefrontBestSellers() {
  try {
    const res = await axios.get(`${API_BASE}/products`, {
      params: { isFeatured: true, limit: 4 },
    })
    if (res.data?.data && res.data.data.length > 0) {
      return res.data.data.map(normalizeProduct)
    }
  } catch (err) {
    console.warn('[storefrontService] Failed to fetch best sellers from API:', err.message)
  }
  return BEST_SELLERS.map(normalizeProduct)
}

export async function fetchStorefrontCategories() {
  try {
    const res = await axios.get(`${API_BASE}/categories`)
    if (res.data?.data && res.data.data.length > 0) {
      return res.data.data
    }
  } catch (err) {
    console.warn('[storefrontService] Failed to fetch categories from API:', err.message)
  }
  return CATEGORIES
}

export async function fetchStorefrontBrands() {
  try {
    const res = await axios.get(`${API_BASE}/brands`)
    if (res.data?.data && res.data.data.length > 0) {
      return res.data.data
    }
  } catch (err) {
    console.warn('[storefrontService] Failed to fetch brands from API:', err.message)
  }
  return BRANDS
}

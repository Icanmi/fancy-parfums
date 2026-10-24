import { supabaseAdmin } from '../lib/supabaseAdmin.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllProducts({ search, categoryId, brandId, isActive, sortBy = 'id', sortDir = 'asc' } = {}) {
  let query = supabaseAdmin
    .from('products')
    .select('*, brands(id, name, slug), categories(id, name, slug)')

  if (isActive !== undefined && isActive !== 'all') {
    query = query.eq('is_active', isActive === 'true' || isActive === true)
  }

  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId)
  }

  if (brandId && brandId !== 'all') {
    query = query.eq('brand_id', brandId)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`)
  }

  const ascending = sortDir === 'asc'
  query = query.order(sortBy, { ascending })

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getProductById(id) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, brands(id, name, slug), categories(id, name, slug)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProduct(productData) {
  const {
    name,
    description = '',
    price,
    compare_at_price,
    compareAtPrice,
    brand_id,
    brandId,
    category_id,
    categoryId,
    gender = 'Unisex',
    fragrance_family,
    fragranceFamily,
    concentration = 'Eau de Parfum',
    size = '100ml',
    sizes = [],
    stock_quantity = 0,
    stockQuantity,
    sku,
    image_url,
    image,
    images = [],
    is_featured = false,
    isFeatured,
    is_active = true,
    isActive,
    notes = { top: [], middle: [], base: [] },
  } = productData

  if (!name || name.trim().length < 2) {
    throw new Error('Product name is required (minimum 2 characters).')
  }

  const parsedPrice = Number(price)
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new Error('Valid price is required.')
  }

  const generatedSlug = slugify(productData.slug || name)
  const finalSku = sku || `SKU-${Date.now()}`

  const row = {
    name: name.trim(),
    slug: generatedSlug,
    description,
    price: parsedPrice,
    compare_at_price: compare_at_price !== undefined ? compare_at_price : compareAtPrice ? Number(compareAtPrice) : null,
    brand_id: brand_id || brandId || null,
    category_id: category_id || categoryId || null,
    gender,
    fragrance_family: fragrance_family || fragranceFamily || null,
    concentration,
    size,
    sizes: sizes.length ? sizes : [size],
    default_size: size,
    stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : stockQuantity !== undefined ? Number(stockQuantity) : 0,
    sku: finalSku,
    image_url: image_url || image || '/images/sauvage.jpg',
    images: images.length ? images : [image_url || image || '/images/sauvage.jpg'],
    is_featured: is_featured !== undefined ? Boolean(is_featured) : Boolean(isFeatured),
    is_active: is_active !== undefined ? Boolean(is_active) : isActive !== undefined ? Boolean(isActive) : true,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(row)
    .select('*, brands(id, name, slug), categories(id, name, slug)')
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  const allowedFields = [
    'name', 'slug', 'description', 'price', 'compare_at_price',
    'brand_id', 'category_id', 'gender', 'fragrance_family',
    'concentration', 'size', 'sizes', 'default_size', 'stock_quantity',
    'sku', 'image_url', 'images', 'is_featured', 'is_active', 'notes'
  ]

  const payload = {}
  for (const key of Object.keys(updates)) {
    // Map camelCase to snake_case if passed from frontend
    let dbKey = key
    if (key === 'compareAtPrice') dbKey = 'compare_at_price'
    if (key === 'brandId') dbKey = 'brand_id'
    if (key === 'categoryId') dbKey = 'category_id'
    if (key === 'fragranceFamily') dbKey = 'fragrance_family'
    if (key === 'stockQuantity') dbKey = 'stock_quantity'
    if (key === 'imageUrl' || key === 'image') dbKey = 'image_url'
    if (key === 'isFeatured') dbKey = 'is_featured'
    if (key === 'isActive') dbKey = 'is_active'

    if (allowedFields.includes(dbKey)) {
      payload[dbKey] = updates[key]
    }
  }

  if (payload.price !== undefined) payload.price = Number(payload.price)
  if (payload.compare_at_price !== undefined && payload.compare_at_price !== null) {
    payload.compare_at_price = Number(payload.compare_at_price)
  }
  if (payload.stock_quantity !== undefined) payload.stock_quantity = Number(payload.stock_quantity)
  if (payload.name && !payload.slug) payload.slug = slugify(payload.name)
  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*, brands(id, name, slug), categories(id, name, slug)')
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id, { soft = false } = {}) {
  if (soft) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

export async function updateStock(id, newQuantity) {
  const qty = Math.max(0, parseInt(newQuantity, 10))
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ stock_quantity: qty, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, name, stock_quantity')
    .single()

  if (error) throw error
  return data
}

export async function getAllCategories() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getAllBrands() {
  const { data, error } = await supabaseAdmin
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

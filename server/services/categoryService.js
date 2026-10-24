import { supabaseAdmin } from '../lib/supabaseAdmin.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllCategories({ search, isActive, sortBy = 'name', sortDir = 'asc' } = {}) {
  let query = supabaseAdmin
    .from('categories')
    .select('*, products(id)')

  if (isActive !== undefined && isActive !== 'all') {
    query = query.eq('is_active', isActive === 'true' || isActive === true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const ascending = sortDir === 'asc'
  query = query.order(sortBy, { ascending })

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((c) => ({
    ...c,
    image: c.image_url || '/images/categories/designer.jpg',
    productCount: c.products ? c.products.length : 0,
  }))
}

export async function getCategoryById(id) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*, products(id)')
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    image: data.image_url || '/images/categories/designer.jpg',
    productCount: data.products ? data.products.length : 0,
  }
}

export async function createCategory(catData) {
  const {
    name,
    slug,
    description = '',
    image,
    image_url,
    imageUrl,
    is_active,
    isActive,
  } = catData

  if (!name || name.trim().length < 2) {
    throw new Error('Category name is required (minimum 2 characters).')
  }

  const generatedSlug = slugify(slug || name)
  if (!generatedSlug) {
    throw new Error('Valid category slug is required.')
  }

  // Check for duplicate slug
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', generatedSlug)
    .maybeSingle()

  if (existing) {
    throw new Error(`A category with slug "${generatedSlug}" already exists.`)
  }

  const active = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : true)

  const row = {
    name: name.trim(),
    slug: generatedSlug,
    description: description ? description.trim() : null,
    image_url: image_url || imageUrl || image || null,
    is_active: active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(row)
    .select('*')
    .single()

  if (error) throw error
  return {
    ...data,
    image: data.image_url,
  }
}

export async function updateCategory(id, updates) {
  const allowedFields = ['name', 'slug', 'description', 'image_url', 'is_active']
  const payload = {}

  for (const key of Object.keys(updates)) {
    let dbKey = key
    if (key === 'image' || key === 'imageUrl') dbKey = 'image_url'
    if (key === 'isActive') dbKey = 'is_active'

    if (allowedFields.includes(dbKey)) {
      payload[dbKey] = updates[key]
    }
  }

  if (payload.name && payload.name.trim().length < 2) {
    throw new Error('Category name must be at least 2 characters.')
  }

  if (payload.slug) {
    payload.slug = slugify(payload.slug)
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', payload.slug)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      throw new Error(`A category with slug "${payload.slug}" already exists.`)
    }
  }

  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return {
    ...data,
    image: data.image_url,
  }
}

export async function deleteCategory(id) {
  // Check if any products use this category
  const { data: linkedProducts, error: checkError } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .eq('category_id', id)
    .limit(5)

  if (checkError) throw checkError

  if (linkedProducts && linkedProducts.length > 0) {
    const names = linkedProducts.map((p) => p.name).join(', ')
    throw new Error(`Cannot delete category. It is linked to ${linkedProducts.length} product(s): ${names}. Reassign or remove these products first.`)
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

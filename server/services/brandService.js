import { supabaseAdmin } from '../lib/supabaseAdmin.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllBrands({ search, isActive, sortBy = 'name', sortDir = 'asc' } = {}) {
  let query = supabaseAdmin
    .from('brands')
    .select('*, products(id)')

  if (isActive !== undefined && isActive !== 'all') {
    query = query.eq('is_active', isActive === 'true' || isActive === true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,origin.ilike.%${search}%`)
  }

  const ascending = sortDir === 'asc'
  query = query.order(sortBy, { ascending })

  const { data, error } = await query
  if (error) throw error

  return (data || []).map((b) => ({
    ...b,
    productCount: b.products ? b.products.length : 0,
  }))
}

export async function getBrandById(id) {
  const { data, error } = await supabaseAdmin
    .from('brands')
    .select('*, products(id)')
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) return null

  return {
    ...data,
    productCount: data.products ? data.products.length : 0,
  }
}

export async function createBrand(brandData) {
  const {
    name,
    slug,
    description = '',
    origin = '',
    logo_url,
    logoUrl,
    is_active,
    isActive,
    featured,
  } = brandData

  if (!name || name.trim().length < 2) {
    throw new Error('Brand name is required (minimum 2 characters).')
  }

  const generatedSlug = slugify(slug || name)
  if (!generatedSlug) {
    throw new Error('Valid brand slug is required.')
  }

  // Check for duplicate slug
  const { data: existing } = await supabaseAdmin
    .from('brands')
    .select('id')
    .eq('slug', generatedSlug)
    .maybeSingle()

  if (existing) {
    throw new Error(`A brand with slug "${generatedSlug}" already exists.`)
  }

  const active = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : true)

  const row = {
    name: name.trim(),
    slug: generatedSlug,
    description: description ? description.trim() : null,
    origin: origin ? origin.trim() : null,
    logo_url: logo_url || logoUrl || null,
    is_active: active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('brands')
    .insert(row)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateBrand(id, updates) {
  const allowedFields = ['name', 'slug', 'description', 'origin', 'logo_url', 'is_active']
  const payload = {}

  for (const key of Object.keys(updates)) {
    let dbKey = key
    if (key === 'logoUrl') dbKey = 'logo_url'
    if (key === 'isActive') dbKey = 'is_active'

    if (allowedFields.includes(dbKey)) {
      payload[dbKey] = updates[key]
    }
  }

  if (payload.name && payload.name.trim().length < 2) {
    throw new Error('Brand name must be at least 2 characters.')
  }

  if (payload.slug) {
    payload.slug = slugify(payload.slug)
    // Check if another brand has this slug
    const { data: existing } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('slug', payload.slug)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      throw new Error(`A brand with slug "${payload.slug}" already exists.`)
    }
  }

  payload.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('brands')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteBrand(id) {
  // Check if any products use this brand
  const { data: linkedProducts, error: checkError } = await supabaseAdmin
    .from('products')
    .select('id, name')
    .eq('brand_id', id)
    .limit(5)

  if (checkError) throw checkError

  if (linkedProducts && linkedProducts.length > 0) {
    const names = linkedProducts.map((p) => p.name).join(', ')
    throw new Error(`Cannot delete brand. It is linked to ${linkedProducts.length} product(s): ${names}. Reassign or remove these products first.`)
  }

  const { data, error } = await supabaseAdmin
    .from('brands')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

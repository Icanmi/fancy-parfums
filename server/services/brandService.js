import { query } from '../lib/db.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllBrands({ search, isActive, sortBy = 'name', sortDir = 'asc' } = {}) {
  const conditions = []
  const params = []

  if (isActive !== undefined && isActive !== 'all') {
    params.push(isActive === 'true' || isActive === true)
    conditions.push(`b.is_active = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    const idx = params.length
    conditions.push(`(b.name ILIKE $${idx} OR b.description ILIKE $${idx} OR b.origin ILIKE $${idx})`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const validSortCols = ['id', 'name', 'created_at']
  const safeSort = validSortCols.includes(sortBy) ? `b.${sortBy}` : 'b.name'
  const safeDir = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC'

  const sql = `
    SELECT 
      b.*,
      COUNT(p.id)::int AS "productCount"
    FROM public.brands b
    LEFT JOIN public.products p ON p.brand_id = b.id
    ${whereClause}
    GROUP BY b.id
    ORDER BY ${safeSort} ${safeDir}
  `

  return query(sql, params)
}

export async function getBrandById(id) {
  const sql = `
    SELECT 
      b.*,
      COUNT(p.id)::int AS "productCount"
    FROM public.brands b
    LEFT JOIN public.products p ON p.brand_id = b.id
    WHERE b.id = $1
    GROUP BY b.id
    LIMIT 1
  `
  const rows = await query(sql, [id])
  return rows[0] || null
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
  } = brandData

  if (!name || name.trim().length < 2) {
    throw new Error('Brand name is required (minimum 2 characters).')
  }

  const generatedSlug = slugify(slug || name)
  if (!generatedSlug) {
    throw new Error('Valid brand slug is required.')
  }

  const existing = await query('SELECT id FROM public.brands WHERE slug = $1 LIMIT 1', [generatedSlug])
  if (existing.length > 0) {
    throw new Error(`A brand with slug "${generatedSlug}" already exists.`)
  }

  const active = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : true)

  const insertSql = `
    INSERT INTO public.brands (name, slug, description, origin, logo_url, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, now(), now())
    RETURNING *
  `

  const rows = await query(insertSql, [
    name.trim(),
    generatedSlug,
    description ? description.trim() : null,
    origin ? origin.trim() : null,
    logo_url || logoUrl || null,
    active
  ])

  return rows[0]
}

export async function updateBrand(id, updates) {
  const allowedFields = ['name', 'slug', 'description', 'origin', 'logo_url', 'is_active']
  const setClauses = []
  const params = []

  for (const key of Object.keys(updates)) {
    let dbKey = key
    if (key === 'logoUrl') dbKey = 'logo_url'
    if (key === 'isActive') dbKey = 'is_active'

    if (allowedFields.includes(dbKey)) {
      params.push(updates[key])
      setClauses.push(`${dbKey} = $${params.length}`)
    }
  }

  if (updates.name && updates.name.trim().length < 2) {
    throw new Error('Brand name must be at least 2 characters.')
  }

  if (updates.slug) {
    const slug = slugify(updates.slug)
    const existing = await query('SELECT id FROM public.brands WHERE slug = $1 AND id != $2 LIMIT 1', [slug, id])
    if (existing.length > 0) {
      throw new Error(`A brand with slug "${slug}" already exists.`)
    }
  }

  setClauses.push('updated_at = now()')
  params.push(id)

  const updateSql = `
    UPDATE public.brands
    SET ${setClauses.join(', ')}
    WHERE id = $${params.length}
    RETURNING *
  `

  const rows = await query(updateSql, params)
  return rows[0]
}

export async function deleteBrand(id) {
  const linked = await query('SELECT id, name FROM public.products WHERE brand_id = $1 LIMIT 5', [id])
  if (linked.length > 0) {
    const names = linked.map((p) => p.name).join(', ')
    throw new Error(`Cannot delete brand. It is linked to ${linked.length} product(s): ${names}. Reassign or remove these products first.`)
  }

  const rows = await query('DELETE FROM public.brands WHERE id = $1 RETURNING *', [id])
  return rows[0]
}

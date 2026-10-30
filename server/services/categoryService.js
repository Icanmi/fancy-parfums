import { query } from '../lib/db.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllCategories({ search, isActive, sortBy = 'name', sortDir = 'asc' } = {}) {
  const conditions = []
  const params = []

  if (isActive !== undefined && isActive !== 'all') {
    params.push(isActive === 'true' || isActive === true)
    conditions.push(`c.is_active = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    const idx = params.length
    conditions.push(`(c.name ILIKE $${idx} OR c.description ILIKE $${idx})`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const validSortCols = ['id', 'name', 'created_at']
  const safeSort = validSortCols.includes(sortBy) ? `c.${sortBy}` : 'c.name'
  const safeDir = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC'

  const sql = `
    SELECT 
      c.*,
      COUNT(p.id)::int AS "productCount"
    FROM public.categories c
    LEFT JOIN public.products p ON p.category_id = c.id
    ${whereClause}
    GROUP BY c.id
    ORDER BY ${safeSort} ${safeDir}
  `

  const rows = await query(sql, params)
  return rows.map((c) => ({
    ...c,
    image: c.image_url || '/images/categories/designer.jpg',
  }))
}

export async function getCategoryById(id) {
  const sql = `
    SELECT 
      c.*,
      COUNT(p.id)::int AS "productCount"
    FROM public.categories c
    LEFT JOIN public.products p ON p.category_id = c.id
    WHERE c.id = $1
    GROUP BY c.id
    LIMIT 1
  `
  const rows = await query(sql, [id])
  if (rows.length === 0) return null

  const c = rows[0]
  return {
    ...c,
    image: c.image_url || '/images/categories/designer.jpg',
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

  const existing = await query('SELECT id FROM public.categories WHERE slug = $1 LIMIT 1', [generatedSlug])
  if (existing.length > 0) {
    throw new Error(`A category with slug "${generatedSlug}" already exists.`)
  }

  const active = is_active !== undefined ? Boolean(is_active) : (isActive !== undefined ? Boolean(isActive) : true)

  const insertSql = `
    INSERT INTO public.categories (name, slug, description, image_url, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, now(), now())
    RETURNING *
  `

  const rows = await query(insertSql, [
    name.trim(),
    generatedSlug,
    description ? description.trim() : null,
    image_url || imageUrl || image || null,
    active
  ])

  const c = rows[0]
  return {
    ...c,
    image: c.image_url,
  }
}

export async function updateCategory(id, updates) {
  const allowedFields = ['name', 'slug', 'description', 'image_url', 'is_active']
  const setClauses = []
  const params = []

  for (const key of Object.keys(updates)) {
    let dbKey = key
    if (key === 'image' || key === 'imageUrl') dbKey = 'image_url'
    if (key === 'isActive') dbKey = 'is_active'

    if (allowedFields.includes(dbKey)) {
      params.push(updates[key])
      setClauses.push(`${dbKey} = $${params.length}`)
    }
  }

  if (updates.name && updates.name.trim().length < 2) {
    throw new Error('Category name must be at least 2 characters.')
  }

  if (updates.slug) {
    const slug = slugify(updates.slug)
    const existing = await query('SELECT id FROM public.categories WHERE slug = $1 AND id != $2 LIMIT 1', [slug, id])
    if (existing.length > 0) {
      throw new Error(`A category with slug "${slug}" already exists.`)
    }
  }

  setClauses.push('updated_at = now()')
  params.push(id)

  const updateSql = `
    UPDATE public.categories
    SET ${setClauses.join(', ')}
    WHERE id = $${params.length}
    RETURNING *
  `

  const rows = await query(updateSql, params)
  const c = rows[0]
  return {
    ...c,
    image: c.image_url,
  }
}

export async function deleteCategory(id) {
  const linked = await query('SELECT id, name FROM public.products WHERE category_id = $1 LIMIT 5', [id])
  if (linked.length > 0) {
    const names = linked.map((p) => p.name).join(', ')
    throw new Error(`Cannot delete category. It is linked to ${linked.length} product(s): ${names}. Reassign or remove these products first.`)
  }

  const rows = await query('DELETE FROM public.categories WHERE id = $1 RETURNING *', [id])
  return rows[0]
}

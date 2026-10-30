import { query } from '../lib/db.js'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllProducts({ search, categoryId, brandId, isActive, sortBy = 'id', sortDir = 'asc' } = {}) {
  const conditions = []
  const params = []

  if (isActive !== undefined && isActive !== 'all') {
    params.push(isActive === 'true' || isActive === true)
    conditions.push(`p.is_active = $${params.length}`)
  }

  if (categoryId && categoryId !== 'all') {
    params.push(Number(categoryId))
    conditions.push(`p.category_id = $${params.length}`)
  }

  if (brandId && brandId !== 'all') {
    params.push(Number(brandId))
    conditions.push(`p.brand_id = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    const idx = params.length
    conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const validSortCols = ['id', 'name', 'price', 'created_at', 'stock_quantity', 'rating']
  const safeSort = validSortCols.includes(sortBy) ? `p.${sortBy}` : 'p.id'
  const safeDir = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC'

  const sql = `
    SELECT 
      p.*,
      CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) ELSE NULL END AS brands,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
    FROM public.products p
    LEFT JOIN public.brands b ON p.brand_id = b.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY ${safeSort} ${safeDir}
  `

  return query(sql, params)
}

export async function getProductById(id) {
  const sql = `
    SELECT 
      p.*,
      CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'slug', b.slug) ELSE NULL END AS brands,
      CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) ELSE NULL END AS categories
    FROM public.products p
    LEFT JOIN public.brands b ON p.brand_id = b.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.id = $1
    LIMIT 1
  `
  const rows = await query(sql, [id])
  return rows[0] || null
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
  const compPrice = compare_at_price !== undefined ? compare_at_price : compareAtPrice ? Number(compareAtPrice) : null
  const bId = brand_id || brandId || null
  const cId = category_id || categoryId || null
  const ff = fragrance_family || fragranceFamily || null
  const finalSizes = sizes.length ? sizes : [size]
  const finalStock = stock_quantity !== undefined ? Number(stock_quantity) : stockQuantity !== undefined ? Number(stockQuantity) : 0
  const finalImg = image_url || image || '/images/sauvage.jpg'
  const finalImgs = images.length ? images : [finalImg]
  const feat = is_featured !== undefined ? Boolean(is_featured) : Boolean(isFeatured)
  const act = is_active !== undefined ? Boolean(is_active) : isActive !== undefined ? Boolean(isActive) : true

  const insertSql = `
    INSERT INTO public.products (
      name, slug, description, price, compare_at_price,
      brand_id, category_id, gender, fragrance_family, concentration,
      size, sizes, default_size, stock_quantity, sku,
      image_url, images, is_featured, is_active, notes,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20,
      now(), now()
    )
    RETURNING id
  `

  const insertRes = await query(insertSql, [
    name.trim(), generatedSlug, description, parsedPrice, compPrice,
    bId, cId, gender, ff, concentration,
    size, finalSizes, size, finalStock, finalSku,
    finalImg, finalImgs, feat, act, JSON.stringify(notes)
  ])

  return getProductById(insertRes[0].id)
}

export async function updateProduct(id, updates) {
  const allowedFields = [
    'name', 'slug', 'description', 'price', 'compare_at_price',
    'brand_id', 'category_id', 'gender', 'fragrance_family',
    'concentration', 'size', 'sizes', 'default_size', 'stock_quantity',
    'sku', 'image_url', 'images', 'is_featured', 'is_active', 'notes'
  ]

  const setClauses = []
  const params = []

  for (const key of Object.keys(updates)) {
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
      let val = updates[key]
      if (dbKey === 'price') val = Number(val)
      if (dbKey === 'compare_at_price' && val !== null) val = Number(val)
      if (dbKey === 'stock_quantity') val = Number(val)
      if (dbKey === 'notes') val = JSON.stringify(val)

      params.push(val)
      setClauses.push(`${dbKey} = $${params.length}`)
    }
  }

  if (updates.name && !updates.slug) {
    params.push(slugify(updates.name))
    setClauses.push(`slug = $${params.length}`)
  }

  setClauses.push(`updated_at = now()`)
  params.push(id)

  const updateSql = `
    UPDATE public.products
    SET ${setClauses.join(', ')}
    WHERE id = $${params.length}
    RETURNING id
  `

  await query(updateSql, params)
  return getProductById(id)
}

export async function deleteProduct(id, { soft = false } = {}) {
  if (soft) {
    const rows = await query(
      'UPDATE public.products SET is_active = false, updated_at = now() WHERE id = $1 RETURNING *',
      [id]
    )
    return rows[0]
  } else {
    const rows = await query(
      'DELETE FROM public.products WHERE id = $1 RETURNING *',
      [id]
    )
    return rows[0]
  }
}

export async function updateStock(id, newQuantity) {
  const qty = Math.max(0, parseInt(newQuantity, 10))
  const rows = await query(
    'UPDATE public.products SET stock_quantity = $1, updated_at = now() WHERE id = $2 RETURNING id, name, stock_quantity',
    [qty, id]
  )
  return rows[0]
}

export async function getAllCategories() {
  return query('SELECT * FROM public.categories ORDER BY name ASC')
}

export async function getAllBrands() {
  return query('SELECT * FROM public.brands ORDER BY name ASC')
}

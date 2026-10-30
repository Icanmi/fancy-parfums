import express from 'express'
import { query } from '../lib/db.js'

const router = express.Router()

// GET /api/products — Public active catalog
router.get('/products', async (req, res, next) => {
  try {
    const {
      search,
      category,
      categoryId,
      brand,
      brandId,
      gender,
      isFeatured,
      limit,
      sortBy = 'created_at',
      sortDir = 'desc',
    } = req.query

    const conditions = ['p.is_active = true']
    const params = []

    if (category) {
      if (isNaN(category)) {
        params.push(category)
        conditions.push(`c.slug = $${params.length}`)
      } else {
        params.push(Number(category))
        conditions.push(`p.category_id = $${params.length}`)
      }
    } else if (categoryId) {
      params.push(Number(categoryId))
      conditions.push(`p.category_id = $${params.length}`)
    }

    if (brand) {
      if (isNaN(brand)) {
        params.push(brand)
        conditions.push(`b.slug = $${params.length}`)
      } else {
        params.push(Number(brand))
        conditions.push(`p.brand_id = $${params.length}`)
      }
    } else if (brandId) {
      params.push(Number(brandId))
      conditions.push(`p.brand_id = $${params.length}`)
    }

    if (gender) {
      params.push(gender)
      conditions.push(`p.gender ILIKE $${params.length}`)
    }

    if (isFeatured === 'true' || isFeatured === true) {
      conditions.push(`p.is_featured = true`)
    }

    if (search) {
      params.push(`%${search}%`)
      const idx = params.length
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.fragrance_family ILIKE $${idx})`)
    }

    const validSortCols = ['id', 'name', 'price', 'created_at', 'rating', 'review_count']
    const safeSort = validSortCols.includes(sortBy) ? `p.${sortBy}` : 'p.created_at'
    const safeDir = String(sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    let limitClause = ''
    if (limit && !isNaN(limit)) {
      params.push(Number(limit))
      limitClause = `LIMIT $${params.length}`
    }

    const sql = `
      SELECT 
        p.*,
        CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'slug', b.slug, 'logo_url', b.logo_url) ELSE NULL END AS brands,
        CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image_url', c.image_url) ELSE NULL END AS categories
      FROM public.products p
      LEFT JOIN public.brands b ON p.brand_id = b.id
      LEFT JOIN public.categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${safeSort} ${safeDir}
      ${limitClause}
    `

    const data = await query(sql, params)

    res.json({
      success: true,
      count: data.length,
      data,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:idOrSlug — Single product
router.get('/products/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params

    let filterClause = ''
    let paramVal = idOrSlug

    if (!isNaN(idOrSlug)) {
      filterClause = 'p.id = $1'
      paramVal = Number(idOrSlug)
    } else {
      filterClause = 'p.slug = $1'
    }

    const sql = `
      SELECT 
        p.*,
        CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'slug', b.slug, 'logo_url', b.logo_url, 'description', b.description) ELSE NULL END AS brands,
        CASE WHEN c.id IS NOT NULL THEN json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'image_url', c.image_url, 'description', c.description) ELSE NULL END AS categories
      FROM public.products p
      LEFT JOIN public.brands b ON p.brand_id = b.id
      LEFT JOIN public.categories c ON p.category_id = c.id
      WHERE ${filterClause} AND p.is_active = true
      LIMIT 1
    `

    const rows = await query(sql, [paramVal])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    res.json({
      success: true,
      data: rows[0],
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/categories — Active categories with product count
router.get('/categories', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.image_url,
        COUNT(p.id)::int AS "productCount"
      FROM public.categories c
      LEFT JOIN public.products p ON p.category_id = c.id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `

    const rows = await query(sql)
    const mapped = rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image_url || '/images/categories/designer.jpg',
      productCount: c.productCount,
    }))

    res.json({
      success: true,
      data: mapped,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/brands — Active brands with product count
router.get('/brands', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        b.id, b.name, b.slug, b.description, b.logo_url, b.origin,
        COUNT(p.id)::int AS "productCount"
      FROM public.brands b
      LEFT JOIN public.products p ON p.brand_id = b.id AND p.is_active = true
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY b.name ASC
    `

    const rows = await query(sql)
    const mapped = rows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      logoUrl: b.logo_url,
      logoText: b.name.toUpperCase(),
      origin: b.origin || 'Paris, France',
      productCount: b.productCount,
    }))

    res.json({
      success: true,
      data: mapped,
    })
  } catch (err) {
    next(err)
  }
})

export default router

import express from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'

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

    let query = supabaseAdmin
      .from('products')
      .select('*, brands(id, name, slug, logo_url), categories(id, name, slug, image_url)')
      .eq('is_active', true)

    if (category) {
      // Can be category ID or slug
      if (isNaN(category)) {
        // Query by joined category slug if supported, or via category_id
        const { data: catData } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single()
        if (catData?.id) {
          query = query.eq('category_id', catData.id)
        }
      } else {
        query = query.eq('category_id', Number(category))
      }
    } else if (categoryId) {
      query = query.eq('category_id', Number(categoryId))
    }

    if (brand) {
      if (isNaN(brand)) {
        const { data: brandData } = await supabaseAdmin
          .from('brands')
          .select('id')
          .eq('slug', brand)
          .single()
        if (brandData?.id) {
          query = query.eq('brand_id', brandData.id)
        }
      } else {
        query = query.eq('brand_id', Number(brand))
      }
    } else if (brandId) {
      query = query.eq('brand_id', Number(brandId))
    }

    if (gender) {
      query = query.ilike('gender', gender)
    }

    if (isFeatured === 'true' || isFeatured === true) {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,fragrance_family.ilike.%${search}%`)
    }

    const ascending = sortDir === 'asc'
    query = query.order(sortBy, { ascending })

    if (limit) {
      query = query.limit(Number(limit))
    }

    const { data, error } = await query
    if (error) throw error

    res.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:idOrSlug — Single product
router.get('/products/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params

    let query = supabaseAdmin
      .from('products')
      .select('*, brands(id, name, slug, logo_url, description), categories(id, name, slug, image_url, description)')
      .eq('is_active', true)

    if (!isNaN(idOrSlug)) {
      query = query.eq('id', Number(idOrSlug))
    } else {
      query = query.eq('slug', idOrSlug)
    }

    const { data, error } = await query.maybeSingle()
    if (error) throw error

    if (!data) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    res.json({
      success: true,
      data,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/categories — Active categories with product count
router.get('/categories', async (req, res, next) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*, products(id)')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    const mapped = (categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image_url || '/images/categories/designer.jpg',
      productCount: c.products ? c.products.length : 0,
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
    const { data: brands, error } = await supabaseAdmin
      .from('brands')
      .select('*, products(id)')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error

    const mapped = (brands || []).map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      description: b.description,
      logoUrl: b.logo_url,
      logoText: b.name.toUpperCase(),
      origin: b.origin || 'Paris, France',
      productCount: b.products ? b.products.length : 0,
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

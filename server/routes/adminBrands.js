import { Router } from 'express'
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/brandService.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require administrator authentication
router.use(requireAdmin)

// GET /api/admin/brands — List brands
router.get('/', async (req, res, next) => {
  try {
    const { search, isActive, sortBy, sortDir } = req.query
    const brands = await getAllBrands({ search, isActive, sortBy, sortDir })
    res.json({ success: true, data: brands, count: brands.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/brands/:id — Single brand
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const brand = await getBrandById(id)
    if (!brand) {
      return res.status(404).json({ success: false, error: 'Brand not found' })
    }
    res.json({ success: true, data: brand })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/brands — Create brand in Supabase
router.post('/', async (req, res, next) => {
  try {
    const brand = await createBrand(req.body)
    res.status(201).json({
      success: true,
      message: 'Brand successfully created in Supabase',
      data: brand,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/brands/:id — Update brand in Supabase
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await updateBrand(id, req.body)
    res.json({
      success: true,
      message: 'Brand successfully updated in Supabase',
      data: updated,
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/brands/:id — Delete brand in Supabase
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await deleteBrand(id)
    res.json({
      success: true,
      message: 'Brand deleted successfully from Supabase',
      data: { id },
    })
  } catch (err) {
    next(err)
  }
})

export default router

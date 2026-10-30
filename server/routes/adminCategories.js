import { Router } from 'express'
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require administrator authentication
router.use(requireAdmin)

// GET /api/admin/categories — List categories
router.get('/', async (req, res, next) => {
  try {
    const { search, isActive, sortBy, sortDir } = req.query
    const categories = await getAllCategories({ search, isActive, sortBy, sortDir })
    res.json({ success: true, data: categories, count: categories.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/categories/:id — Single category
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const category = await getCategoryById(id)
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }
    res.json({ success: true, data: category })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/categories — Create category
router.post('/', async (req, res, next) => {
  try {
    const category = await createCategory(req.body)
    res.status(201).json({
      success: true,
      message: 'Category successfully created',
      data: category,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/categories/:id — Update category
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await updateCategory(id, req.body)
    res.json({
      success: true,
      message: 'Category successfully updated',
      data: updated,
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/categories/:id — Delete category
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    await deleteCategory(id)
    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: { id },
    })
  } catch (err) {
    next(err)
  }
})

export default router

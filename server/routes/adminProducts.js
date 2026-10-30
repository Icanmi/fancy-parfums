import { Router } from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../services/productService.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require administrator authentication
router.use(requireAdmin)

// GET /api/admin/products
router.get('/products', async (req, res, next) => {
  try {
    const { search, categoryId, brandId, isActive, sortBy, sortDir } = req.query
    const products = await getAllProducts({
      search,
      categoryId,
      brandId,
      isActive,
      sortBy,
      sortDir,
    })
    res.json({ success: true, data: products, count: products.length })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/products/:id
router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await getProductById(id)
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }
    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/products
router.post('/products', async (req, res, next) => {
  try {
    const product = await createProduct(req.body)
    res.status(201).json({
      success: true,
      message: 'Product successfully created',
      data: product,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/products/:id
router.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await updateProduct(id, req.body)
    res.json({
      success: true,
      message: 'Product successfully updated',
      data: updated,
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const soft = req.query.soft === 'true'
    await deleteProduct(id, { soft })
    res.json({
      success: true,
      message: `Product ${soft ? 'deactivated' : 'deleted'} successfully`,
      data: { id },
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/products/:id/stock
router.patch('/products/:id/stock', async (req, res, next) => {
  try {
    const { id } = req.params
    const { stockQuantity } = req.body
    if (stockQuantity === undefined) {
      return res.status(400).json({ success: false, error: 'stockQuantity is required' })
    }
    const updated = await updateStock(id, stockQuantity)
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updated,
    })
  } catch (err) {
    next(err)
  }
})

export default router

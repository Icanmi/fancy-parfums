import { Router } from 'express'
import { validateCoupon } from '../services/orderService.js'

const router = Router()

/**
 * POST /api/coupons/validate
 * Body: { code: string }
 * Returns coupon data if valid, 400 with message if invalid.
 * No authentication required — server-side validation only.
 */
router.post('/coupons/validate', async (req, res, next) => {
  try {
    const { code } = req.body

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, valid: false, message: 'Coupon code is required.' })
    }

    const coupon = await validateCoupon(code)

    return res.json({
      success: true,
      valid: true,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      minimum_order_amount: Number(coupon.minimum_order_amount),
      maximum_discount: coupon.maximum_discount ? Number(coupon.maximum_discount) : null,
      code: coupon.code,
    })
  } catch (err) {
    // Validation failures are user-facing, not server errors
    return res.status(400).json({
      success: false,
      valid: false,
      message: err.message || 'Invalid or expired coupon code.',
    })
  }
})

export default router

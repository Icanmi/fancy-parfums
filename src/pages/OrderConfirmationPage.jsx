import { useEffect } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiCheckboxCircleFill,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiTruckLine,
  RiArrowRightLine,
  RiFileList3Line,
} from 'react-icons/ri'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useAdminData } from '../context/AdminDataContext'

function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG')
}

function addBusinessDays(days) {
  const date = new Date()
  let added = 0
  while (added < days) {
    date.setDate(date.getDate() + 1)
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) added++
  }
  return date.toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { orders } = useAdminData()

  // Order can come from navigation state (immediate post-checkout) or from context (reload)
  const order = location.state?.order || orders.find((o) => o.id === id)

  useEffect(() => {
    if (!order) {
      // If no order found at all, redirect to shop after a brief delay
      const t = setTimeout(() => navigate('/shop'), 2500)
      return () => clearTimeout(t)
    }
  }, [order])

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500">Loading your order details…</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const estimatedDelivery =
    order.deliveryMethod === 'express' ? addBusinessDays(2) : addBusinessDays(5)

  const shippingAddr = typeof order.shippingAddress === 'string'
    ? order.shippingAddress
    : `${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-[760px] mx-auto px-4 md:px-8">

          {/* ── Celebration Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-[#0A0A0A] text-white rounded-sm p-8 md:p-12 text-center mb-8 border border-[#D4AF37]/30 shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-5"
            >
              <RiCheckboxCircleFill size={34} className="text-[#D4AF37]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-2">
                Order Confirmed &amp; Allocated
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-white mb-2">
                Thank you, {order.customerName?.split(' ')[0] || 'Valued Client'}!
              </h1>
              <p className="text-sm text-[#A89F91] max-w-md mx-auto">
                Your fragrance order has been received and is being prepared for dispatch.
                A confirmation has been sent to <strong className="text-white">{order.customerEmail}</strong>.
              </p>
            </motion.div>
          </motion.div>

          {/* ── Order Reference Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden mb-6"
          >
            {/* Reference Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-gray-100">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">Order Reference</p>
                <p className="text-lg font-mono font-bold text-[#0A0A0A]">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-amber-50 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Processing
                </span>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="flex items-center gap-3 p-5 bg-emerald-50 border-b border-emerald-100">
              <RiTruckLine size={18} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Estimated Delivery</p>
                <p className="text-sm font-semibold text-[#0A0A0A]">{estimatedDelivery}</p>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="p-5 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Contact</p>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <RiPhoneLine size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <RiMailLine size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span className="break-all">{order.customerEmail}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Delivery To</p>
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <RiMapPinLine size={14} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                  <span>{shippingAddr}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Items Breakdown ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="bg-white rounded-sm border border-gray-200 shadow-sm mb-6"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <RiFileList3Line size={15} className="text-[#D4AF37]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
                Your Fragrances
              </h2>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded bg-gray-50 border border-gray-100 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">{item.brand}</p>
                    <p className="text-xs font-semibold text-[#0A0A0A] truncate">{item.name}</p>
                    {item.size && <p className="text-[11px] text-gray-500">{item.size}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-gray-500">×{item.quantity}</p>
                    <p className="text-xs font-bold text-[#0A0A0A]">{formatNaira(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="p-5 border-t border-gray-100 bg-[#FAFAF8] space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-black">{formatNaira(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>Promo Discount</span>
                  <span className="font-semibold">−{formatNaira(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-600">
                <span>Shipping</span>
                <span className={`font-semibold ${order.shippingFee === 0 ? 'text-emerald-600' : 'text-black'}`}>
                  {order.shippingFee === 0 ? 'FREE' : formatNaira(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                <span className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A]">Total Paid</span>
                <span className="text-xl font-bold text-[#0A0A0A] font-serif">{formatNaira(order.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* ── Actions ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/profile"
              id="view-orders-btn"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-[#D4AF37] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-widest rounded-sm transition-all no-underline"
            >
              <RiFileList3Line size={16} /> View in My Orders
            </Link>
            <Link
              to="/shop"
              id="continue-shopping-btn"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-gray-300 text-[#0A0A0A] hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs font-bold uppercase tracking-widest rounded-sm transition-all no-underline"
            >
              Continue Shopping <RiArrowRightLine size={16} />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

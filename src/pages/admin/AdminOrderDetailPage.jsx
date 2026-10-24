import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiArrowLeftLine, RiMapPinLine, RiPhoneLine, RiMailLine, RiCheckboxCircleLine } from 'react-icons/ri'
import { useAdminData } from '../../context/AdminDataContext'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { formatNaira, formatDate } from '../../data/adminMockData'

const TIMELINE = [
  { key: 'pending',    label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped',    label: 'Shipped' },
  { key: 'delivered',  label: 'Delivered' },
]

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered']

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, updateOrderStatus } = useAdminData()
  const order = orders.find((o) => o.id === id)
  const [newStatus, setNewStatus] = useState(order?.status || 'pending')

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B6B88] mb-4">Order not found.</p>
        <Link to="/admin/orders" className="text-[#D4AF37] hover:underline text-sm no-underline">← Back to Orders</Link>
      </div>
    )
  }

  const currentStep = STATUS_ORDER.indexOf(order.status)

  function handleSaveStatus() {
    updateOrderStatus(order.id, newStatus)
    toast.success(`Order status updated to ${newStatus}.`)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/orders')} className="text-[#6B6B88] hover:text-[#0A0A0A] transition-colors">
          <RiArrowLeftLine size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>
            {order.orderNumber}
          </h1>
          <p className="text-xs text-[#6B6B88] mt-0.5">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <AdminStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Items + Summary */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <div className="bg-white rounded-sm" style={{ border: '1px solid #ede9e0' }}>
            <div className="px-5 py-4 border-b border-[#ede9e0]">
              <h2 className="font-bold text-xs uppercase tracking-widest text-[#6B6B88]">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #f5f0e8' }}>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B6B88]">Product</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#6B6B88]">Qty</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#6B6B88]">Unit Price</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-[#6B6B88]">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f0e8' }}>
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-[#0A0A0A]">{item.name}</p>
                        <p className="text-[10px] text-[#6B6B88]">{item.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-right text-[#6B6B88]">{item.quantity}</td>
                      <td className="px-4 py-3 text-xs text-right text-[#6B6B88]">{formatNaira(item.unitPrice)}</td>
                      <td className="px-5 py-3 text-xs text-right font-bold text-[#0A0A0A]">{formatNaira(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Summary */}
            <div className="px-5 py-4 border-t border-[#ede9e0] space-y-1.5">
              <div className="flex justify-between text-xs text-[#6B6B88]">
                <span>Subtotal</span><span>{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6B6B88]">
                <span>Shipping</span><span>{formatNaira(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Discount</span><span>-{formatNaira(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#0A0A0A] pt-2 border-t border-[#ede9e0]">
                <span>Total</span><span>{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-sm p-5" style={{ border: '1px solid #ede9e0' }}>
              <h2 className="font-bold text-xs uppercase tracking-widest text-[#6B6B88] mb-5">Order Timeline</h2>
              <div className="flex items-center gap-0">
                {TIMELINE.map((step, idx) => {
                  const done = idx <= currentStep
                  const isLast = idx === TIMELINE.length - 1
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={{ scale: 0.7 }}
                          animate={{ scale: 1 }}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: done ? '#D4AF37' : '#F5F3EE', border: done ? 'none' : '2px solid #e5e0d8' }}
                        >
                          {done ? <RiCheckboxCircleLine size={16} color="#0A0A0A" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                        </motion.div>
                        <p className="text-[10px] font-semibold mt-1.5 text-center" style={{ color: done ? '#D4AF37' : '#9CA3AF', maxWidth: 60 }}>
                          {step.label}
                        </p>
                      </div>
                      {!isLast && (
                        <div className="flex-1 h-0.5 mx-1" style={{ background: idx < currentStep ? '#D4AF37' : '#e5e0d8' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Customer + Actions */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="bg-white rounded-sm p-5" style={{ border: '1px solid #ede9e0' }}>
            <h2 className="font-bold text-xs uppercase tracking-widest text-[#6B6B88] mb-4">Customer</h2>
            <p className="text-sm font-bold text-[#0A0A0A] mb-3">{order.customerName}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-[#6B6B88]">
                <RiMailLine size={13} className="mt-0.5 flex-shrink-0" />
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#6B6B88]">
                <RiPhoneLine size={13} className="mt-0.5 flex-shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-[#6B6B88]">
                <RiMapPinLine size={13} className="mt-0.5 flex-shrink-0" />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-sm p-5" style={{ border: '1px solid #ede9e0' }}>
            <h2 className="font-bold text-xs uppercase tracking-widest text-[#6B6B88] mb-4">Payment</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B6B88]">Status</span>
                <AdminStatusBadge status={order.paymentStatus === 'paid' ? 'paid' : order.paymentStatus === 'refunded' ? 'refunded' : 'unpaid'} />
              </div>
              {order.paystackReference && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#6B6B88] uppercase tracking-wider">Reference</span>
                  <span className="text-xs font-mono text-[#0A0A0A]">{order.paystackReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-sm p-5" style={{ border: '1px solid #ede9e0' }}>
            <h2 className="font-bold text-xs uppercase tracking-widest text-[#6B6B88] mb-4">Update Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white mb-3"
            >
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={handleSaveStatus}
              disabled={newStatus === order.status}
              className="w-full py-2.5 text-xs font-bold rounded-sm uppercase tracking-widest disabled:opacity-50 transition-opacity"
              style={{ background: '#D4AF37', color: '#0A0A0A' }}
            >
              Save Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

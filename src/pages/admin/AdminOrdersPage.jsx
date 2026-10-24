import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RiSearchLine } from 'react-icons/ri'
import { useAdminData } from '../../context/AdminDataContext'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { formatNaira, formatDate } from '../../data/adminMockData'

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdminData()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || o.status === filterStatus
      return matchSearch && matchStatus
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, search, filterStatus])

  function handleStatusChange(orderId, newStatus) {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order status updated to ${newStatus}.`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>Orders</h1>
        <p className="text-sm text-[#6B6B88] mt-0.5">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B88]" />
          <input
            type="text"
            placeholder="Search by order # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm capitalize transition-colors ${filterStatus === s ? 'text-[#0A0A0A]' : 'bg-white border border-gray-200 text-[#6B6B88] hover:border-[#D4AF37]'}`}
              style={filterStatus === s ? { background: '#D4AF37' } : {}}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #ede9e0' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Order #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-[#6B6B88]">No orders found.</td></tr>
              ) : filtered.map((order, i) => (
                <tr key={order.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} style={{ borderBottom: '1px solid #f5f0e8' }}>
                  <td className="px-5 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="text-xs font-mono font-semibold text-[#D4AF37] hover:underline no-underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[#0A0A0A]">{order.customerName}</p>
                    <p className="text-[10px] text-[#6B6B88]">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0A0A0A]">{formatNaira(order.total)}</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={order.paymentStatus === 'paid' ? 'paid' : order.paymentStatus === 'refunded' ? 'refunded' : 'unpaid'} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white"
                    >
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88]">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/admin/orders/${order.id}`} className="text-xs font-semibold text-[#D4AF37] hover:underline no-underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

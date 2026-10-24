import { useAdminData } from '../../context/AdminDataContext'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { formatNaira, formatDate } from '../../data/adminMockData'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiShoppingBag3Line,
  RiFileListLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiAlertLine,
} from 'react-icons/ri'

export default function AdminDashboardPage() {
  const { products, orders, customers } = useAdminData()

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0)

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const lowStock = products.filter((p) => p.stockQuantity <= 10 && p.stockQuantity > 0)
  const outOfStock = products.filter((p) => p.stockQuantity === 0)

  const categoryCount = {}
  products.forEach((p) => {
    const cat = p.category || 'Other'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })
  const maxCatCount = Math.max(...Object.values(categoryCount))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard
        </h1>
        <p className="text-sm text-[#6B6B88] mt-0.5">Welcome back, Admin — here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <AdminStatCard
          icon={RiShoppingBag3Line}
          label="Total Products"
          value={products.length}
          sub={`${products.filter((p) => p.isActive !== false).length} active`}
          color="#D4AF37"
          index={0}
        />
        <AdminStatCard
          icon={RiFileListLine}
          label="Total Orders"
          value={orders.length}
          sub={`${orders.filter((o) => o.status === 'pending').length} pending`}
          color="#3B82F6"
          index={1}
        />
        <AdminStatCard
          icon={RiUserLine}
          label="Customers"
          value={customers.length}
          sub="registered accounts"
          color="#8B5CF6"
          index={2}
        />
        <AdminStatCard
          icon={RiMoneyDollarCircleLine}
          label="Total Revenue"
          value={formatNaira(totalRevenue)}
          sub="from paid orders"
          color="#10B981"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-sm"
          style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#ede9e0]">
            <h2 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-widest">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#D4AF37] hover:underline no-underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0ece4]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={order.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-5 py-3 font-mono text-xs text-[#0A0A0A]">
                      <Link to={`/admin/orders/${order.id}`} className="text-[#D4AF37] hover:underline no-underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#0A0A0A]">{order.customerName}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#0A0A0A]">{formatNaira(order.total)}</td>
                    <td className="px-4 py-3"><AdminStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#6B6B88]">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right column: Low stock + categories */}
        <div className="flex flex-col gap-4">
          {/* Low Stock Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-sm"
            style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#ede9e0]">
              <RiAlertLine size={15} color="#D97706" />
              <h2 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-widest">Stock Alerts</h2>
            </div>
            <div className="divide-y divide-[#f5f0e8] max-h-48 overflow-y-auto">
              {outOfStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-xs text-[#0A0A0A] line-clamp-1 flex-1 mr-2">{p.name}</span>
                  <AdminStatusBadge status="out_stock" />
                </div>
              ))}
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-xs text-[#0A0A0A] line-clamp-1 flex-1 mr-2">{p.name}</span>
                  <span className="text-xs font-semibold text-amber-700">{p.stockQuantity} left</span>
                </div>
              ))}
              {lowStock.length === 0 && outOfStock.length === 0 && (
                <p className="px-5 py-4 text-xs text-[#6B6B88]">All products have healthy stock levels.</p>
              )}
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white rounded-sm"
            style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <div className="px-5 py-4 border-b border-[#ede9e0]">
              <h2 className="font-bold text-sm text-[#0A0A0A] uppercase tracking-widest">By Category</h2>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {Object.entries(categoryCount).map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#0A0A0A] font-medium">{cat}</span>
                    <span className="text-[#6B6B88]">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F5F3EE] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCatCount) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: '#D4AF37' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

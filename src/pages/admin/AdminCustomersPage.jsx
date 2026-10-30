import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiSearchLine, RiCloseLine, RiRefreshLine } from 'react-icons/ri'
import { useAdminData } from '../../context/AdminDataContext'
import { getAdminCustomers } from '../../services/adminCustomerService'
import { formatNaira, formatDate } from '../../data/adminMockData'

export default function AdminCustomersPage() {
  const { customers: ctxCustomers, reloadCustomers } = useAdminData()
  const [customers, setCustomers] = useState(ctxCustomers || [])
  const [search, setSearch] = useState('')
  const [viewCustomer, setViewCustomer] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchLiveCustomers() {
    setLoading(true)
    try {
      const live = await getAdminCustomers()
      if (live && live.length > 0) {
        setCustomers(live)
      } else if (ctxCustomers && ctxCustomers.length > 0) {
        setCustomers(ctxCustomers)
      }
    } catch (err) {
      console.error('Failed to load customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveCustomers()
  }, [])

  useEffect(() => {
    if (ctxCustomers && ctxCustomers.length > 0) {
      setCustomers(ctxCustomers)
    }
  }, [ctxCustomers])

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
      const email = (c.email || '').toLowerCase()
      const q = search.toLowerCase()
      return !search || name.includes(q) || email.includes(q)
    })
  }, [customers, search])

  const getInitials = (c) => {
    const f = c.firstName ? c.firstName[0].toUpperCase() : 'U'
    const l = c.lastName ? c.lastName[0].toUpperCase() : ''
    return `${f}${l}`
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>
            Registered Customers
          </h1>
          <p className="text-sm text-[#6B6B88] mt-0.5">
            {customers.length} registered customers in Neon
          </p>
        </div>
        <button
          onClick={() => {
            fetchLiveCustomers()
            if (reloadCustomers) reloadCustomers()
          }}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0A0A0A] bg-white border border-gray-300 rounded-sm hover:border-[#D4AF37] transition-colors"
        >
          <RiRefreshLine className={loading ? 'animate-spin' : ''} size={15} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B88]" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
        />
      </div>

      <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #ede9e0' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Orders</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Total Spent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-[#6B6B88]">
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} style={{ borderBottom: '1px solid #f5f0e8' }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: '#0A0A0A' }}
                        >
                          <span className="text-[10px] font-bold" style={{ color: '#D4AF37' }}>
                            {getInitials(c)}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#0A0A0A]">{c.firstName} {c.lastName}</p>
                          <p className="text-[10px] text-[#6B6B88]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B6B88]">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#6B6B88]">{c.city || 'Lagos'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#0A0A0A]">{c.ordersCount || 0}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#0A0A0A]">{formatNaira(c.totalSpent || 0)}</td>
                    <td className="px-4 py-3 text-xs text-[#6B6B88]">{formatDate(c.createdAt || c.joinedAt || new Date().toISOString())}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setViewCustomer(c)}
                        className="text-xs font-semibold text-[#D4AF37] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {viewCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewCustomer(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-2xl" style={{ border: '1px solid #ede9e0' }}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#0A0A0A' }}>
                      <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                        {getInitials(viewCustomer)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-[#0A0A0A]">{viewCustomer.firstName} {viewCustomer.lastName}</p>
                      <p className="text-xs text-[#6B6B88]">{viewCustomer.clerkUserId || viewCustomer.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewCustomer(null)} className="text-[#6B6B88] hover:text-[#0A0A0A] transition-colors">
                    <RiCloseLine size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Email', value: viewCustomer.email },
                    { label: 'Phone', value: viewCustomer.phone || '—' },
                    { label: 'City', value: viewCustomer.city || 'Lagos' },
                    { label: 'Registered', value: formatDate(viewCustomer.createdAt || viewCustomer.joinedAt || new Date().toISOString()) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B88] mb-0.5">{label}</p>
                      <p className="text-xs text-[#0A0A0A]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#ede9e0]">
                  <div className="text-center p-3 rounded-sm" style={{ background: '#F5F3EE' }}>
                    <p className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>{viewCustomer.ordersCount || 0}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B6B88] mt-0.5">Orders</p>
                  </div>
                  <div className="text-center p-3 rounded-sm" style={{ background: '#F5F3EE' }}>
                    <p className="text-xl font-bold text-[#D4AF37]" style={{ fontFamily: 'var(--font-display)' }}>{formatNaira(viewCustomer.totalSpent || 0)}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#6B6B88] mt-0.5">Total Spent</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

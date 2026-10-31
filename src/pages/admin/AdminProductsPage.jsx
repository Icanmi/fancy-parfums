import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiToggleLine, RiToggleFill, RiRefreshLine } from 'react-icons/ri'
import {
  getAdminProducts,
  deleteAdminProduct,
  updateAdminProduct,
} from '../../services/adminProductService'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'

const PAGE_SIZE = 10

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0)
}

// Normalise raw Neon row to a consistent shape for the UI
function normaliseProduct(p) {
  return {
    ...p,
    brand: p.brands?.name || p.brand || '—',
    category: p.categories?.name || p.category || '—',
    image: p.image_url || p.image || '',
    stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 0,
    isActive: p.is_active !== false,
    isFeatured: p.is_featured || false,
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminProducts()
      setProducts((data || []).map(normaliseProduct))
    } catch (err) {
      console.error('Failed to load products:', err)
      const statusCode = err?.response?.status
      const serverMsg = err?.response?.data?.error
      const netMsg = err?.code === 'ERR_NETWORK' ? 'Network error — is the server running on port 5000?' : null
      const detail = serverMsg || netMsg || err?.message || 'Unknown error'
      setError(`Failed to load products: ${detail}${statusCode ? ` (HTTP ${statusCode})` : ''}`)
      toast.error('Failed to load products from server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean))], [products])

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchSearch = !search
        || p.name?.toLowerCase().includes(search.toLowerCase())
        || p.brand?.toLowerCase().includes(search.toLowerCase())
        || p.sku?.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCat === 'all' || p.category === filterCat
      const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? p.isActive : !p.isActive)
      return matchSearch && matchCat && matchStatus
    })
    list.sort((a, b) => {
      const va = sortBy === 'price' ? a.price : sortBy === 'stock' ? a.stockQuantity : a.name || ''
      const vb = sortBy === 'price' ? b.price : sortBy === 'stock' ? b.stockQuantity : b.name || ''
      if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return list
  }, [products, search, filterCat, filterStatus, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(col) {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortBy(col); setSortDir('asc') }
  }

  async function handleDelete(id) {
    setActionLoading(id)
    try {
      await deleteAdminProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product deleted successfully.')
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error('Failed to delete product.')
    } finally {
      setActionLoading(null)
      setDeleteTarget(null)
    }
  }

  async function handleToggle(p) {
    setActionLoading(p.id)
    const newActive = !p.isActive
    try {
      await updateAdminProduct(p.id, { isActive: newActive })
      setProducts((prev) =>
        prev.map((item) => item.id === p.id ? { ...item, isActive: newActive } : item)
      )
      toast.success(`${p.name} ${newActive ? 'activated' : 'deactivated'}.`)
    } catch (err) {
      console.error('Toggle failed:', err)
      toast.error('Failed to update product status.')
    } finally {
      setActionLoading(null)
    }
  }

  const SortIcon = ({ col }) => (
    <span className="ml-1 opacity-50">{sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B6B88]">Loading products from database…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={loadProducts}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-sm border border-gray-300 hover:bg-[#F5F3EE] transition-colors"
        >
          <RiRefreshLine size={15} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>Products</h1>
          <p className="text-sm text-[#6B6B88] mt-0.5">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            title="Refresh"
            className="p-2.5 rounded-sm border border-gray-300 hover:bg-[#F5F3EE] transition-colors text-[#6B6B88]"
          >
            <RiRefreshLine size={16} />
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors no-underline"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            <RiAddLine size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B88]" />
          <input
            type="text"
            placeholder="Search by name, brand or SKU…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #ede9e0' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Image</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('name')}>
                  Name <SortIcon col="name" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('price')}>
                  Price <SortIcon col="price" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('stock')}>
                  Stock <SortIcon col="stock" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-[#6B6B88]">No products found.</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} style={{ borderBottom: '1px solid #f5f0e8' }}>
                  <td className="px-5 py-3">
                    <div className="w-10 h-10 rounded-sm overflow-hidden bg-[#F5F3EE]">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                        : <div className="w-full h-full flex items-center justify-center text-[#6B6B88] text-xs">—</div>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0A0A0A] text-xs line-clamp-1">{p.name}</p>
                    {p.sku && <p className="text-[10px] text-[#6B6B88] font-mono">{p.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88] font-semibold">{p.brand}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88]">{p.category}</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0A0A0A]">{formatNaira(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${p.stockQuantity === 0 ? 'text-red-600' : p.stockQuantity <= 10 ? 'text-amber-600' : 'text-green-700'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={p.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(p)}
                        disabled={actionLoading === p.id}
                        title={p.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-sm hover:bg-[#F5F3EE] transition-colors text-[#6B6B88] hover:text-[#D4AF37] disabled:opacity-40"
                      >
                        {p.isActive ? <RiToggleFill size={17} color="#D4AF37" /> : <RiToggleLine size={17} />}
                      </button>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="p-1.5 rounded-sm hover:bg-[#F5F3EE] transition-colors text-[#6B6B88] hover:text-[#3B82F6] no-underline"
                        title="Edit"
                      >
                        <RiEditLine size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        disabled={actionLoading === p.id}
                        className="p-1.5 rounded-sm hover:bg-red-50 transition-colors text-[#6B6B88] hover:text-red-600 disabled:opacity-40"
                        title="Delete"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#ede9e0] bg-[#FAFAF8]">
            <p className="text-xs text-[#6B6B88]">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-200 rounded-sm disabled:opacity-40 hover:bg-white transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-gray-200 rounded-sm disabled:opacity-40 hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-sm p-6 max-w-sm w-full shadow-2xl" style={{ border: '1px solid #ede9e0' }}>
                <h3 className="font-bold text-base text-[#0A0A0A] mb-2">Delete Product?</h3>
                <p className="text-sm text-[#6B6B88] mb-5">
                  Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This cannot be undone and will remove it from the database.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={actionLoading === deleteTarget.id}
                    className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-sm hover:bg-[#F5F3EE] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteTarget.id)}
                    disabled={actionLoading === deleteTarget.id}
                    className="px-4 py-2 text-xs font-bold rounded-sm text-white transition-colors flex items-center gap-2 disabled:opacity-60"
                    style={{ background: '#DC2626' }}
                  >
                    {actionLoading === deleteTarget.id && (
                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import { getAdminBrands, deleteAdminBrand } from '../../services/adminProductService'
import { useAdminData } from '../../context/AdminDataContext'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'

export default function AdminBrandsPage() {
  const { reloadBrands } = useAdminData() || {}
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadBrands = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminBrands()
      setBrands(data || [])
    } catch (err) {
      console.error('Failed to load brands:', err)
      toast.error('Failed to load brands from server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  const filtered = brands.filter(
    (b) => !search || b.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id) {
    setActionLoading(true)
    try {
      await deleteAdminBrand(id)
      setBrands((prev) => prev.filter((b) => b.id !== id))
      if (typeof reloadBrands === 'function') reloadBrands()
      toast.success('Brand deleted from Supabase.')
      setDeleteTarget(null)
    } catch (err) {
      console.error('Delete brand failed:', err)
      const message = err?.response?.data?.error || err.message || 'Failed to delete brand.'
      toast.error(message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>Brands</h1>
          <p className="text-sm text-[#6B6B88] mt-0.5">{brands.length} brand{brands.length === 1 ? '' : 's'} in Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBrands}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-sm hover:bg-[#F5F3EE] transition-colors text-[#6B6B88] hover:text-[#0A0A0A] disabled:opacity-50"
            title="Refresh brands list"
          >
            <RiRefreshLine size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/admin/brands/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest no-underline"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            <RiAddLine size={16} /> Add Brand
          </Link>
        </div>
      </div>

      <div className="relative mb-5 max-w-sm">
        <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B88]" />
        <input
          type="text"
          placeholder="Search brands…"
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Origin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Products</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#6B6B88]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      Loading brands from database…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B6B88]">No brands found.</td></tr>
              ) : filtered.map((brand, i) => (
                <tr key={brand.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} style={{ borderBottom: '1px solid #f5f0e8' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={brand.name} className="w-9 h-9 object-cover rounded-sm border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: '#0A0A0A' }}>
                          <span style={{ color: '#D4AF37', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }}>
                            {(brand.name || '').substring(0, 4).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-xs text-[#0A0A0A]">{brand.name}</p>
                        <p className="text-[10px] text-[#6B6B88] font-mono">{brand.slug} <span className="text-gray-400">#{brand.id}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88]">{brand.origin || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88] max-w-xs">
                    <span className="line-clamp-1">{brand.description || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0A0A0A]">{brand.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={brand.is_active !== false ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/brands/${brand.id}/edit`}
                        className="p-1.5 rounded-sm hover:bg-[#F5F3EE] transition-colors text-[#6B6B88] hover:text-[#3B82F6] no-underline"
                        title="Edit"
                      >
                        <RiEditLine size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(brand)}
                        className="p-1.5 rounded-sm hover:bg-red-50 transition-colors text-[#6B6B88] hover:text-red-600"
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
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setDeleteTarget(null)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-sm p-6 max-w-sm w-full shadow-2xl" style={{ border: '1px solid #ede9e0' }}>
                <h3 className="font-bold text-base text-[#0A0A0A] mb-2">Delete Brand?</h3>
                <p className="text-sm text-[#6B6B88] mb-5">Delete <strong>{deleteTarget.name}</strong> from database? This cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button
                    disabled={actionLoading}
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-sm hover:bg-[#F5F3EE] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleDelete(deleteTarget.id)}
                    className="px-4 py-2 text-xs font-bold rounded-sm text-white disabled:opacity-50"
                    style={{ background: '#DC2626' }}
                  >
                    {actionLoading ? 'Deleting…' : 'Delete'}
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

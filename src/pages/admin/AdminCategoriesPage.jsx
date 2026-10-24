import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import { getAdminCategories, deleteAdminCategory } from '../../services/adminProductService'
import { useAdminData } from '../../context/AdminDataContext'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'

export default function AdminCategoriesPage() {
  const { reloadCategories } = useAdminData() || {}
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminCategories()
      setCategories(data || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
      toast.error('Failed to load categories from server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const filtered = categories.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id) {
    setActionLoading(true)
    try {
      await deleteAdminCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (typeof reloadCategories === 'function') reloadCategories()
      toast.success('Category deleted from Supabase.')
      setDeleteTarget(null)
    } catch (err) {
      console.error('Delete category failed:', err)
      const message = err?.response?.data?.error || err.message || 'Failed to delete category.'
      toast.error(message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>Categories</h1>
          <p className="text-sm text-[#6B6B88] mt-0.5">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'} in Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-sm hover:bg-[#F5F3EE] transition-colors text-[#6B6B88] hover:text-[#0A0A0A] disabled:opacity-50"
            title="Refresh categories list"
          >
            <RiRefreshLine size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/admin/categories/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest no-underline"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            <RiAddLine size={16} /> Add Category
          </Link>
        </div>
      </div>

      <div className="relative mb-5 max-w-sm">
        <RiSearchLine size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B88]" />
        <input
          type="text"
          placeholder="Search categories…"
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Slug</th>
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
                      Loading categories from database…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[#6B6B88]">No categories found.</td></tr>
              ) : filtered.map((cat, i) => (
                <tr key={cat.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} style={{ borderBottom: '1px solid #f5f0e8' }}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-xs text-[#0A0A0A]">{cat.name}</p>
                    <p className="text-[10px] text-[#6B6B88] font-mono">#{cat.id}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88] font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B88] max-w-xs">
                    <span className="line-clamp-1">{cat.description || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0A0A0A]">{cat.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <AdminStatusBadge status={cat.is_active === false ? 'inactive' : 'active'} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/categories/${cat.id}/edit`}
                        className="p-1.5 rounded-sm hover:bg-[#F5F3EE] transition-colors text-[#6B6B88] hover:text-[#3B82F6] no-underline"
                        title="Edit"
                      >
                        <RiEditLine size={16} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(cat)}
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
                <h3 className="font-bold text-base text-[#0A0A0A] mb-2">Delete Category?</h3>
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

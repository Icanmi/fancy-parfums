import { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { RiDownloadLine, RiRefreshLine } from 'react-icons/ri'
import { getAdminProducts, updateAdminStock } from '../../services/adminProductService'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'

const FILTERS = ['all', 'in_stock', 'low_stock', 'out_stock']

function getStockStatus(qty) {
  if (qty === 0) return 'out_stock'
  if (qty <= 10) return 'low_stock'
  return 'in_stock'
}

// Normalise Supabase row
function normalise(p) {
  return {
    ...p,
    brand: p.brands?.name || p.brand || '—',
    stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 0,
    sku: p.sku || '—',
  }
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [adjustments, setAdjustments] = useState({})
  const [selected, setSelected] = useState([])
  const [bulkQty, setBulkQty] = useState('')
  const [saving, setSaving] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminProducts()
      setProducts((data || []).map(normalise))
    } catch (err) {
      console.error('Failed to load inventory:', err)
      setError('Failed to load inventory. Make sure the server is running.')
      toast.error('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterStatus === 'all') return true
      return getStockStatus(p.stockQuantity) === filterStatus
    })
  }, [products, filterStatus])

  function handleAdjustmentChange(id, val) {
    setAdjustments((prev) => ({ ...prev, [id]: val }))
  }

  async function handleUpdate(product) {
    const newQty = Number(adjustments[product.id])
    if (isNaN(newQty) || newQty < 0) {
      toast.error('Enter a valid quantity (≥ 0).')
      return
    }
    setSaving(product.id)
    try {
      await updateAdminStock(product.id, newQty)
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, stockQuantity: newQty } : p)
      )
      setAdjustments((prev) => { const n = { ...prev }; delete n[product.id]; return n })
      toast.success(`${product.name} stock updated to ${newQty} in Supabase.`)
    } catch (err) {
      console.error('Stock update failed:', err)
      toast.error('Failed to update stock. Try again.')
    } finally {
      setSaving(null)
    }
  }

  async function handleBulkRestock() {
    const qty = Number(bulkQty)
    if (isNaN(qty) || qty < 0) { toast.error('Enter a valid quantity.'); return }
    if (selected.length === 0) { toast.error('Select at least one product.'); return }

    setSaving('bulk')
    try {
      await Promise.all(selected.map((id) => updateAdminStock(id, qty)))
      setProducts((prev) =>
        prev.map((p) => selected.includes(p.id) ? { ...p, stockQuantity: qty } : p)
      )
      setSelected([])
      setBulkQty('')
      toast.success(`${selected.length} product(s) restocked to ${qty} in Supabase.`)
    } catch (err) {
      console.error('Bulk restock failed:', err)
      toast.error('Bulk restock partially failed. Please retry.')
    } finally {
      setSaving(null)
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function toggleSelectAll() {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered.map((p) => p.id))
  }

  function handleExportCSV() {
    const header = 'Product,Brand,SKU,Stock,Status'
    const rows = products.map((p) =>
      `"${p.name}","${p.brand || ''}","${p.sku || ''}",${p.stockQuantity},${getStockStatus(p.stockQuantity)}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fancy-atelier-inventory.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded.')
  }

  const counts = {
    all: products.length,
    in_stock: products.filter((p) => getStockStatus(p.stockQuantity) === 'in_stock').length,
    low_stock: products.filter((p) => getStockStatus(p.stockQuantity) === 'low_stock').length,
    out_stock: products.filter((p) => getStockStatus(p.stockQuantity) === 'out_stock').length,
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B6B88]">Loading inventory from Supabase…</p>
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
          <h1 className="text-2xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'var(--font-display)' }}>Inventory</h1>
          <p className="text-sm text-[#6B6B88] mt-0.5">{products.length} products tracked in Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadProducts}
            title="Refresh"
            className="p-2.5 rounded-sm border border-gray-300 hover:bg-[#F5F3EE] transition-colors text-[#6B6B88]"
          >
            <RiRefreshLine size={16} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest border border-gray-300 hover:bg-[#F5F3EE] transition-colors"
          >
            <RiDownloadLine size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm capitalize transition-colors ${filterStatus === f ? 'text-[#0A0A0A]' : 'bg-white border border-gray-200 text-[#6B6B88] hover:border-[#D4AF37]'}`}
            style={filterStatus === f ? { background: '#D4AF37' } : {}}
          >
            {f === 'all' ? `All (${counts.all})` : f === 'in_stock' ? `In Stock (${counts.in_stock})` : f === 'low_stock' ? `Low Stock (${counts.low_stock})` : `Out of Stock (${counts.out_stock})`}
          </button>
        ))}
      </div>

      {/* Bulk Restock bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-sm" style={{ background: '#FEF9EC', border: '1px solid #D4AF37' }}>
          <span className="text-xs font-semibold text-[#0A0A0A]">{selected.length} selected</span>
          <input
            type="number"
            min={0}
            value={bulkQty}
            onChange={(e) => setBulkQty(e.target.value)}
            placeholder="Set qty"
            className="w-24 px-2 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
          <button
            onClick={handleBulkRestock}
            disabled={saving === 'bulk'}
            className="px-3 py-1.5 text-xs font-bold rounded-sm flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            {saving === 'bulk' && <span className="w-3 h-3 border border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />}
            Set Stock Level
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-[#6B6B88] hover:text-[#0A0A0A] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid #ede9e0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#FAFAF8', borderBottom: '1px solid #ede9e0' }}>
                <th className="px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">New Qty</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B6B88] uppercase tracking-wider">Save</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-[#6B6B88]">No products.</td></tr>
              ) : filtered.map((p, i) => {
                const stockStatus = getStockStatus(p.stockQuantity)
                const hasAdj = adjustments[p.id] !== undefined && adjustments[p.id] !== ''
                return (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} style={{ borderBottom: '1px solid #f5f0e8' }}>
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 accent-[#D4AF37]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-[#0A0A0A] line-clamp-1">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B6B88]">{p.brand}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#6B6B88]">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${stockStatus === 'out_stock' ? 'text-red-600' : stockStatus === 'low_stock' ? 'text-amber-600' : 'text-green-700'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminStatusBadge status={stockStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        placeholder={String(p.stockQuantity)}
                        value={adjustments[p.id] ?? ''}
                        onChange={(e) => handleAdjustmentChange(p.id, e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                      />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleUpdate(p)}
                        disabled={!hasAdj || saving === p.id}
                        className="px-3 py-1 text-xs font-bold rounded-sm transition-all disabled:opacity-30 flex items-center gap-1 ml-auto"
                        style={{ background: hasAdj ? '#D4AF37' : '#F5F3EE', color: '#0A0A0A' }}
                      >
                        {saving === p.id && <span className="w-3 h-3 border border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />}
                        Update
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

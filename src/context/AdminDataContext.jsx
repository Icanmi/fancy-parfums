import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { PRODUCTS } from '../data/products'
import { BRANDS } from '../data/brands'
import { CATEGORIES } from '../data/categories'
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '../data/adminMockData'
import { fetchProducts, createOrder as persistOrder } from '../services/supabaseService'
import { getAdminCustomers } from '../services/adminCustomerService'
import {
  getAdminBrands,
  createAdminBrand,
  updateAdminBrand,
  deleteAdminBrand,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../services/adminProductService'

const AdminDataContext = createContext(null)

export function AdminDataProvider({ children }) {
  const [products, setProducts] = useState(() =>
    PRODUCTS.map((p) => ({ ...p, isActive: p.isActive !== false, sku: p.sku || `SKU-${p.id}` }))
  )
  const [brands, setBrands] = useState(BRANDS)
  const [categories, setCategories] = useState(CATEGORIES)
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)

  const reloadCustomers = useCallback(async () => {
    try {
      const live = await getAdminCustomers()
      if (live && live.length > 0) {
        setCustomers(live)
      }
    } catch (e) {
      console.warn('Failed to reload customers:', e)
    }
  }, [])

  const reloadBrands = useCallback(async () => {
    try {
      const live = await getAdminBrands()
      if (live && live.length > 0) {
        setBrands(live)
      }
    } catch (e) {
      console.warn('Failed to reload brands:', e)
    }
  }, [])

  const reloadCategories = useCallback(async () => {
    try {
      const live = await getAdminCategories()
      if (live && live.length > 0) {
        setCategories(live)
      }
    } catch (e) {
      console.warn('Failed to reload categories:', e)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function initSupabaseData() {
      try {
        const [dbProducts, dbCats, dbBrands, dbCusts] = await Promise.all([
          fetchProducts(),
          getAdminCategories().catch(() => null),
          getAdminBrands().catch(() => null),
          getAdminCustomers().catch(() => null),
        ])
        if (!mounted) return
        if (dbProducts && dbProducts.length > 0) {
          setProducts(
            dbProducts.map((p) => ({
              ...p,
              isActive: p.is_active !== false,
              sku: p.sku || `SKU-${p.id}`,
            }))
          )
        }
        if (dbCats && dbCats.length > 0) setCategories(dbCats)
        if (dbBrands && dbBrands.length > 0) setBrands(dbBrands)
        if (dbCusts && dbCusts.length > 0) setCustomers(dbCusts)
      } catch (e) {
        console.warn('Initial Supabase catalog sync deferred:', e)
      }
    }
    initSupabaseData()
    return () => {
      mounted = false
    }
  }, [])

  // ── Products ─────────────────────────────────────────────
  const addProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProducts((prev) => [newProduct, ...prev])
    return newProduct
  }, [])

  const updateProduct = useCallback((id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    )
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const toggleProductActive = useCallback((id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    )
  }, [])

  // ── Categories ───────────────────────────────────────────
  const addCategory = useCallback(async (category) => {
    try {
      const created = await createAdminCategory(category)
      if (created) {
        setCategories((prev) => [created, ...prev])
        return created
      }
    } catch (e) {
      console.warn('Backend category persistence failed, falling back to local:', e)
    }
    const newCat = {
      ...category,
      id: `cat-${Date.now()}`,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      productCount: 0,
      createdAt: new Date().toISOString(),
    }
    setCategories((prev) => [newCat, ...prev])
    return newCat
  }, [])

  const updateCategory = useCallback(async (id, updates) => {
    try {
      await updateAdminCategory(id, updates)
    } catch (e) {
      console.warn('Backend category update failed:', e)
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  const deleteCategory = useCallback(async (id) => {
    try {
      await deleteAdminCategory(id)
    } catch (e) {
      console.warn('Backend category delete failed:', e)
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ── Brands ───────────────────────────────────────────────
  const addBrand = useCallback(async (brand) => {
    try {
      const created = await createAdminBrand(brand)
      if (created) {
        setBrands((prev) => [created, ...prev])
        return created
      }
    } catch (e) {
      console.warn('Backend brand persistence failed, falling back to local:', e)
    }
    const newBrand = {
      ...brand,
      id: `brand-${Date.now()}`,
      slug: brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
    }
    setBrands((prev) => [newBrand, ...prev])
    return newBrand
  }, [])

  const updateBrand = useCallback(async (id, updates) => {
    try {
      await updateAdminBrand(id, updates)
    } catch (e) {
      console.warn('Backend brand update failed:', e)
    }
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }, [])

  const deleteBrand = useCallback(async (id) => {
    try {
      await deleteAdminBrand(id)
    } catch (e) {
      console.warn('Backend brand delete failed:', e)
    }
    setBrands((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // ── Orders ───────────────────────────────────────────────
  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev])
    persistOrder(order, order.items).catch((err) =>
      console.warn('Order persistence warning:', err)
    )
  }, [])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      )
    )
  }, [])

  // ── Inventory ────────────────────────────────────────────
  const updateStock = useCallback((productId, newQuantity) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stockQuantity: Math.max(0, newQuantity), updatedAt: new Date().toISOString() }
          : p
      )
    )
  }, [])

  const value = {
    products, brands, categories, orders, customers, reloadCustomers, reloadBrands, reloadCategories,
    addProduct, updateProduct, deleteProduct, toggleProductActive,
    addCategory, updateCategory, deleteCategory,
    addBrand, updateBrand, deleteBrand,
    addOrder, updateOrderStatus,
    updateStock,
  }

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be used inside AdminDataProvider')
  return ctx
}

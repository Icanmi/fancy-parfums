import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiGrid, FiList, FiSearch, FiX } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumbs from '../components/common/Breadcrumbs'
import ProductCard from '../components/ui/ProductCard'
import FilterSidebar from '../components/ui/FilterSidebar'
import SortDropdown from '../components/ui/SortDropdown'
import {
  fetchStorefrontProducts,
  fetchStorefrontCategories,
  fetchStorefrontBrands,
} from '../services/storefrontService'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState('featured')

  // Live data states
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadCatalog() {
      setLoading(true)
      try {
        const [prods, cats, brs] = await Promise.all([
          fetchStorefrontProducts(),
          fetchStorefrontCategories(),
          fetchStorefrontBrands(),
        ])
        if (mounted) {
          setProducts(prods || [])
          setCategories(cats || [])
          setBrands(brs || [])
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadCatalog()
    return () => {
      mounted = false
    }
  }, [])

  // URL parameters
  const urlCategory = searchParams.get('category')
  const urlBrand = searchParams.get('brand')
  const urlGender = searchParams.get('gender')

  // Base state for local filters
  const [localFilters, setLocalFilters] = useState({
    categories: urlCategory ? [urlCategory] : [],
    brands: urlBrand ? [urlBrand] : [],
    genders: urlGender ? [urlGender] : [],
    families: [],
    priceRange: null,
    inStockOnly: false,
  })

  // Synchronous effective filters combining state and URL
  const filters = useMemo(() => {
    return {
      categories: Array.from(
        new Set([...localFilters.categories, ...(urlCategory ? [urlCategory] : [])])
      ),
      brands: Array.from(
        new Set([...localFilters.brands, ...(urlBrand ? [urlBrand] : [])])
      ),
      genders: Array.from(
        new Set([...localFilters.genders, ...(urlGender ? [urlGender] : [])])
      ),
      families: localFilters.families,
      priceRange: localFilters.priceRange,
      inStockOnly: localFilters.inStockOnly,
    }
  }, [localFilters, urlCategory, urlBrand, urlGender])

  const setFilters = (updater) => {
    setLocalFilters(typeof updater === 'function' ? updater(filters) : updater)
  }

  const handleResetFilters = () => {
    setLocalFilters({
      categories: [],
      brands: [],
      genders: [],
      families: [],
      priceRange: null,
      inStockOnly: false,
    })
    setSearchQuery('')
    setSearchParams({})
  }

  // Filter & Sort Logic applied over live Supabase products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchName = product.name?.toLowerCase().includes(q)
          const matchBrand = product.brand?.toLowerCase().includes(q)
          const matchCategory = product.category?.toLowerCase().includes(q)
          const matchFamily = product.fragranceFamily?.toLowerCase().includes(q)
          if (!matchName && !matchBrand && !matchCategory && !matchFamily) return false
        }

        // Categories (match slug or name)
        if (filters.categories.length > 0) {
          const matchCat = filters.categories.some(
            (c) =>
              c === product.categorySlug ||
              c.toLowerCase() === product.category?.toLowerCase()
          )
          if (!matchCat) return false
        }

        // Brands (match slug or name)
        if (filters.brands.length > 0) {
          const matchBrand = filters.brands.some(
            (b) =>
              b === product.brandSlug ||
              b.toLowerCase() === product.brand?.toLowerCase()
          )
          if (!matchBrand) return false
        }

        // Gender
        if (filters.genders.length > 0) {
          if (!filters.genders.some((g) => g.toLowerCase() === product.gender?.toLowerCase())) {
            return false
          }
        }

        // Fragrance Families
        if (filters.families.length > 0) {
          if (!filters.families.includes(product.fragranceFamily)) return false
        }

        // Price Range
        if (filters.priceRange) {
          if (
            product.price < filters.priceRange.min ||
            product.price > filters.priceRange.max
          ) {
            return false
          }
        }

        // In Stock Only
        if (filters.inStockOnly) {
          if (product.stockQuantity <= 0) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'rating-desc') return b.rating - a.rating
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      })
  }, [products, filters, searchQuery, sortBy])

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.genders.length > 0 ||
    filters.families.length > 0 ||
    filters.priceRange !== null ||
    filters.inStockOnly ||
    searchQuery.trim() !== ''

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto pt-24 md:pt-28 pb-16 px-4 md:px-8">
        <Breadcrumbs items={[{ label: 'Catalogue' }]} />

        {/* Page Banner Header */}
        <div className="py-6 border-b border-gray-200 mb-8">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            ✦ Authentic Fragrance Vault ✦
          </span>
          <h1 className="section-heading text-3xl md:text-5xl mt-1 mb-2">
            The Perfume Catalogue
          </h1>
          <p className="text-sm text-[#6B6B88] max-w-2xl">
            Explore authentic designer perfumes, rich Arabian ouds, and ultra-rare niche extraits.
            Each bottle is 100% genuine and stored in temperature-controlled ateliers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-28 bg-white p-5 rounded-sm border border-gray-200 shadow-sm">
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                categories={categories}
                brands={brands}
              />
            </div>
          </div>

          {/* Catalogue Main Section */}
          <div className="md:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              {/* Search Bar Input */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by scent, house, or note..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-sm border border-gray-200 focus:outline-none focus:border-[#D4AF37]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#0A0A0A] text-white rounded-sm"
                >
                  <FiFilter size={14} className="text-[#D4AF37]" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  )}
                </button>

                {/* Sort Dropdown */}
                <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />

                {/* View Switcher */}
                <div className="hidden sm:flex items-center border border-gray-200 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#0A0A0A] text-[#D4AF37]'
                        : 'bg-white text-gray-500 hover:text-black'
                    }`}
                    title="Grid view"
                  >
                    <FiGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#0A0A0A] text-[#D4AF37]'
                        : 'bg-white text-gray-500 hover:text-black'
                    }`}
                    title="List view"
                  >
                    <FiList size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-500">Active filters:</span>
                {filters.categories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded-full font-medium"
                  >
                    Category: {c}
                    <button
                      onClick={() => {
                        setFilters((p) => ({
                          ...p,
                          categories: p.categories.filter((x) => x !== c),
                        }))
                        if (urlCategory === c) {
                          setSearchParams({})
                        }
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
                {filters.brands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded-full font-medium"
                  >
                    Brand: {b}
                    <button
                      onClick={() => {
                        setFilters((p) => ({
                          ...p,
                          brands: p.brands.filter((x) => x !== b),
                        }))
                        if (urlBrand === b) {
                          setSearchParams({})
                        }
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
                {filters.genders.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded-full font-medium"
                  >
                    Gender: {g}
                    <button
                      onClick={() => {
                        setFilters((p) => ({
                          ...p,
                          genders: p.genders.filter((x) => x !== g),
                        }))
                        if (urlGender === g) {
                          setSearchParams({})
                        }
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
                {filters.priceRange && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 rounded-full font-medium">
                    {filters.priceRange.label}
                    <button
                      onClick={() =>
                        setFilters((p) => ({ ...p, priceRange: null }))
                      }
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#D4AF37] hover:underline font-bold ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <p>
                Showing <strong className="text-black">{filteredProducts.length}</strong> fragrances
              </p>
            </div>

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white border border-gray-200 rounded-sm p-4 space-y-3 animate-pulse">
                    <div className="w-full aspect-[4/5] bg-gray-200 rounded-sm" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-sm border border-gray-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#FBF8EF] flex items-center justify-center mx-auto text-[#D4AF37]">
                  <FiSearch size={28} />
                </div>
                <h3 className="text-lg font-bold text-[#0A0A0A]">
                  No matching fragrances found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  We couldn't find any perfumes matching your exact filter criteria.
                  Try clearing some filters or searching for another keyword.
                </p>
                <button onClick={handleResetFilters} className="btn-primary text-xs">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto shadow-2xl md:hidden"
            >
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                categories={categories}
                brands={brands}
                isMobileDrawer={true}
                onCloseMobile={() => setMobileFilterOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

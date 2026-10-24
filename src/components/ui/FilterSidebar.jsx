import { FiX, FiRotateCcw } from 'react-icons/fi'
import { CATEGORIES } from '../../data/categories'
import { BRANDS } from '../../data/brands'

const GENDERS = ['Men', 'Women', 'Unisex']
const FAMILIES = [
  'Aromatic Fougère',
  'Warm Spicy Gourmand',
  'Fruity Chypre',
  'Amber Vanilla',
  'Oriental Spicy',
  'Spicy Woody Amber',
  'Woody Aromatic',
  'Oriental Floral',
  'Floral Fresh',
]

const PRICE_RANGES = [
  { label: 'Under ₦50,000', min: 0, max: 50000 },
  { label: '₦50,000 – ₦100,000', min: 50000, max: 100000 },
  { label: '₦100,000 – ₦250,000', min: 100000, max: 250000 },
  { label: 'Over ₦250,000', min: 250000, max: 1000000 },
]

export default function FilterSidebar({
  filters,
  setFilters,
  onReset,
  categories = CATEGORIES,
  brands = BRANDS,
  isMobileDrawer = false,
  onCloseMobile = () => {},
}) {
  const handleCategoryChange = (slug) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(slug)
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== slug)
          : [...prev.categories, slug],
      }
    })
  }

  const handleBrandChange = (brandSlug) => {
    setFilters((prev) => {
      const exists = prev.brands.includes(brandSlug)
      return {
        ...prev,
        brands: exists
          ? prev.brands.filter((b) => b !== brandSlug)
          : [...prev.brands, brandSlug],
      }
    })
  }

  const handleGenderChange = (gender) => {
    setFilters((prev) => {
      const exists = prev.genders.includes(gender)
      return {
        ...prev,
        genders: exists
          ? prev.genders.filter((g) => g !== gender)
          : [...prev.genders, gender],
      }
    })
  }

  const handlePriceRangeChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange?.label === range.label ? null : range,
    }))
  }

  const handleFamilyChange = (family) => {
    setFilters((prev) => {
      const exists = prev.families.includes(family)
      return {
        ...prev,
        families: exists
          ? prev.families.filter((f) => f !== family)
          : [...prev.families, family],
      }
    })
  }

  return (
    <aside className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">
          Filter Fragrances
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
            title="Reset filters"
          >
            <FiRotateCcw size={12} /> Reset
          </button>
          {isMobileDrawer && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-gray-600 hover:text-black md:hidden"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">
          Category
        </h4>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const checked = filters.categories.includes(cat.slug)
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCategoryChange(cat.slug)}
                  className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>{cat.name}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-2 pt-3 border-t border-gray-200">
        <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">
          Perfume House
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const checked = filters.brands.includes(brand.slug)
            return (
              <label
                key={brand.id}
                className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleBrandChange(brand.slug)}
                  className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>{brand.name}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2 pt-3 border-t border-gray-200">
        <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">
          Gender
        </h4>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((gender) => {
            const checked = filters.genders.includes(gender)
            return (
              <button
                key={gender}
                type="button"
                onClick={() => handleGenderChange(gender)}
                className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                  checked
                    ? 'bg-[#0A0A0A] text-[#D4AF37] border-[#0A0A0A] font-bold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {gender}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2 pt-3 border-t border-gray-200">
        <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">
          Price (NGN)
        </h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => {
            const checked = filters.priceRange?.label === range.label
            return (
              <label
                key={range.label}
                className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={checked}
                  onChange={() => handlePriceRangeChange(range)}
                  className="text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>{range.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Fragrance Family */}
      <div className="space-y-2 pt-3 border-t border-gray-200">
        <h4 className="text-xs font-bold uppercase text-[#0A0A0A] tracking-wider">
          Fragrance Family
        </h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {FAMILIES.map((family) => {
            const checked = filters.families?.includes(family)
            return (
              <label
                key={family}
                className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-black"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleFamilyChange(family)}
                  className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>{family}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-3 border-t border-gray-200">
        <label className="flex items-center justify-between text-xs font-semibold text-gray-800 cursor-pointer">
          <span>In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
          />
        </label>
      </div>
    </aside>
  )
}

import { FiChevronDown } from 'react-icons/fi'

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured Collection' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating-desc', label: 'Highest Rated' },
  { id: 'newest', label: 'Newest Arrivals' },
]

export default function SortDropdown({ sortBy, setSortBy }) {
  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="shop-sort" className="text-xs text-gray-500 mr-2 whitespace-nowrap hidden sm:inline">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="shop-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none bg-white border border-gray-200 text-xs font-semibold text-[#0A0A0A] py-2 pl-3 pr-8 rounded-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <FiChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  )
}

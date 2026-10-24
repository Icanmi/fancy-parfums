import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { PRODUCTS } from '../../data/products'
import { CATEGORIES } from '../../data/categories'

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG')
}

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const trimmed = query.trim().toLowerCase()
  const results = trimmed
    ? PRODUCTS.filter((p) => {
        const inName = p.name.toLowerCase().includes(trimmed)
        const inBrand = p.brand.toLowerCase().includes(trimmed)
        const inCategory = p.category.toLowerCase().includes(trimmed)
        const inFamily = p.fragranceFamily?.toLowerCase().includes(trimmed)
        const inNotes = [
          ...(p.notes?.top || []),
          ...(p.notes?.middle || []),
          ...(p.notes?.base || []),
        ].some((n) => n.toLowerCase().includes(trimmed))
        return inName || inBrand || inCategory || inFamily || inNotes
      })
    : []

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-md shadow-2xl overflow-hidden text-white"
          >
            {/* Search header & input */}
            <div className="flex items-center gap-3 p-4 md:p-6 border-b border-white/10">
              <FiSearch size={22} className="text-[#D4AF37] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search perfumes, brands (e.g. Dior, Oud, Vanilla)..."
                className="w-full bg-transparent text-white placeholder-gray-500 text-base md:text-lg focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <FiX size={18} />
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white text-xs uppercase tracking-widest px-2 py-1 border border-white/20 rounded hover:border-white transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results or Suggestions */}
            <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6">
              {query.trim() === '' ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                    Popular Categories
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] text-xs transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>

                  <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                    Trending Fragrances
                  </p>
                  <div className="space-y-3">
                    {PRODUCTS.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-sm hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-14 object-cover rounded bg-white/10"
                          />
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-400">
                              {product.brand}
                            </p>
                            <p className="text-sm font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                              {product.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#D4AF37]">
                          {formatNaira(product.price)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-400 mb-4">
                    Found <span className="text-[#D4AF37] font-bold">{results.length}</span> results for "{query}"
                  </p>
                  <div className="space-y-3">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-sm hover:bg-white/5 border border-transparent hover:border-[#D4AF37]/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-14 object-cover rounded bg-white/10"
                          />
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-400">
                              {product.brand} • {product.category}
                            </p>
                            <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.concentration} • {product.fragranceFamily}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#D4AF37]">
                            {formatNaira(product.price)}
                          </p>
                          <span className="text-xs text-gray-400 flex items-center justify-end gap-1 group-hover:text-white transition-colors">
                            View <FiArrowRight size={12} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm mb-2">No fragrances matched "{query}"</p>
                  <p className="text-xs text-gray-600">
                    Try searching for keywords like "Oud", "Vanilla", "Dior", or "Sauvage"
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-black/40 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
              <span>Press ESC to exit</span>
              <Link
                to="/shop"
                onClick={onClose}
                className="text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                Browse full catalogue <FiArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

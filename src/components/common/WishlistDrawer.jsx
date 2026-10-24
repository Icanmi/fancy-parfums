import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiHeart, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG')
}

export default function WishlistDrawer() {
  const { wishlistItems, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleMoveToCart = (product) => {
    addToCart(product, 1)
    removeFromWishlist(product.id)
  }

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWishlistOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-over panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0A0A0A] text-white border-l border-[#D4AF37]/20 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FiHeart className="text-[#D4AF37]" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#FBF8EF]">
                  Saved Fragrances ({wishlistItems.length})
                </h2>
              </div>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close wishlist"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Wishlist Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] mb-4">
                    <FiHeart size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Your wishlist is empty</h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-6">
                    Tap the heart icon on any fragrance to curate your personalized scent wishlist.
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setIsWishlistOpen(false)}
                    className="btn-primary text-xs"
                  >
                    Explore Perfumes
                  </Link>
                </div>
              ) : (
                wishlistItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3 rounded bg-white/5 border border-white/5 hover:border-[#D4AF37]/20 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded bg-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider truncate">
                              {product.brand}
                            </p>
                            <Link
                              to={`/product/${product.id}`}
                              onClick={() => setIsWishlistOpen(false)}
                              className="text-xs font-bold text-white leading-tight hover:text-[#D4AF37] transition-colors truncate block"
                            >
                              {product.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="Remove"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-[#D4AF37] mt-1.5 font-['Playfair_Display']">
                          {formatNaira(product.price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          className="btn-primary w-full justify-center text-[11px] py-1.5 gap-1.5"
                        >
                          <FiShoppingBag size={12} />
                          Move to Bag
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="p-6 bg-[#111111] border-t border-white/10">
                <Link
                  to="/wishlist"
                  onClick={() => setIsWishlistOpen(false)}
                  className="btn-secondary w-full justify-center text-xs py-3 text-center"
                >
                  View Full Wishlist <FiArrowRight />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

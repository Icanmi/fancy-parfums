import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiTrash2, FiShoppingBag, FiArrowRight, FiPlus, FiMinus } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG')
}

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart()

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
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
                <FiShoppingBag className="text-[#D4AF37]" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#FBF8EF]">
                  Your Fragrance Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="bg-[#141414] px-6 py-3 border-b border-white/5">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-300">
                  {amountNeededForFreeShipping === 0 ? (
                    <span className="text-[#D9F227] font-semibold">
                      🎉 You qualify for Free Delivery across Nigeria!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-[#D4AF37]">{formatNaira(amountNeededForFreeShipping)}</strong> more for <strong className="text-white">Free Delivery</strong>
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#D9F227] transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37] mb-4">
                    <FiShoppingBag size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Your bag is empty</h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-6">
                    Explore our authentic signature perfumes, Arabian ouds, and niche masterworks.
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-primary text-xs"
                  >
                    Discover Fragrances
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded bg-white/5 border border-white/5 hover:border-[#D4AF37]/20 transition-colors"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-20 object-cover rounded bg-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider truncate">
                              {item.product.brand}
                            </p>
                            <h4 className="text-xs font-bold text-white leading-tight truncate">
                              {item.product.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="Remove item"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                          {item.size}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-white/20 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                          >
                            <FiMinus size={11} />
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                          >
                            <FiPlus size={11} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-[#D4AF37]">
                          {formatNaira(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 bg-[#111111] border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Subtotal</span>
                  <span className="text-base font-bold text-white font-['Playfair_Display']">
                    {formatNaira(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Taxes & shipping calculations will be finalized at checkout.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-secondary justify-center text-xs py-3 text-center"
                  >
                    View Bag
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-primary justify-center text-xs py-3 text-center"
                  >
                    Checkout <FiArrowRight />
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

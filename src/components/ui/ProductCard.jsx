import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaHeart, FaRegHeart, FaShoppingBag } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import StarRating from './StarRating'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG')
}

export default function ProductCard({ product }) {
  const { id, image, badge, brand, name, rating, reviewCount, price, compareAtPrice, category } = product
  const [hovered, setHovered] = useState(false)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const wishlisted = isInWishlist(id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-sm bg-white border border-gray-100 transition-all"
      style={{ boxShadow: 'var(--shadow-card)' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        y: hovered ? -6 : 0,
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link to={`/product/${id}`} className="block relative overflow-hidden bg-[#FBF8EF]" style={{ aspectRatio: '4/5' }}>
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badge — top left */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge type={badge} />
          </div>
        )}

        {/* Wishlist heart — top right */}
        <button
          id={`wishlist-${id}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110"
        >
          {wishlisted ? (
            <FaHeart style={{ color: '#D4AF37', fontSize: '0.875rem' }} />
          ) : (
            <FaRegHeart style={{ color: '#6B6B88', fontSize: '0.875rem' }} />
          )}
        </button>

        {/* Add to Bag — hover reveal overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 inset-x-0 p-3 z-10"
            >
              <button
                id={`add-to-bag-${id}`}
                onClick={handleAddToCart}
                className="btn-primary w-full justify-center gap-2 text-xs py-2.5 shadow-lg"
              >
                <FaShoppingBag />
                Add to Bag
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Card body */}
      <div className="flex flex-col gap-1.5 p-4 flex-1 justify-between">
        <div>
          <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#6B6B88] mb-1">
            <span>{brand}</span>
            {category && <span>{category}</span>}
          </div>
          <Link
            to={`/product/${id}`}
            className="font-semibold text-sm leading-snug text-[#0A0A0A] hover:text-[#D4AF37] transition-colors block line-clamp-1"
          >
            {name}
          </Link>
          <div className="mt-1">
            <StarRating rating={rating} count={reviewCount} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-gray-100">
          <p
            className="text-base font-bold"
            style={{ color: '#0A0A0A', fontFamily: 'var(--font-display)' }}
          >
            {formatNaira(price)}
          </p>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-xs text-gray-400 line-through">
              {formatNaira(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

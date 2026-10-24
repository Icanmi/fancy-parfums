import { Link } from 'react-router-dom'
import { FiHeart, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumbs from '../components/common/Breadcrumbs'
import StarRating from '../components/ui/StarRating'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG')
}

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleMoveToCart = (product) => {
    addToCart(product, 1)
    removeFromWishlist(product.id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto pt-24 md:pt-28 pb-16 px-4 md:px-8">
        <Breadcrumbs items={[{ label: 'Saved Wishlist' }]} />

        <div className="py-4 border-b border-gray-200 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
              ✦ Personal Fragrance Vault ✦
            </span>
            <h1 className="section-heading text-3xl md:text-4xl mt-1">
              Your Wishlist ({wishlistItems.length})
            </h1>
          </div>

          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <FiTrash2 size={13} /> Clear All
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white p-12 rounded-sm border border-gray-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FBF8EF] flex items-center justify-center mx-auto text-[#D4AF37]">
              <FiHeart size={28} />
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A]">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-gray-500">
              Save your favorite designer and Arabian fragrances to access them anytime.
            </p>
            <Link to="/shop" className="btn-primary text-xs inline-flex">
              Discover Fragrances <FiArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '4/5' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-red-500 hover:scale-110 transition-transform"
                    title="Remove from wishlist"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {product.brand}
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="font-bold text-sm text-[#0A0A0A] hover:text-[#D4AF37] block leading-tight truncate mb-1"
                    >
                      {product.name}
                    </Link>
                    <StarRating rating={product.rating} count={product.reviewCount} />
                    <p className="text-base font-bold text-[#0A0A0A] font-['Playfair_Display'] mt-2">
                      {formatNaira(product.price)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="btn-primary w-full justify-center text-xs py-2.5 gap-1.5"
                  >
                    <FiShoppingBag size={14} /> Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

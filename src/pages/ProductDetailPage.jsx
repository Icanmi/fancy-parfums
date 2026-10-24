import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHeart,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiCheck,
  FiPlus,
  FiMinus,
  FiStar,
  FiShare2,
} from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumbs from '../components/common/Breadcrumbs'
import StarRating from '../components/ui/StarRating'
import Badge from '../components/ui/Badge'
import FragranceNotes from '../components/ui/FragranceNotes'
import ProductCard from '../components/ui/ProductCard'
import {
  fetchStorefrontProductByIdOrSlug,
  fetchStorefrontProducts,
} from '../services/storefrontService'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

function formatNaira(amount) {
  return '₦' + Number(amount || 0).toLocaleString('en-NG')
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('100ml')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'reviews' | 'authenticity'

  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  useEffect(() => {
    let mounted = true
    async function loadProductData() {
      setLoading(true)
      try {
        const p = await fetchStorefrontProductByIdOrSlug(id)
        if (mounted && p) {
          setProduct(p)
          setSelectedSize(p.defaultSize || p.sizes?.[0] || '100ml')
          setSelectedImage(0)

          // Load related products
          const all = await fetchStorefrontProducts()
          if (mounted && all) {
            const related = all
              .filter(
                (item) =>
                  String(item.id) !== String(p.id) &&
                  (item.categorySlug === p.categorySlug || item.brandSlug === p.brandSlug)
              )
              .slice(0, 4)
            setRelatedProducts(related)
          }
        } else if (mounted) {
          setProduct(null)
        }
      } catch (err) {
        console.error('Failed to load product details:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadProductData()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
        <Navbar />
        <main className="flex-1 max-w-[1280px] w-full mx-auto pt-32 pb-20 px-4 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase font-bold tracking-widest text-[#6B6B88]">
            Presenting Fragrance Profile...
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
        <Navbar />
        <main className="flex-1 max-w-[1280px] w-full mx-auto pt-32 pb-20 px-4 text-center space-y-4">
          <h2 className="text-2xl font-bold font-['Playfair_Display']">
            Fragrance Not Found
          </h2>
          <p className="text-xs text-[#6B6B88]">
            The perfume you are seeking may have been archived or is temporarily unavailable.
          </p>
          <Link to="/shop" className="btn-primary text-xs inline-block mt-4">
            Return to Catalogue
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const wishlisted = isInWishlist(product.id)
  const galleryImages =
    product.images && product.images.length > 0 ? product.images : [product.image]

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied to clipboard!', {
        style: { background: '#0A0A0A', color: '#FBF8EF', border: '1px solid #D4AF37' },
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto pt-24 md:pt-28 pb-16 px-4 md:px-8">
        <Breadcrumbs
          items={[
            { label: 'Catalogue', to: '/shop' },
            { label: product.category, to: `/shop?category=${product.categorySlug}` },
            { label: product.name },
          ]}
        />

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6 mb-16">
          {/* Left: Image Gallery (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-sm bg-white border border-gray-200 shadow-md"
              style={{ aspectRatio: '1/1' }}
            >
              <img
                src={galleryImages[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge type={product.badge} />
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-all bg-white ${
                      selectedImage === i ? 'border-[#D4AF37] shadow-md' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Actions (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-center text-xs uppercase font-bold tracking-widest text-[#6B6B88] mb-2">
                <Link
                  to={`/shop?brand=${product.brandSlug}`}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {product.brand}
                </Link>
                <span>{product.concentration || 'Eau de Parfum'}</span>
              </div>
              <h1 className="font-bold text-2xl md:text-4xl text-[#0A0A0A] font-['Playfair_Display'] leading-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} count={product.reviewCount} />
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <FiCheck size={14} /> 100% Authentic Guarantee
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-3 border-y border-gray-200">
              <span className="text-3xl font-bold text-[#0A0A0A] font-['Playfair_Display']">
                {formatNaira(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  {formatNaira(product.compareAtPrice)}
                </span>
              )}
              <span className="text-xs text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-2 py-1 rounded">
                In Stock ({product.stockQuantity} remaining)
              </span>
            </div>

            {/* Description excerpt */}
            <p className="text-sm text-[#6B6B88] leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] block mb-2">
                  Select Bottle Size
                </label>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-bold rounded-sm border transition-all ${
                        selectedSize === size
                          ? 'bg-[#0A0A0A] text-[#D4AF37] border-[#0A0A0A] shadow'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Bag CTA */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-gray-300 rounded-sm bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-gray-600 hover:text-black"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-[#0A0A0A]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 10, q + 1))}
                    className="w-10 h-11 flex items-center justify-center text-gray-600 hover:text-black"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  id="pdp-add-to-bag"
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 justify-center gap-2 text-xs py-3.5 shadow-md"
                >
                  <FiShoppingBag size={16} />
                  Add to Bag • {formatNaira(product.price * quantity)}
                </button>

                {/* Wishlist button */}
                <button
                  id="pdp-wishlist"
                  onClick={() => toggleWishlist(product)}
                  className={`w-12 h-11 flex items-center justify-center rounded-sm border transition-colors ${
                    wishlisted
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-gray-300 text-gray-600 hover:text-[#D4AF37]'
                  }`}
                  title={wishlisted ? 'Saved in wishlist' : 'Add to wishlist'}
                >
                  {wishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />}
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-12 h-11 flex items-center justify-center rounded-sm border border-gray-300 bg-white text-gray-600 hover:text-[#D4AF37]"
                  title="Share fragrance"
                >
                  <FiShare2 size={16} />
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <FiShield className="text-[#D4AF37]" size={16} />
                <span>Paystack Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <FiTruck className="text-[#D4AF37]" size={16} />
                <span>Express Delivery Nationwide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Notes & Specs / Reviews / Authenticity */}
        <div className="bg-white rounded-sm border border-gray-200 p-6 md:p-8 shadow-sm mb-16">
          <div className="flex border-b border-gray-200 gap-6 mb-6">
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'notes'
                  ? 'text-[#0A0A0A] border-b-2 border-[#D4AF37]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Olfactory Notes & Profile
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'reviews'
                  ? 'text-[#0A0A0A] border-b-2 border-[#D4AF37]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Customer Reviews ({product.reviewCount})
            </button>
            <button
              onClick={() => setActiveTab('authenticity')}
              className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'authenticity'
                  ? 'text-[#0A0A0A] border-b-2 border-[#D4AF37]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Atelier Guarantee
            </button>
          </div>

          {activeTab === 'notes' && (
            <FragranceNotes
              notes={product.notes}
              longevity={product.longevity}
              sillage={product.sillage}
            />
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#FBF8EF] rounded-sm">
                <div className="text-3xl font-bold font-['Playfair_Display'] text-[#0A0A0A]">
                  {product.rating}
                </div>
                <div>
                  <StarRating rating={product.rating} count={product.reviewCount} />
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on verified client reviews
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'Emeka O.',
                    date: '2 days ago',
                    rating: 5,
                    comment: 'Original scent, incredible longevity, delivered within 24 hours in Lagos. 10/10 authenticity.',
                  },
                  {
                    name: 'Fatima B.',
                    date: '1 week ago',
                    rating: 5,
                    comment: 'The silage on this fragrance is magnificent. Exactly as described, original batch code verified.',
                  },
                ].map((review, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0A0A0A]">{review.name}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Verified Buyer
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">{review.date}</span>
                    </div>
                    <div className="flex text-[#D4AF37] text-xs mb-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="fill-current" size={12} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'authenticity' && (
            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <h4 className="text-sm font-bold text-[#0A0A0A]">The Fancy Atelier Authenticity Promise</h4>
              <p>
                Every single bottle sold at Fancy Atelier Parfums is sourced directly from authorized luxury distributors in France, UAE, Oman, and the United Kingdom.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Factory-sealed cellophane with original batch codes intact.</li>
                <li>Climate-controlled storage ensuring scent stability and longevity.</li>
                <li>100% money-back authenticity guarantee.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Related Fragrances */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
                  ✦ Olfactory Harmony ✦
                </span>
                <h3 className="section-heading text-2xl mt-1">You May Also Admire</h3>
              </div>
              <Link to="/shop" className="text-xs font-bold text-[#D4AF37] hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

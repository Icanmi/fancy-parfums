// BestSellersSection.jsx — 4-up product card grid with live Neon data
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchStorefrontBestSellers } from '../../services/storefrontService'
import { BEST_SELLERS } from '../../data/products'
import ProductCard from '../ui/ProductCard'

export default function BestSellersSection() {
  const [products, setProducts] = useState(BEST_SELLERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadBestSellers() {
      try {
        const items = await fetchStorefrontBestSellers()
        if (mounted && items && items.length > 0) {
          setProducts(items.slice(0, 4))
        }
      } catch (err) {
        console.warn('Failed to load live best sellers:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadBestSellers()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section id="best-sellers" style={{ background: 'var(--color-cream)' }}>
      <div className="section-container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p
              className="text-xs font-bold tracking-[0.3em] uppercase mb-2"
              style={{ color: '#D4AF37' }}
            >
              ✦ Our Curation ✦
            </p>
            <h2 className="section-heading m-0">Best Sellers</h2>
          </div>
          <Link
            to="/shop"
            id="best-sellers-view-all"
            className="text-sm font-semibold no-underline whitespace-nowrap transition-colors hover:text-[#c09d2c]"
            style={{ color: '#D4AF37' }}
          >
            View all →
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

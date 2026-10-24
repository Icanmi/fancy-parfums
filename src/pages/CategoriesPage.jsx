import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { fetchStorefrontCategories } from '../services/storefrontService'
import { CATEGORIES } from '../data/categories'

export default function CategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadCategories() {
      try {
        const liveCats = await fetchStorefrontCategories()
        if (mounted && liveCats && liveCats.length > 0) {
          setCategories(liveCats)
        }
      } catch (err) {
        console.warn('Failed to load live categories:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadCategories()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto pt-24 md:pt-28 pb-16 px-4 md:px-8">
        <Breadcrumbs items={[{ label: 'Categories' }]} />

        <div className="py-6 border-b border-gray-200 mb-10">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            ✦ Olfactory Families ✦
          </span>
          <h1 className="section-heading text-3xl md:text-5xl mt-1 mb-2">
            Curated Fragrance Categories
          </h1>
          <p className="text-sm text-[#6B6B88] max-w-2xl">
            Explore authentic scent worlds curated by perfumery genre, origin, and aesthetic signature.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-sm bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Preview */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                  src={category.image || '/images/categories/designer.jpg'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {category.productCount ? `${category.productCount} Fragrances` : 'Curated Collection'}
                  </span>
                  <h3 className="text-xl font-bold font-['Playfair_Display']">
                    {category.name}
                  </h3>
                </div>
              </div>

              {/* Description & CTA */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#6B6B88] leading-relaxed mb-4">
                  {category.description || `Exquisite curation of ${category.name} perfumery.`}
                </p>
                <span className="text-xs font-bold text-[#0A0A0A] group-hover:text-[#D4AF37] flex items-center gap-1 transition-colors">
                  Explore Category <FiArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

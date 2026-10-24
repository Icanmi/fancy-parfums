import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { fetchStorefrontBrands } from '../services/storefrontService'
import { BRANDS } from '../data/brands'

export default function BrandsPage() {
  const [brands, setBrands] = useState(BRANDS)
  const [selectedLetter, setSelectedLetter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadBrands() {
      try {
        const liveBrands = await fetchStorefrontBrands()
        if (mounted && liveBrands && liveBrands.length > 0) {
          setBrands(liveBrands)
        }
      } catch (err) {
        console.warn('Failed to load live brands:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadBrands()
    return () => {
      mounted = false
    }
  }, [])

  const letters = ['ALL', ...Array.from(new Set(brands.map((b) => (b.name ? b.name[0].toUpperCase() : '')))).filter(Boolean).sort()]

  const filteredBrands =
    selectedLetter === 'ALL'
      ? brands
      : brands.filter((b) => b.name && b.name[0].toUpperCase() === selectedLetter)

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto pt-24 md:pt-28 pb-16 px-4 md:px-8">
        <Breadcrumbs items={[{ label: 'Perfume Houses' }]} />

        <div className="py-6 border-b border-gray-200 mb-8">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            ✦ Prestigious Perfume Houses ✦
          </span>
          <h1 className="section-heading text-3xl md:text-5xl mt-1 mb-2">
            The Brand Directory
          </h1>
          <p className="text-sm text-[#6B6B88] max-w-2xl">
            From the grand heritage salons of Paris to the bespoke perfumers of Dubai and Oman.
          </p>
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-gray-200">
          {letters.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-8 h-8 rounded-sm text-xs font-bold transition-all ${
                selectedLetter === letter
                  ? 'bg-[#0A0A0A] text-[#D4AF37]'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm flex flex-col justify-between hover:border-[#D4AF37] transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-[#0A0A0A] font-['Playfair_Display'] group-hover:text-[#D4AF37] transition-colors">
                    {brand.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                    {brand.origin || 'Exclusive'}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B88] leading-relaxed mb-6">
                  {brand.description || `Curated master perfumery by ${brand.name}.`}
                </p>
              </div>

              <Link
                to={`/shop?brand=${brand.slug}`}
                className="btn-secondary !text-black !border-black hover:!bg-black hover:!text-white text-xs py-2 justify-center"
              >
                Shop {brand.logoText || brand.name} <FiArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

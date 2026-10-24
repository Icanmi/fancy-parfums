import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const BRAND_ITEMS = [
  { name: 'Dior', slug: 'dior' },
  { name: 'Tom Ford', slug: 'tom-ford' },
  { name: 'Creed', slug: 'creed' },
  { name: 'Lattafa', slug: 'lattafa' },
  { name: 'Afnan', slug: 'afnan' },
  { name: 'Amouage', slug: 'amouage' },
  { name: 'Chanel', slug: 'chanel' },
  { name: 'Parfums de Marly', slug: 'parfums-de-marly' },
]

export default function BrandsSection() {
  return (
    <section
      id="brands"
      style={{ background: 'var(--color-cream)' }}
      className="py-14 overflow-hidden"
    >
      <div
        className="max-w-[1280px] mx-auto mb-8"
        style={{ paddingInline: 'var(--container-px)' }}
      >
        <p
          className="text-xs font-bold tracking-[0.3em] uppercase text-center"
          style={{ color: '#D4AF37' }}
        >
          ✦ Featured Brands ✦
        </p>
      </div>

      <div style={{ paddingInline: 'var(--container-px)' }}>
        <Swiper
          modules={[Autoplay, Navigation]}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          spaceBetween={48}
          navigation={{
            nextEl: '.brands-next',
            prevEl: '.brands-prev',
          }}
          breakpoints={{
            0:   { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024:{ slidesPerView: 4 },
          }}
          className="!overflow-visible"
        >
          {BRAND_ITEMS.map((brand) => (
            <SwiperSlide key={brand.slug}>
              <Link
                to={`/shop?brand=${brand.slug}`}
                className="flex items-center justify-center no-underline group py-4"
                aria-label={brand.name}
              >
                <span
                  className="font-bold text-lg md:text-xl uppercase tracking-widest text-center transition-colors duration-200 group-hover:text-[#D4AF37]"
                  style={{
                    color: '#0A0A0A',
                    fontFamily: 'var(--font-display)',
                    opacity: 0.5,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                >
                  {brand.name}
                </span>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className="brands-prev flex items-center justify-center w-9 h-9 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors"
            aria-label="Previous brand"
          >
            ‹
          </button>
          <button
            className="brands-next flex items-center justify-center w-9 h-9 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors"
            aria-label="Next brand"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

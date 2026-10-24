// HeroSection.jsx — full-bleed dark hero with Framer Motion entrance
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'


const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut', delay },
  }),
}

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden flex items-center"
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1006 55%, #0A0A0A 100%)',
      }}
    >
      {/* Subtle radial glow backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 70% 50%, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative z-10 max-w-[1280px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        style={{
          paddingInline: 'var(--container-px)',
          paddingBlock: 'clamp(6rem, 10vw, 8rem)',
        }}
      >
        {/* Left — text content */}
        <div className="flex flex-col gap-6">
          {/* Eyebrow */}
          <motion.span
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            custom={0}
            className="text-xs font-bold tracking-[0.3em] uppercase"
            style={{ color: '#D4AF37' }}
          >
            ✦ The House of Rare Scents ✦
          </motion.span>

          {/* H1 */}
          <motion.h1
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="m-0 leading-[1.1]"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.6rem, 6vw, 5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ color: '#FFFFFF' }}>Discover Your</span>
            <br />
            <span style={{ color: '#FFFFFF' }}>Signature</span>{' '}
            <span
              style={{
                color: '#D4AF37',
                fontStyle: 'italic',
                fontFamily: 'var(--font-display)',
              }}
            >
              Fragrance.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="text-base leading-relaxed max-w-md"
            style={{ color: '#6B6B88' }}
          >
            From iconic designer houses to rare Arabian oud — handpicked
            fragrances for the discerning connoisseur. Authentic. Premium.
            Unforgettable.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="flex flex-wrap gap-4"
          >
            <Link to="/shop" id="hero-cta-shop" className="btn-primary">
              Discover Fragrances →
            </Link>
            <Link to="/brands" id="hero-cta-story" className="btn-secondary">
              Explore Brands
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={FADE_UP}
            initial="hidden"
            animate="show"
            custom={0.4}
            className="flex gap-8 mt-2"
          >
            {[
              { num: '500+', label: 'Fragrances' },
              { num: '50+', label: 'Brands' },
              { num: '10K+', label: 'Happy Clients' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p
                  className="font-bold text-xl m-0"
                  style={{ color: '#D4AF37', fontFamily: 'var(--font-display)' }}
                >
                  {num}
                </p>
                <p className="text-xs m-0 mt-0.5" style={{ color: '#6B6B88' }}>
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          className="relative flex items-center justify-center"
        >
          {/* Radial glow behind image */}
          <div
            className="absolute inset-0 m-auto rounded-full pointer-events-none"
            style={{
              width: '80%',
              height: '80%',
              background:
                'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <img
            src="/images/hero.jpg"
            alt="Signature perfume collection"
            className="relative z-10 w-full object-contain drop-shadow-2xl"
            style={{ maxHeight: '580px', borderRadius: '4px' }}
          />
        </motion.div>
      </div>

      {/* Decorative bottom gradient */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #FBF8EF)',
        }}
      />
    </section>
  )
}

// QuoteSection.jsx — dark full-width artistic panel
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'


export default function QuoteSection() {
  return (
    <section
      id="quote-section"
      className="w-full overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch"
        style={{ paddingInline: 'var(--container-px)' }}
      >
        {/* Left — quote content */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col justify-center gap-6 py-24 pr-0 md:pr-16"
        >
          {/* Eyebrow */}
          <p
            className="text-xs font-bold tracking-[0.3em] uppercase"
            style={{ color: '#D4AF37' }}
          >
            The Art of Fragrance
          </p>

          {/* Quote */}
          <blockquote
            className="m-0 leading-snug"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#FFFFFF',
              lineHeight: 1.2,
            }}
          >
            "A fragrance is the invisible part of your personality that leaves
            a{' '}
            <span style={{ color: '#D4AF37' }}>lasting impression.</span>"
          </blockquote>

          {/* Attribution */}
          <p className="text-sm" style={{ color: '#6B6B88' }}>
            — Fancy Atelier Parfums
          </p>

          {/* CTA */}
          <div>
            <Link to="/shop" id="quote-story-cta" className="btn-primary inline-flex">
              Explore Collection →
            </Link>
          </div>
        </motion.div>

        {/* Right — floral image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="relative overflow-hidden"
          style={{ minHeight: '400px' }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, #0A0A0A 0%, transparent 30%), linear-gradient(to top, rgba(10,10,10,0.4) 0%, transparent 50%)',
            }}
          />
          <img
            src="/images/quote-floral.jpg"
            alt="Dark floral fragrance art"
            className="w-full h-full object-cover"
            style={{ minHeight: '400px' }}
          />
        </motion.div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi'
import { subscribeNewsletter } from '../../services/supabaseService'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      try {
        await subscribeNewsletter(email)
      } catch {
        // silent fallback
      }
    }
  }

  return (
    <footer
      id="site-footer"
      style={{ background: 'var(--color-black)', color: 'var(--color-white)' }}
    >
      {/* Main grid */}
      <div
        className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
        style={{
          paddingInline: 'var(--container-px)',
          paddingBlock: 'clamp(3rem, 6vw, 5rem)',
        }}
      >
        {/* Col 1 — Brand */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="2" fill="#D4AF37" />
              <text
                x="18"
                y="24"
                textAnchor="middle"
                fontFamily="'Playfair Display', serif"
                fontWeight="700"
                fontSize="16"
                fill="#0A0A0A"
              >
                FA
              </text>
            </svg>
            <span
              className="font-bold text-xs tracking-widest uppercase"
              style={{ color: '#FBF8EF', letterSpacing: '0.18em' }}
            >
              Fancy Atelier
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6B88', maxWidth: '240px' }}>
            Curating the world's most authentic designer, Arabian oud, and niche fragrances for discerning collectors.
          </p>
          <div className="flex items-center gap-3 mt-1">
            {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors no-underline"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#6B6B88',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212,175,55,0.15)'
                  e.currentTarget.style.color = '#D4AF37'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.color = '#6B6B88'
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <h4
            className="text-xs font-bold tracking-widest uppercase mb-5"
            style={{ color: '#D4AF37' }}
          >
            Explore & Shop
          </h4>
          <ul className="flex flex-col gap-2.5 list-none m-0 p-0 text-sm">
            <li>
              <Link to="/shop" className="text-[#6B6B88] hover:text-[#D4AF37] transition-colors no-underline">
                Full Catalogue
              </Link>
            </li>
            <li>
              <Link to="/categories" className="text-[#6B6B88] hover:text-[#D4AF37] transition-colors no-underline">
                Fragrance Categories
              </Link>
            </li>
            <li>
              <Link to="/brands" className="text-[#6B6B88] hover:text-[#D4AF37] transition-colors no-underline">
                Perfume Houses
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-[#6B6B88] hover:text-[#D4AF37] transition-colors no-underline">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="text-[#6B6B88] hover:text-[#D4AF37] transition-colors no-underline">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 — Contact */}
        <div>
          <h4
            className="text-xs font-bold tracking-widest uppercase mb-5"
            style={{ color: '#D4AF37' }}
          >
            Contact Atelier
          </h4>
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {[
              { Icon: FiMail, text: 'nancydennis1113@gmail.com' },
              { Icon: FiPhone, text: '+234 7034467384' },
              { Icon: FiMapPin, text: ' Lagos, Nigeria' },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <Icon size={15} style={{ color: '#D4AF37', flexShrink: 0, marginTop: '2px' }} />
                <span className="text-sm" style={{ color: '#6B6B88' }}>
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Newsletter */}
        <div>
          <h4
            className="text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: '#D4AF37' }}
          >
            Join Atelier Newsletter
          </h4>
          <p className="text-sm mb-4" style={{ color: '#6B6B88' }}>
            Receive private allocations, new releases, and fragrant masterclasses.
          </p>
          {subscribed ? (
            <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37] rounded text-xs text-[#D4AF37] font-semibold">
              ✓ Welcome to The Atelier Society.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-2.5 text-sm rounded-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: '#FBF8EF',
                }}
              />
              <button
                id="newsletter-submit"
                type="submit"
                className="btn-primary justify-center text-xs py-2.5"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Gold divider */}
      <div style={{ paddingInline: 'var(--container-px)' }}>
        <hr style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopWidth: '1px' }} />
      </div>

      {/* Copyright */}
      <div
        className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-5 text-xs"
        style={{ paddingInline: 'var(--container-px)', color: '#6B6B88' }}
      >
        <p>© {new Date().getFullYear()} Fancy Atelier Parfums. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="no-underline hover:text-[#D4AF37] transition-colors" style={{ color: '#6B6B88' }}>
            Authenticity Guarantee
          </a>
          <a href="#" className="no-underline hover:text-[#D4AF37] transition-colors" style={{ color: '#6B6B88' }}>
            Privacy & Terms
          </a>
          <Link to="/admin" className="no-underline hover:text-[#D4AF37] transition-colors" style={{ color: '#6B6B88' }}>
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}

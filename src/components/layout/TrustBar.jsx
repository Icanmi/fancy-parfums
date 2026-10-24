// TrustBar.jsx — 4-column trust signal strip
import {
  FiCheckCircle,
  FiStar,
  FiShield,
  FiTruck,
} from 'react-icons/fi'

const TRUST_ITEMS = [
  {
    icon: FiCheckCircle,
    label: '100% Authentic',
    sublabel: 'Verified & genuine fragrances',
  },
  {
    icon: FiStar,
    label: 'Premium Quality',
    sublabel: 'Only the finest ingredients',
  },
  {
    icon: FiShield,
    label: 'Secure Payment',
    sublabel: 'Protected by Paystack',
  },
  {
    icon: FiTruck,
    label: 'Fast Delivery',
    sublabel: 'Nationwide shipping',
  },
]

export default function TrustBar() {
  return (
    <div
      id="trust-bar"
      className="w-full"
      style={{
        background: 'var(--color-cream)',
        borderTop: '1px solid rgba(212,175,55,0.25)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
      }}
    >
      <div
        className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-0"
        style={{ paddingInline: 'var(--container-px)' }}
      >
        {TRUST_ITEMS.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center gap-3 py-5 px-4"
            style={{
              borderRight:
                i < TRUST_ITEMS.length - 1
                  ? '1px solid rgba(212,175,55,0.15)'
                  : 'none',
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)' }}
            >
              <item.icon size={18} style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#0A0A0A' }}
              >
                {item.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6B6B88' }}>
                {item.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

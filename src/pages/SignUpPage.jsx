import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { RiArrowLeftLine } from 'react-icons/ri'

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)',
        color: '#FBF8EF',
      }}
    >
      {/* Top Brand Link */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link
          to="/"
          className="flex items-center gap-2.5 mb-3 no-underline group"
        >
          <div
            className="w-9 h-9 rounded-sm flex items-center justify-center"
            style={{ background: '#D4AF37' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display, serif)',
                color: '#0A0A0A',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              FA
            </span>
          </div>
          <span
            className="font-bold text-sm tracking-widest uppercase text-[#FBF8EF] group-hover:text-[#D4AF37] transition-colors"
            style={{ letterSpacing: '0.18em' }}
          >
            Fancy Atelier
          </span>
        </Link>
        <p className="text-xs text-[#A89F91] tracking-wider uppercase">
          Join The Atelier Newsletter
        </p>
      </div>

      {/* Clerk Sign Up Card */}
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: 'w-full shadow-2xl rounded-sm',
              card: 'bg-[#121212] border border-[#D4AF37]/30 text-[#FBF8EF]',
              headerTitle: 'text-lg font-bold text-[#FBF8EF] font-serif',
              headerSubtitle: 'text-xs text-[#A89F91]',
              socialButtonsBlockButton: 'border border-[#333] hover:border-[#D4AF37] text-white',
              formButtonPrimary: 'bg-[#D4AF37] hover:bg-[#B8972E] text-[#0A0A0A] font-bold text-xs uppercase tracking-widest',
              footerActionLink: 'text-[#D4AF37] hover:underline font-semibold',
              formFieldInput: 'bg-[#1C1C1C] border-[#333] text-white focus:border-[#D4AF37]',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-[#D4AF37]',
            },
          }}
        />
      </div>

      {/* Return to store */}
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 text-xs text-[#A89F91] hover:text-[#D4AF37] transition-colors no-underline"
      >
        <RiArrowLeftLine size={14} />
        <span>Return to Boutique</span>
      </Link>
    </div>
  )
}

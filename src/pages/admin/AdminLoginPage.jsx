import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiLockPasswordLine, RiMailLine, RiEyeLine, RiEyeOffLine, RiShieldCheckLine, RiArrowLeftLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const redirectPath = location.state?.from?.pathname || '/admin/dashboard'

  // If already authenticated as admin, proceed to admin dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your administrator email address.')
      return
    }

    if (!password) {
      toast.error('Please enter your administrator password.')
      return
    }

    setSubmitting(true)

    try {
      const res = await login(email.trim(), password)
      if (res.success) {
        toast.success(`Welcome back, ${res.admin?.name || 'Administrator'}`)
        navigate(redirectPath, { replace: true })
      } else {
        toast.error(res.error || 'Invalid administrator credentials.')
      }
    } catch {
      toast.error('An unexpected error occurred during admin sign-in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #171510 0%, #0A0A0A 80%)',
        color: '#FBF8EF',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Card */}
        <div
          className="rounded-sm p-8 sm:p-10 border shadow-2xl relative overflow-hidden backdrop-blur-md"
          style={{
            background: 'rgba(18, 18, 18, 0.95)',
            borderColor: 'rgba(212, 175, 55, 0.25)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.05)',
          }}
        >
          {/* Subtle top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            }}
          />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-sm mx-auto mb-4 flex items-center justify-center shadow-lg"
              style={{
                background: '#D4AF37',
                color: '#0A0A0A',
              }}
            >
              <RiShieldCheckLine size={26} />
            </div>

            <p
              className="text-xs uppercase tracking-[0.25em] font-semibold mb-1"
              style={{ color: '#D4AF37' }}
            >
              Fancy Atelier Parfums
            </p>
            <h1
              className="text-2xl font-serif tracking-wide"
              style={{ color: '#FBF8EF', fontFamily: 'var(--font-display, serif)' }}
            >
              Admin Portal
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Protected authentication via Neon PostgreSQL
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-medium"
              >
                Administrator Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <RiMailLine size={18} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fancyatelier.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-sm border bg-[#161616] text-white placeholder-white/25 focus:outline-none transition-colors"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#D4AF37')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <RiLockPasswordLine size={18} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-sm border bg-[#161616] text-white placeholder-white/25 focus:outline-none transition-colors"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#D4AF37')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-sm font-semibold text-xs uppercase tracking-[0.2em] transition-all duration-200 mt-2 flex items-center justify-center gap-2"
              style={{
                background: submitting ? '#9C8127' : '#D4AF37',
                color: '#0A0A0A',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-[#D4AF37] transition-colors"
            >
              <RiArrowLeftLine size={14} />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch,
  FiHeart,
  FiUser,
  FiShoppingBag,
  FiMenu,
  FiX,
} from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  UserButton,
  useClerk,
} from '@clerk/clerk-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import SearchModal from '../common/SearchModal'
import CartDrawer from '../common/CartDrawer'
import WishlistDrawer from '../common/WishlistDrawer'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Catalogue', href: '/shop' },
  { label: 'Categories', href: '/categories' },
  { label: 'Brands', href: '/brands' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { openSignIn } = useClerk()

  const { cartCount, setIsCartOpen } = useCart()
  const { wishlistCount, setIsWishlistOpen } = useWishlist()

  // On non-home pages, always show opaque navbar for readability
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navBg = !isHomePage || scrolled
    ? 'bg-[#FBF8EF] shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
    : 'bg-transparent'

  const textColor = !isHomePage || scrolled ? 'text-[#0A0A0A]' : 'text-white'
  const logoColor = !isHomePage || scrolled ? '#0A0A0A' : '#D4AF37'
  const textPrimary = !isHomePage || scrolled ? '#0A0A0A' : '#FBF8EF'

  return (
    <>
      <nav
        id="main-navbar"
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${navBg}`}
      >
        <div
          className="max-w-[1280px] mx-auto flex items-center justify-between h-16 md:h-20"
          style={{ paddingInline: 'var(--container-px)' }}
        >
          {/* Logo */}
          <Link to="/" id="navbar-logo" className="flex items-center gap-2.5 no-underline">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="2" fill={logoColor} />
              <text
                x="18"
                y="24"
                textAnchor="middle"
                fontFamily="'Playfair Display', serif"
                fontWeight="700"
                fontSize="16"
                fill={!isHomePage || scrolled ? '#FBF8EF' : '#0A0A0A'}
              >
                FA
              </text>
            </svg>
            <span
              className="hidden sm:block font-bold text-sm tracking-widest uppercase"
              style={{
                color: textPrimary,
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.18em',
              }}
            >
              Fancy Atelier
            </span>
          </Link>

          {/* Center nav links — desktop */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.href
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={`text-xs font-semibold tracking-widest uppercase transition-colors duration-200 no-underline ${active ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1' : textColor
                      } hover:text-[#D4AF37]`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right icon cluster */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              id="nav-search"
              aria-label="Search fragrances"
              onClick={() => setSearchOpen(true)}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
              title="Search (Click or press to open)"
            >
              <FiSearch size={18} />
            </button>

            {/* Wishlist with count badge */}
            <button
              id="nav-wishlist"
              aria-label="Saved fragrances"
              onClick={() => setIsWishlistOpen(true)}
              className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
              title="Wishlist"
            >
              <FiHeart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#0A0A0A] text-[#D4AF37] border border-[#D4AF37] text-[9px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account — signed out: show Sign In link; signed in: show UserButton */}
            <SignedOut>
              <Link
                to="/sign-in"
                id="nav-account"
                aria-label="Sign In"
                className={`hidden sm:flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
                title="Sign In"
              >
                <FiUser size={18} />
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="hidden sm:flex items-center justify-center" id="nav-user-button">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] transition-colors',
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My Profile"
                      labelIcon={<FiUser size={14} />}
                      href="/profile"
                    />
                    <UserButton.Link
                      label="My Orders"
                      labelIcon={<FiShoppingBag size={14} />}
                      href="/profile"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </SignedIn>

            {/* Cart with count badge */}
            <button
              id="nav-cart"
              aria-label="Shopping bag"
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
              title="View bag"
            >
              <FiShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#D4AF37] text-[#0A0A0A] text-[9px] font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile */}
            <button
              id="nav-hamburger"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Global Slide-over Drawers */}
      <CartDrawer />
      <WishlistDrawer />

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-[#FBF8EF] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/20">
                <span
                  className="font-bold text-xs tracking-widest uppercase"
                  style={{ color: '#0A0A0A', fontFamily: 'var(--font-sans)' }}
                >
                  Menu
                </span>
                <button
                  id="nav-close-drawer"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/10 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-4 py-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-3 text-sm font-semibold tracking-widest uppercase rounded-sm text-[#0A0A0A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Auth links in mobile drawer */}
                <SignedOut>
                  <Link
                    to="/sign-in"
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-3 text-sm font-semibold tracking-widest uppercase rounded-sm text-[#0A0A0A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors no-underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-3 text-sm font-semibold tracking-widest uppercase rounded-sm text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors no-underline"
                  >
                    Sign Up
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/profile"
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-3 text-sm font-semibold tracking-widest uppercase rounded-sm text-[#0A0A0A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-colors no-underline"
                  >
                    My Profile
                  </Link>
                </SignedIn>
              </nav>
              <div className="mt-auto px-6 py-6 border-t border-[#D4AF37]/20">
                <div className="flex gap-4 justify-between">
                  <button
                    onClick={() => {
                      setDrawerOpen(false)
                      setSearchOpen(true)
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-[#0A0A0A] hover:text-[#D4AF37]"
                    title="Search"
                  >
                    <FiSearch size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false)
                      setIsWishlistOpen(true)
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-[#0A0A0A] hover:text-[#D4AF37]"
                    title="Wishlist"
                  >
                    <FiHeart size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false)
                      setIsCartOpen(true)
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm text-[#0A0A0A] hover:text-[#D4AF37]"
                    title="Cart"
                  >
                    <FiShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

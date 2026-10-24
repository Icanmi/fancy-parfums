import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiDashboardLine,
  RiShoppingBag3Line,
  RiGridLine,
  RiAwardLine,
  RiFileListLine,
  RiUserLine,
  RiStackLine,
  RiArrowGoBackLine,
  RiMenuLine,
  RiCloseLine,
  RiAdminLine,
} from 'react-icons/ri'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: RiDashboardLine, to: '/admin/dashboard' },
  { label: 'Products', icon: RiShoppingBag3Line, to: '/admin/products' },
  { label: 'Categories', icon: RiGridLine, to: '/admin/categories' },
  { label: 'Brands', icon: RiAwardLine, to: '/admin/brands' },
  { label: 'Orders', icon: RiFileListLine, to: '/admin/orders' },
  { label: 'Customers', icon: RiUserLine, to: '/admin/customers' },
  { label: 'Inventory', icon: RiStackLine, to: '/admin/inventory' },
]

function SidebarContent({ onLinkClick }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ background: '#D4AF37' }}>
          <span style={{ fontFamily: 'var(--font-display)', color: '#0A0A0A', fontWeight: 700, fontSize: 13 }}>FA</span>
        </div>
        <div>
          <p style={{ color: '#D4AF37', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Fancy Atelier
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Admin Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-6 flex-1">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 no-underline relative ${
                isActive
                  ? 'text-[#D4AF37] bg-white/5'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#D4AF37]" />
                )}
                <Icon size={17} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to store */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-white/40 hover:text-white/70 transition-colors w-full"
        >
          <RiArrowGoBackLine size={17} />
          <span>Back to Store</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F3EE' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0 fixed top-0 left-0 bottom-0 z-30"
        style={{ background: '#0A0A0A' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col lg:hidden"
              style={{ background: '#0A0A0A' }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <RiCloseLine size={22} />
              </button>
              <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-4 px-6 h-14 border-b"
          style={{ background: '#fff', borderColor: '#e5e0d8' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-sm text-[#0A0A0A] hover:bg-[#F5F3EE] transition-colors"
            aria-label="Open menu"
          >
            <RiMenuLine size={20} />
          </button>
          <div className="flex-1" />
          {/* Admin avatar */}
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:block text-xs font-semibold text-[#6B6B88]">Admin</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#0A0A0A' }}
            >
              <RiAdminLine size={16} color="#D4AF37" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

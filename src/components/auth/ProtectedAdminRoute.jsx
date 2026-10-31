import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

/**
 * ProtectedAdminRoute
 *
 * Exclusively guards /admin/* routes using Neon database credentials.
 * If not authenticated, redirects to /admin/login.
 */
export default function ProtectedAdminRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth()
  const location = useLocation()

  // Loading spinner while verifying stored Neon admin session
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0A0A0A' }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p
            className="text-white/50 text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Verifying Administrator Access…
          </p>
        </div>
      </div>
    )
  }

  // Not signed in to Neon admin portal -> redirect to /admin/login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  // Confirmed Neon admin -> render protected routes
  return <Outlet />
}

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AdminDataProvider } from './context/AdminDataContext'

// Storefront pages
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoriesPage from './pages/CategoriesPage'
import BrandsPage from './pages/BrandsPage'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'

// Auth pages
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ProfilePage from './pages/ProfilePage'

// Checkout pages
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

// Admin layout + pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage'
import AdminBrandsPage from './pages/admin/AdminBrandsPage'
import AdminBrandFormPage from './pages/admin/AdminBrandFormPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'

import UserSync from './components/auth/UserSync'

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_dGFsZW50ZWQtYWRkZXItMzUzOC5jbGVyay5hY2NvdW50cy5kZXYk'

// Automatically scrolls window to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#D4AF37',
          colorBackground: '#121212',
          colorText: '#FBF8EF',
          colorTextSecondary: '#A89F91',
          colorInputBackground: '#1C1C1C',
          colorInputText: '#FFFFFF',
          borderRadius: '2px',
          fontFamily: 'inherit',
        },
        elements: {
          rootBox: 'w-full',
          card: 'bg-[#121212] border border-[#D4AF37]/30 shadow-2xl',
          headerTitle: 'text-[#FBF8EF] font-bold',
          headerSubtitle: 'text-[#A89F91]',
          formButtonPrimary: 'bg-[#D4AF37] hover:bg-[#B8972E] text-[#0A0A0A] font-bold uppercase tracking-widest',
          footerActionLink: 'text-[#D4AF37] hover:underline',
          socialButtonsBlockButton: 'border-[#333] hover:border-[#D4AF37] text-white',
          formFieldInput: 'bg-[#1C1C1C] border-[#333] text-white focus:border-[#D4AF37]',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-[#D4AF37]',
        },
      }}
    >
      <UserSync />
      <AdminDataProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#0A0A0A',
                    color: '#FBF8EF',
                    border: '1px solid rgba(212,175,55,0.3)',
                    fontSize: '13px',
                    fontWeight: '500',
                  },
                }}
              />
              <Routes>
                {/* ── Storefront ── */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />

                {/* ── Auth ── */}
                <Route path="/sign-in/*" element={<SignInPage />} />
                <Route path="/sign-up/*" element={<SignUpPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* ── Checkout ── */}
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />

                {/* ── Admin ── */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/new" element={<AdminProductFormPage />} />
                  <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="categories/new" element={<AdminCategoryFormPage />} />
                  <Route path="categories/:id/edit" element={<AdminCategoryFormPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="brands/new" element={<AdminBrandFormPage />} />
                  <Route path="brands/:id/edit" element={<AdminBrandFormPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<ShopPage />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AdminDataProvider>
    </ClerkProvider>
  )
}

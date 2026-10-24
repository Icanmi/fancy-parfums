import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import {
  RiUser3Line,
  RiFileList3Line,
  RiMapPinLine,
  RiHeart3Line,
  RiLogoutBoxRLine,
  RiArrowRightLine,
  RiShoppingBag3Line,
  RiCalendarLine,
} from 'react-icons/ri'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AdminStatusBadge from '../components/admin/AdminStatusBadge'
import { useAdminData } from '../context/AdminDataContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { formatNaira, formatDate } from '../data/adminMockData'
import { syncCustomerProfile, fetchCustomerOrders } from '../services/supabaseService'

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const { orders = [] } = useAdminData()
  const { wishlist = [], wishlistItems = [], removeFromWishlist } = useWishlist()
  const activeWishlist = wishlistItems.length > 0 ? wishlistItems : (Array.isArray(wishlist) ? wishlist : [])
  const { addToCart } = useCart()

  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'addresses' | 'wishlist' | 'security'

  // Saved Address in Local Storage
  const [address, setAddress] = useState(() => {
    const saved = localStorage.getItem('fa_customer_address')
    return saved
      ? JSON.parse(saved)
      : {
          fullName: '',
          phone: '',
          street: '',
          city: 'Lagos',
          state: 'Lagos',
        }
  })

  useEffect(() => {
    if (user && !address.fullName) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phone: prev.phone || user.phoneNumbers?.[0]?.phoneNumber || '',
      }))
      syncCustomerProfile(user, address).catch(() => {})
    }
  }, [user])

  const handleSaveAddress = (e) => {
    e.preventDefault()
    localStorage.setItem('fa_customer_address', JSON.stringify(address))
    if (user) {
      syncCustomerProfile(user, address).catch(() => {})
    }
    toast.success('Default delivery address saved!')
  }

  // Filter orders for this customer (match by clerk user id or email, or fallback to first 3 recent orders for demo)
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const customerOrders = orders.filter(
    (o) =>
      (userEmail && o.customerEmail?.toLowerCase() === userEmail) ||
      (user?.id && (o.clerkUserId === user.id || o.clerk_user_id === user.id))
  )
  const displayOrders = customerOrders.length > 0 ? customerOrders : orders.slice(0, 3)

  // ── Clerk loading guard ─────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin"
            />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A89F91]">Loading your profile…</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16" style={{ paddingInline: 'var(--container-px)' }}>
        <div className="max-w-[1200px] mx-auto">
          <SignedOut>
            {/* Unauthenticated State */}
            <div className="bg-white border border-[#ede9e0] rounded-sm p-10 text-center max-w-lg mx-auto my-12 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#0A0A0A] text-[#D4AF37] flex items-center justify-center mx-auto mb-4">
                <RiUser3Line size={28} />
              </div>
              <h1 className="text-2xl font-bold font-serif text-[#0A0A0A] mb-2">
                Atelier Customer Account
              </h1>
              <p className="text-xs text-[#6B6B88] mb-6">
                Sign in to view your private fragrance allocations, track orders, and manage your concierge delivery addresses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/sign-in"
                  className="px-6 py-3 bg-[#0A0A0A] text-[#D4AF37] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-widest rounded-sm transition-all text-center no-underline"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-6 py-3 bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#c49f2b] text-xs font-bold uppercase tracking-widest rounded-sm transition-all text-center no-underline"
                >
                  Join Society
                </Link>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            {/* Authenticated Customer Profile */}
            {/* Customer Banner */}
            <div className="bg-[#0A0A0A] text-[#FBF8EF] rounded-sm p-6 sm:p-8 mb-8 border border-[#D4AF37]/20 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || 'Customer'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border-2 border-[#D4AF37] flex items-center justify-center text-xl font-serif text-[#D4AF37]">
                        {user?.firstName?.[0] || 'C'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0A0A0A] rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
                        {user?.fullName || user?.firstName || 'Valued Client'}
                      </h1>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        Atelier Society
                      </span>
                    </div>
                    <p className="text-xs text-[#A89F91] mt-0.5">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await signOut({ redirectUrl: '/' })
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-sm border border-white/20 text-white/70 hover:text-white hover:border-white transition-colors"
                >
                  <RiLogoutBoxRLine size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-[#ede9e0] mb-8 overflow-x-auto">
              {[
                { id: 'orders', label: 'My Orders', icon: RiFileList3Line, count: displayOrders.length },
                { id: 'addresses', label: 'Delivery Address', icon: RiMapPinLine },
                { id: 'wishlist', label: 'Wishlist', icon: RiHeart3Line, count: activeWishlist.length },
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                    activeTab === id
                      ? 'border-[#D4AF37] text-[#0A0A0A]'
                      : 'border-transparent text-[#6B6B88] hover:text-[#0A0A0A]'
                  }`}
                >
                  <Icon size={16} className={activeTab === id ? 'text-[#D4AF37]' : ''} />
                  <span>{label}</span>
                  {typeof count === 'number' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-gray-200 text-gray-700">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div>
              {/* 1. My Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {displayOrders.length === 0 ? (
                    <div className="bg-white rounded-sm border border-[#ede9e0] p-10 text-center">
                      <RiShoppingBag3Line size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-[#0A0A0A]">No orders placed yet</p>
                      <p className="text-xs text-[#6B6B88] mt-1 mb-4">
                        Discover authentic niche and designer fragrances curated for you.
                      </p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0A0A0A] text-[#D4AF37] text-xs font-bold uppercase tracking-widest rounded-sm no-underline"
                      >
                        Explore Catalogue <RiArrowRightLine size={14} />
                      </Link>
                    </div>
                  ) : (
                    displayOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-sm border border-[#ede9e0] p-5 shadow-sm transition-all hover:border-[#D4AF37]/50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                          <div>
                            <span className="text-xs font-mono font-bold text-[#0A0A0A]">
                              {order.orderNumber}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#6B6B88] mt-0.5">
                              <RiCalendarLine size={13} />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <AdminStatusBadge status={order.status} />
                            <span className="text-sm font-bold text-[#0A0A0A] font-serif">
                              {formatNaira(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-3 space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-[#F5F3EE] text-[10px] font-bold flex items-center justify-center text-[#0A0A0A]">
                                  {item.quantity}x
                                </span>
                                <span className="font-medium text-[#0A0A0A]">{item.name}</span>
                              </div>
                              <span className="text-[#6B6B88] font-mono">
                                {formatNaira((item.price || item.unitPrice || 0) * (item.quantity || 1))}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-[#6B6B88]">
                          <span className="flex items-center gap-1.5">
                            <RiMapPinLine size={14} className="text-[#D4AF37]" />
                            <span>
                              Destination:{' '}
                              {typeof order.shippingAddress === 'string'
                                ? order.shippingAddress
                                : `${order.shippingAddress?.city || 'Lagos'}, ${order.shippingAddress?.state || 'Nigeria'}`}
                            </span>
                          </span>
                          <span className="text-emerald-700 font-medium">
                            Payment: {order.paymentStatus === 'paid' ? 'Paid via Paystack' : 'Pending Confirmation'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 2. Delivery Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white rounded-sm border border-[#ede9e0] p-6 max-w-xl shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] mb-4">
                    Default Shipping Information
                  </h2>
                  <p className="text-xs text-[#6B6B88] mb-5">
                    This address will automatically pre-fill at checkout for swift order processing.
                  </p>

                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1">
                        Phone Number (for Courier Dispatch)
                      </label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="+234 800 000 0000"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1">
                        Street Address & Apartment
                      </label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1">
                          State
                        </label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white"
                        >
                          {['Lagos', 'Abuja FCT', 'Rivers', 'Oyo', 'Enugu', 'Kano', 'Delta', 'Ogun'].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0A0A0A] text-[#D4AF37] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
                    >
                      Save Address
                    </button>
                  </form>
                </div>
              )}

              {/* 3. Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  {activeWishlist.length === 0 ? (
                    <div className="bg-white rounded-sm border border-[#ede9e0] p-10 text-center">
                      <RiHeart3Line size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-[#0A0A0A]">Your wishlist is currently empty</p>
                      <p className="text-xs text-[#6B6B88] mt-1 mb-4">
                        Save your preferred fragrance creations to review or purchase later.
                      </p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0A0A0A] text-[#D4AF37] text-xs font-bold uppercase tracking-widest rounded-sm no-underline"
                      >
                        Explore Fragrances <RiArrowRightLine size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeWishlist.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-sm border border-[#ede9e0] p-4 flex gap-3 items-center"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-contain bg-[#FAFAF8] rounded border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                              {item.brand}
                            </p>
                            <h3 className="text-xs font-bold text-[#0A0A0A] truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs font-bold text-[#0A0A0A] mt-0.5">
                              {formatNaira(item.price)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  addToCart(item)
                                  removeFromWishlist(item.id)
                                  toast.success(`Moved ${item.name} to bag`)
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:underline"
                              >
                                Move to Bag
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="text-[10px] text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </SignedIn>
        </div>
      </main>

      <Footer />
    </div>
  )
}

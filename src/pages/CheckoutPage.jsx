import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  RiInformationLine,
  RiFileCopyLine,
  RiCheckLine,
  RiTruckLine,
  RiBuildingLine,
  RiShieldCheckLine,
  RiShoppingBag3Line,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiCloseLine,
  RiWhatsappFill,
  RiCoupon3Line,
  RiLockLine,
} from 'react-icons/ri'
import { FiArrowLeft } from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useCart } from '../context/CartContext'
import { useAdminData } from '../context/AdminDataContext'

function formatNaira(amount) {
  return '₦' + Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Abuja FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

const PROMO_CODES = {
  ATELIER10: 10,
  FANCY20: 20,
  VIP15: 15,
}

const BANK_DETAILS = {
  bankName: 'OPAY',
  accountName: 'DENNNIS UWEM',
  accountNumber: '9121536442',
  whatsappNumber: '2349121536442',
}

const POLICY_TEXTS = {
  refund: {
    title: 'Refund Policy',
    content: 'All authentic fragrances purchased at Fancy Atelier Parfums are eligible for returns within 7 days of delivery only if items remain sealed in original cellophane packaging. Due to hygiene standards, unsealed or sprayed bottles cannot be returned.',
  },
  shipping: {
    title: 'Shipping & Delivery Policy',
    content: 'Internal shipping covers deliveries within Lagos and Abuja (2–4 business days). External shipping covers other states across Nigeria (5–7 business days). Orders are dispatched upon bank transfer proof verification.',
  },
  privacy: {
    title: 'Privacy Policy',
    content: 'Your privacy is paramount. Customer contact and shipping information is encrypted and used exclusively for order fulfillment, dispatch updates, and opted-in concierge fragrance alerts.',
  },
  terms: {
    title: 'Terms of Service',
    content: 'By placing an order via bank deposit on Fancy Atelier Parfums, you confirm that full payment of the order total will be transferred directly to our authorized OPay account and verified with proof of payment.',
  },
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { items, subtotal, clearCart } = useCart()
  const { addOrder } = useAdminData()

  // Saved address pre-fill
  const savedAddress = (() => {
    try {
      const s = localStorage.getItem('fa_customer_address')
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  })()

  // Delivery toggle: 'ship' vs 'pickup'
  const [deliveryType, setDeliveryType] = useState('ship')

  // Shipping method selection: 'internal' vs 'external'
  const [shippingMethod, setShippingMethod] = useState('internal')

  // Billing address selection: 'same' vs 'different'
  const [billingOption, setBillingOption] = useState('same')

  // Mobile order summary accordion
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  // One-click copy state for OPay account number
  const [copiedAccount, setCopiedAccount] = useState(false)

  // Policy modal state
  const [activePolicy, setActivePolicy] = useState(null)

  // Form inputs
  const [form, setForm] = useState({
    email: '',
    newsOffers: true,
    country: 'Nigeria',
    firstName: savedAddress?.firstName || '',
    lastName: savedAddress?.lastName || '',
    company: savedAddress?.company || '',
    address: savedAddress?.address || '',
    apartment: savedAddress?.apartment || '',
    city: savedAddress?.city || 'Lagos',
    state: savedAddress?.state || 'Lagos',
    postalCode: savedAddress?.postalCode || '',
    phonePrefix: '+234',
    phone: savedAddress?.phone || '',
    saveInfo: true,
    // Separate billing fields
    billingCountry: 'Nigeria',
    billingFirstName: '',
    billingLastName: '',
    billingCompany: '',
    billingAddress: '',
    billingApartment: '',
    billingCity: '',
    billingState: 'Lagos',
    billingPostalCode: '',
    billingPhone: '',
  })

  // Validation errors
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Promo code
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill user data from Clerk
  useEffect(() => {
    if (isLoaded && user) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        phone: prev.phone || user.phoneNumbers?.[0]?.phoneNumber?.replace(/^\+234/, '') || '',
      }))
    }
  }, [isLoaded, user])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate('/cart')
    }
  }, [items, isSubmitting, navigate])

  // Shipping calculation
  const shippingFee = deliveryType === 'pickup'
    ? 0
    : shippingMethod === 'internal'
      ? 6000
      : 9000

  // Promo calculation
  const discountAmount = appliedPromo
    ? Math.round((subtotal * appliedPromo.percent) / 100)
    : 0

  const estimatedTaxes = 0.00 // Standard included VAT
  const orderTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTaxes)

  // Input change handler
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, form[field])
  }

  // Single field validation
  const validateField = (field, val) => {
    let err = ''
    if (field === 'email') {
      if (!val || !val.trim()) err = 'Enter an email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) err = 'Enter a valid email address'
    } else if (field === 'firstName' && deliveryType === 'ship') {
      if (!val || !val.trim()) err = 'Enter a first name'
    } else if (field === 'lastName' && deliveryType === 'ship') {
      if (!val || !val.trim()) err = 'Enter a last name'
    } else if (field === 'address' && deliveryType === 'ship') {
      if (!val || !val.trim()) err = 'Enter an address'
    } else if (field === 'city' && deliveryType === 'ship') {
      if (!val || !val.trim()) err = 'Enter a city'
    } else if (field === 'state' && deliveryType === 'ship') {
      if (!val || !val.trim()) err = 'Select a state'
    } else if (field === 'phone') {
      if (!val || !val.trim()) err = 'Enter a phone number'
    } else if (billingOption === 'different') {
      if (field === 'billingFirstName' && (!val || !val.trim())) err = 'Enter a first name'
      if (field === 'billingLastName' && (!val || !val.trim())) err = 'Enter a last name'
      if (field === 'billingAddress' && (!val || !val.trim())) err = 'Enter an address'
      if (field === 'billingCity' && (!val || !val.trim())) err = 'Enter a city'
    }

    setErrors((prev) => {
      const next = { ...prev }
      if (err) next[field] = err
      else delete next[field]
      return next
    })
    return err
  }

  // Complete validation
  const validateForm = () => {
    const errs = {}
    if (!form.email || !form.email.trim()) {
      errs.email = 'Enter an email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address'
    }

    if (deliveryType === 'ship') {
      if (!form.firstName || !form.firstName.trim()) errs.firstName = 'Enter a first name'
      if (!form.lastName || !form.lastName.trim()) errs.lastName = 'Enter a last name'
      if (!form.address || !form.address.trim()) errs.address = 'Enter an address'
      if (!form.city || !form.city.trim()) errs.city = 'Enter a city'
      if (!form.state || !form.state.trim()) errs.state = 'Select a state'
    }

    if (!form.phone || !form.phone.trim()) {
      errs.phone = 'Enter a phone number'
    }

    if (billingOption === 'different') {
      if (!form.billingFirstName || !form.billingFirstName.trim()) errs.billingFirstName = 'Enter a first name'
      if (!form.billingLastName || !form.billingLastName.trim()) errs.billingLastName = 'Enter a last name'
      if (!form.billingAddress || !form.billingAddress.trim()) errs.billingAddress = 'Enter an address'
      if (!form.billingCity || !form.billingCity.trim()) errs.billingCity = 'Enter a city'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Copy account number
  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_DETAILS.accountNumber)
      setCopiedAccount(true)
      toast.success('Account number copied to clipboard: ' + BANK_DETAILS.accountNumber, {
        icon: '📋',
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' },
      })
      setTimeout(() => setCopiedAccount(false), 3000)
    } catch {
      toast.error('Could not copy automatically. Account number: ' + BANK_DETAILS.accountNumber)
    }
  }

  // Apply promo
  const handleApplyPromo = (e) => {
    e.preventDefault()
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    if (PROMO_CODES[code]) {
      setAppliedPromo({ code, percent: PROMO_CODES[code] })
      toast.success(`Promo code applied: ${PROMO_CODES[code]}% discount!`, {
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' },
      })
    } else {
      toast.error('Invalid promo code. Try ATELIER10 or FANCY20', {
        style: { background: '#0A0A0A', color: '#FFFFFF' },
      })
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoInput('')
  }

  // Submit order & redirect to WhatsApp
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please complete all required fields highlighted in red.', {
        style: { background: '#0A0A0A', color: '#FFFFFF' },
      })
      window.scrollTo({ top: 120, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    // Save address if requested
    if (form.saveInfo && deliveryType === 'ship') {
      try {
        localStorage.setItem(
          'fa_customer_address',
          JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            company: form.company,
            address: form.address,
            apartment: form.apartment,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            phone: form.phone,
          })
        )
      } catch (err) {
        console.warn('Could not save address to localStorage:', err)
      }
    }

    const orderNumber = `FA-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
    const orderItems = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      brand: i.product.brand || i.product.brands?.name || 'Fancy Atelier',
      size: i.size || '100ml',
      quantity: i.quantity,
      price: i.price,
      image: i.product.image || i.product.image_url,
      unitPrice: i.price,
      subtotal: i.price * i.quantity,
    }))

    const shippingAddressData = deliveryType === 'ship'
      ? {
          firstName: form.firstName,
          lastName: form.lastName,
          company: form.company,
          street: form.address,
          apartment: form.apartment,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        }
      : {
          pickupBoutique: 'Fancy Atelier Parfums Flagship, Victoria Island, Lagos',
          city: 'Lagos',
          state: 'Lagos',
        }

    const billingAddressData = billingOption === 'same'
      ? shippingAddressData
      : {
          firstName: form.billingFirstName,
          lastName: form.billingLastName,
          company: form.billingCompany,
          street: form.billingAddress,
          apartment: form.billingApartment,
          city: form.billingCity,
          state: form.billingState,
          postalCode: form.billingPostalCode,
          country: form.billingCountry,
        }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber,
      clerkUserId: user?.id || null,
      customerName: `${form.firstName} ${form.lastName}`.trim() || form.email,
      customerEmail: form.email.trim(),
      customerPhone: `${form.phonePrefix} ${form.phone.trim()}`,
      deliveryType,
      deliveryMethod: deliveryType === 'ship' ? shippingMethod : 'pickup',
      shippingAddress: shippingAddressData,
      billingAddress: billingAddressData,
      items: orderItems,
      subtotal,
      shippingFee,
      discount: discountAmount,
      promoCode: appliedPromo?.code || null,
      tax: estimatedTaxes,
      total: orderTotal,
      paymentMethod: 'bank_transfer',
      bankDetails: BANK_DETAILS,
      status: 'pending_proof',
      paymentStatus: 'awaiting_transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      // Save order to app state & Supabase
      if (typeof addOrder === 'function') {
        addOrder(newOrder)
      }

      // Pre-save to localStorage so confirmation page loads reliably even on fresh redirect
      localStorage.setItem(`fa_last_order_${newOrder.id}`, JSON.stringify(newOrder))

      // Simulate sending transactional payment summary email
      console.log(`[Email Notification] Transactional order summary dispatched to ${form.email} for order ${orderNumber}`)

      // Prepare WhatsApp Proof-of-Payment message
      const itemSummaries = items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')
      const waText = encodeURIComponent(
        `Hello Fancy Atelier Parfums,\n\n` +
        `I have transferred the sum of ₦${orderTotal.toLocaleString('en-NG')} for my Order #${orderNumber}.\n\n` +
        `Customer: ${newOrder.customerName}\n` +
        `Phone: ${newOrder.customerPhone}\n` +
        `Items: ${itemSummaries}\n\n` +
        `I am attaching my proof of payment / receipt here for verification.`
      )
      const waUrl = `https://wa.me/${BANK_DETAILS.whatsappNumber}?text=${waText}`

      toast.success('Order recorded! Redirecting to WhatsApp to send payment proof…', {
        duration: 3500,
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' },
      })

      // Clear shopping bag
      clearCart()

      // Open WhatsApp in a new tab/window for sending receipt
      window.open(waUrl, '_blank')

      // Navigate current tab to the Order Confirmation page
      setTimeout(() => {
        navigate(`/order-confirmation/${newOrder.id}`, {
          state: { order: newOrder },
        })
      }, 500)
    } catch (err) {
      console.error('Failed to create order:', err)
      toast.error('An error occurred while saving your order. Please try again.')
      setIsSubmitting(false)
    }
  }

  const inputClass = (field) => `
    w-full px-3.5 py-3 text-sm rounded-sm bg-white transition-all
    ${errors[field]
      ? 'border border-red-500 text-red-900 focus:outline-none focus:ring-1 focus:ring-red-500'
      : 'border border-[#E5E0D8] text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
    }
  `

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF] text-[#0A0A0A]">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-28 pb-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Back Nav */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#D4AF37] transition-colors no-underline"
            >
              <FiArrowLeft size={14} /> Back to Bag
            </Link>
            <div className="h-3 w-px bg-gray-300" />
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
              Secure Checkout
            </span>
          </div>

          {/* Mobile Collapsible Order Summary Banner (< lg) */}
          <div className="lg:hidden mb-6 bg-white border border-[#E5E0D8] rounded-sm overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm bg-[#FAF8F5] hover:bg-[#F5F2EC] transition-colors text-left"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0A]">
                <RiShoppingBag3Line size={16} className="text-[#D4AF37]" />
                <span>{mobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
                {mobileSummaryOpen ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
              </div>
              <span className="text-base font-bold font-serif text-[#0A0A0A]">
                {formatNaira(orderTotal)}
              </span>
            </button>

            <AnimatePresence>
              {mobileSummaryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 py-4 border-t border-[#E5E0D8] bg-white divide-y divide-[#F0EDE6]"
                >
                  <div className="space-y-3 pb-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-sm border border-[#E5E0D8] bg-gray-50 flex-shrink-0">
                          <img
                            src={item.product.image || item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-sm"
                          />
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#0A0A0A] text-white text-[10px] font-bold flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0A0A0A] truncate">{item.product.name}</p>
                          <p className="text-[11px] text-[#6B6B88]">{item.size || '100ml'}</p>
                        </div>
                        <p className="text-xs font-bold text-[#0A0A0A]">{formatNaira(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 space-y-1.5 text-xs text-[#6B6B88]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#0A0A0A]">{formatNaira(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount ({appliedPromo.code})</span>
                        <span className="font-semibold">−{formatNaira(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-semibold text-[#0A0A0A]">
                        {shippingFee === 0 ? 'Free' : formatNaira(shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated taxes</span>
                      <span className="font-semibold text-[#0A0A0A]">{formatNaira(estimatedTaxes)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#0A0A0A] pt-2 border-t border-[#E5E0D8]">
                      <span>Total</span>
                      <span>{formatNaira(orderTotal)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ══════════════════════════════════════════════════════
                LEFT COLUMN: FORM INPUT SECTIONS
               ══════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Contact Section */}
                <div className="bg-white rounded-sm p-6 border border-[#E5E0D8] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold font-serif text-[#0A0A0A]">Contact</h2>
                    {!isSignedIn ? (
                      <Link
                        to="/sign-in?redirect=/checkout"
                        className="text-xs font-semibold text-[#D4AF37] hover:underline"
                      >
                        Sign in
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Signed in as <strong className="text-[#0A0A0A]">{user.primaryEmailAddress?.emailAddress}</strong></span>
                        <button
                          type="button"
                          onClick={() => signOut()}
                          className="text-[#D4AF37] hover:underline font-semibold"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        type="email"
                        id="checkout-email"
                        placeholder="Email address *"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        className={inputClass('email')}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" title="Your order confirmation and tracking updates will be sent to this email address.">
                        <RiInformationLine size={17} />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#0A0A0A]">
                      <input
                        type="checkbox"
                        checked={form.newsOffers}
                        onChange={(e) => handleChange('newsOffers', e.target.checked)}
                        className="w-4 h-4 rounded-sm border-gray-300 accent-[#D4AF37]"
                      />
                      <span>Email me with news and offers</span>
                    </label>
                  </div>
                </div>

                {/* 2. Delivery / Shipping Address Section */}
                <div className="bg-white rounded-sm p-6 border border-[#E5E0D8] shadow-sm">
                  <h2 className="text-lg font-bold font-serif text-[#0A0A0A] mb-4">Delivery</h2>

                  {/* Segmented Toggle: Ship vs Pickup */}
                  <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm mb-5">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('ship')}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                        deliveryType === 'ship'
                          ? 'bg-[#0A0A0A] text-white shadow-sm'
                          : 'text-[#6B6B88] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <RiTruckLine size={16} /> Ship
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                        deliveryType === 'pickup'
                          ? 'bg-[#0A0A0A] text-white shadow-sm'
                          : 'text-[#6B6B88] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <RiBuildingLine size={16} /> Pickup
                    </button>
                  </div>

                  {deliveryType === 'pickup' ? (
                    <div className="p-4 bg-[#FAF8F5] border border-[#D4AF37]/40 rounded-sm mb-4">
                      <div className="flex items-start gap-3">
                        <RiBuildingLine size={20} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider mb-1">
                            Boutique Concierge Pickup
                          </p>
                          <p className="text-xs text-[#6B6B88]">
                            Fancy Atelier Parfums Flagship, Victoria Island, Lagos
                          </p>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                            • Usually ready for collection within 24 hours. Free pickup.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Ship Form Fields */
                    <div className="space-y-3.5">
                      {/* Country / Region */}
                      <div>
                        <select
                          value={form.country}
                          onChange={(e) => handleChange('country', e.target.value)}
                          className={inputClass('country')}
                        >
                          <option value="Nigeria">Nigeria</option>
                        </select>
                      </div>

                      {/* First name & Last name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <input
                            type="text"
                            placeholder="First name *"
                            value={form.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            onBlur={() => handleBlur('firstName')}
                            className={inputClass('firstName')}
                          />
                          {errors.firstName && (
                            <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Last name *"
                            value={form.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            onBlur={() => handleBlur('lastName')}
                            className={inputClass('lastName')}
                          />
                          {errors.lastName && (
                            <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      {/* Company (optional) */}
                      <div>
                        <input
                          type="text"
                          placeholder="Company (optional)"
                          value={form.company}
                          onChange={(e) => handleChange('company', e.target.value)}
                          className={inputClass('company')}
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <input
                          type="text"
                          placeholder="Address *"
                          value={form.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          onBlur={() => handleBlur('address')}
                          className={inputClass('address')}
                        />
                        {errors.address && (
                          <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                        )}
                      </div>

                      {/* Apartment, suite, etc. (optional) */}
                      <div>
                        <input
                          type="text"
                          placeholder="Apartment, suite, etc. (optional)"
                          value={form.apartment}
                          onChange={(e) => handleChange('apartment', e.target.value)}
                          className={inputClass('apartment')}
                        />
                      </div>

                      {/* City, State, Postal code in 3 columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <input
                            type="text"
                            placeholder="City *"
                            value={form.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            onBlur={() => handleBlur('city')}
                            className={inputClass('city')}
                          />
                          {errors.city && (
                            <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                          )}
                        </div>
                        <div>
                          <select
                            value={form.state}
                            onChange={(e) => handleChange('state', e.target.value)}
                            onBlur={() => handleBlur('state')}
                            className={inputClass('state')}
                          >
                            <option value="">State *</option>
                            {NIGERIAN_STATES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Postal code (optional)"
                            value={form.postalCode}
                            onChange={(e) => handleChange('postalCode', e.target.value)}
                            className={inputClass('postalCode')}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone number field with country code prefix selector & tooltip */}
                  <div className="mt-3.5">
                    <div className="relative flex items-center">
                      <div className="flex items-center gap-1.5 px-3 py-3 border border-r-0 border-[#E5E0D8] bg-[#FAF8F5] rounded-l-sm text-xs font-semibold text-[#0A0A0A] select-none">
                        <span className="text-base leading-none">🇳🇬</span>
                        <span>+234</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="Phone number *"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full px-3.5 py-3 text-sm rounded-r-sm bg-white transition-all ${
                          errors.phone
                            ? 'border border-red-500 text-red-900 focus:outline-none focus:ring-1 focus:ring-red-500'
                            : 'border border-[#E5E0D8] text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
                        }`}
                      />
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                        title="In case our dispatch team needs to reach you regarding delivery."
                      >
                        <RiInformationLine size={17} />
                      </div>
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Save information checkbox */}
                  <div className="mt-4">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#0A0A0A]">
                      <input
                        type="checkbox"
                        checked={form.saveInfo}
                        onChange={(e) => handleChange('saveInfo', e.target.checked)}
                        className="w-4 h-4 rounded-sm border-gray-300 accent-[#D4AF37]"
                      />
                      <span>Save this information for next time</span>
                    </label>
                  </div>
                </div>

                {/* 3. Shipping Method Section */}
                <div className="bg-white rounded-sm p-6 border border-[#E5E0D8] shadow-sm">
                  <h2 className="text-lg font-bold font-serif text-[#0A0A0A] mb-4">Shipping method</h2>

                  {deliveryType === 'pickup' ? (
                    <div className="p-4 border border-[#E5E0D8] rounded-sm bg-[#FAF8F5] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#0A0A0A]">Boutique Pickup</p>
                        <p className="text-[#6B6B88]">Pickup ready within 24 hours at Victoria Island Boutique</p>
                      </div>
                      <span className="font-bold text-emerald-700">FREE</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Option 1: Internal Shipping */}
                      <label
                        className={`flex items-center justify-between p-4 rounded-sm border cursor-pointer transition-all ${
                          shippingMethod === 'internal'
                            ? 'border-[#D4AF37] bg-[#FDFBF7] ring-1 ring-[#D4AF37]/50'
                            : 'border-[#E5E0D8] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="internal"
                            checked={shippingMethod === 'internal'}
                            onChange={() => setShippingMethod('internal')}
                            className="mt-0.5 accent-[#D4AF37]"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#0A0A0A]">Internal Shipping</p>
                            <p className="text-[11px] text-[#6B6B88] mt-0.5">2 - 4 Working days (Within Lagos &amp; Abuja)</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0A0A0A]">₦6,000.00</span>
                      </label>

                      {/* Option 2: External Shipping */}
                      <label
                        className={`flex items-center justify-between p-4 rounded-sm border cursor-pointer transition-all ${
                          shippingMethod === 'external'
                            ? 'border-[#D4AF37] bg-[#FDFBF7] ring-1 ring-[#D4AF37]/50'
                            : 'border-[#E5E0D8] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value="external"
                            checked={shippingMethod === 'external'}
                            onChange={() => setShippingMethod('external')}
                            className="mt-0.5 accent-[#D4AF37]"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#0A0A0A]">External Shipping</p>
                            <p className="text-[11px] text-[#6B6B88] mt-0.5">5 - 7 Working days (Outside Lagos)</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0A0A0A]">₦9,000.00</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 4. Payment Section */}
                <div className="bg-white rounded-sm p-6 border border-[#E5E0D8] shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold font-serif text-[#0A0A0A]">Payment</h2>
                    <p className="text-xs text-[#6B6B88] flex items-center gap-1 mt-0.5">
                      <RiShieldCheckLine size={14} className="text-emerald-600" />
                      All transactions are secure and encrypted.
                    </p>
                  </div>

                  {/* Bank Deposit Card */}
                  <div className="border border-[#D4AF37] rounded-sm bg-[#FAF8F5] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                          Bank Deposit / Bank Transfer
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8B6E1E] font-bold">
                        Direct Deposit
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-bold text-[#0A0A0A]">Pay with bank transfer</p>
                      <div className="p-3 bg-white rounded-sm border border-[#E5E0D8] space-y-1.5 font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#6B6B88] font-sans">BANK NAME:</span>
                          <span className="font-bold text-[#0A0A0A]">{BANK_DETAILS.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6B6B88] font-sans">ACCOUNT NAME:</span>
                          <span className="font-bold text-[#0A0A0A]">{BANK_DETAILS.accountName}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <span className="text-[#6B6B88] font-sans">ACCOUNT NUMBER:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0A0A0A] tracking-wider">
                              {BANK_DETAILS.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyAccount}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase rounded bg-[#0A0A0A] text-[#D4AF37] hover:bg-[#1a1a1a] transition-all"
                              title="Click to copy account number"
                            >
                              {copiedAccount ? (
                                <>
                                  <RiCheckLine size={13} className="text-emerald-400" /> Copied!
                                </>
                              ) : (
                                <>
                                  <RiFileCopyLine size={13} /> Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-[11px] text-[#6B6B88] pt-1">
                      <RiInformationLine size={15} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <p>
                        Transfer the exact total of <strong className="text-[#0A0A0A]">{formatNaira(orderTotal)}</strong>. After clicking <strong>"I've sent the money"</strong>, you will be redirected to WhatsApp to submit your payment proof.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Billing Address Section */}
                <div className="bg-white rounded-sm p-6 border border-[#E5E0D8] shadow-sm">
                  <h2 className="text-lg font-bold font-serif text-[#0A0A0A] mb-4">Billing address</h2>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-sm border cursor-pointer transition-all ${
                        billingOption === 'same'
                          ? 'border-[#D4AF37] bg-[#FDFBF7] ring-1 ring-[#D4AF37]/50'
                          : 'border-[#E5E0D8] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="billingOption"
                        value="same"
                        checked={billingOption === 'same'}
                        onChange={() => setBillingOption('same')}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-xs font-semibold text-[#0A0A0A]">Same as shipping address</span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-sm border cursor-pointer transition-all ${
                        billingOption === 'different'
                          ? 'border-[#D4AF37] bg-[#FDFBF7] ring-1 ring-[#D4AF37]/50'
                          : 'border-[#E5E0D8] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="billingOption"
                        value="different"
                        checked={billingOption === 'different'}
                        onChange={() => setBillingOption('different')}
                        className="accent-[#D4AF37]"
                      />
                      <span className="text-xs font-semibold text-[#0A0A0A]">Use a different billing address</span>
                    </label>

                    <AnimatePresence>
                      {billingOption === 'different' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-3 space-y-3"
                        >
                          <div>
                            <select
                              value={form.billingCountry}
                              onChange={(e) => handleChange('billingCountry', e.target.value)}
                              className={inputClass('billingCountry')}
                            >
                              <option value="Nigeria">Nigeria</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                placeholder="First name *"
                                value={form.billingFirstName}
                                onChange={(e) => handleChange('billingFirstName', e.target.value)}
                                className={inputClass('billingFirstName')}
                              />
                              {errors.billingFirstName && (
                                <p className="text-xs text-red-500 mt-1">{errors.billingFirstName}</p>
                              )}
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Last name *"
                                value={form.billingLastName}
                                onChange={(e) => handleChange('billingLastName', e.target.value)}
                                className={inputClass('billingLastName')}
                              />
                              {errors.billingLastName && (
                                <p className="text-xs text-red-500 mt-1">{errors.billingLastName}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Address *"
                              value={form.billingAddress}
                              onChange={(e) => handleChange('billingAddress', e.target.value)}
                              className={inputClass('billingAddress')}
                            />
                            {errors.billingAddress && (
                              <p className="text-xs text-red-500 mt-1">{errors.billingAddress}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="City *"
                              value={form.billingCity}
                              onChange={(e) => handleChange('billingCity', e.target.value)}
                              className={inputClass('billingCity')}
                            />
                            <select
                              value={form.billingState}
                              onChange={(e) => handleChange('billingState', e.target.value)}
                              className={inputClass('billingState')}
                            >
                              {NIGERIAN_STATES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Postal code"
                              value={form.billingPostalCode}
                              onChange={(e) => handleChange('billingPostalCode', e.target.value)}
                              className={inputClass('billingPostalCode')}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 6. Submit Action & Footer */}
                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    id="submit-order-button"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 text-sm font-bold uppercase tracking-wider text-white rounded-sm shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    style={{ background: '#8B1E1E' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#721818' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#8B1E1E' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Order…</span>
                      </>
                    ) : (
                      <>
                        <RiWhatsappFill size={20} className="text-emerald-400" />
                        <span>I've sent the money</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-[#6B6B88]">
                    Clicking confirms you have sent the transfer. You will immediately be redirected to WhatsApp to send payment proof.
                  </p>

                  {/* Policy Footer Links */}
                  <div className="pt-6 border-t border-[#E5E0D8] flex flex-wrap items-center justify-center gap-4 text-xs text-[#6B6B88]">
                    <button
                      type="button"
                      onClick={() => setActivePolicy('refund')}
                      className="hover:text-[#D4AF37] hover:underline transition-colors"
                    >
                      Refund policy
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setActivePolicy('shipping')}
                      className="hover:text-[#D4AF37] hover:underline transition-colors"
                    >
                      Shipping
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setActivePolicy('privacy')}
                      className="hover:text-[#D4AF37] hover:underline transition-colors"
                    >
                      Privacy policy
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setActivePolicy('terms')}
                      className="hover:text-[#D4AF37] hover:underline transition-colors"
                    >
                      Terms of service
                    </button>
                  </div>
                </div>

              </form>
            </div>

            {/* ══════════════════════════════════════════════════════
                RIGHT COLUMN: ORDER SUMMARY PANEL (DESKTOP STICKY)
               ══════════════════════════════════════════════════════ */}
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28">
              <div className="bg-white rounded-sm p-6 border border-[#E5E0D8] shadow-sm space-y-6">

                <h3 className="text-base font-bold font-serif text-[#0A0A0A] border-b border-[#E5E0D8] pb-3">
                  Order Summary
                </h3>

                {/* Product List Items */}
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 divide-y divide-[#F0EDE6]">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 pt-3 first:pt-0">
                      <div className="relative w-16 h-16 rounded-sm border border-[#E5E0D8] bg-gray-50 flex-shrink-0">
                        <img
                          src={item.product.image || item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-sm"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#0A0A0A] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] truncate">
                          {item.product.brand || item.product.brands?.name || 'Fancy Atelier'}
                        </p>
                        <p className="text-xs font-semibold text-[#0A0A0A] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#6B6B88]">
                          {item.size || '100ml'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-[#0A0A0A]">
                          {formatNaira(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code Input */}
                <form onSubmit={handleApplyPromo} className="pt-2 border-t border-[#E5E0D8]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 text-xs rounded-sm border border-[#E5E0D8] focus:outline-none focus:border-[#D4AF37] uppercase placeholder-normal"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-[#0A0A0A] text-[#D4AF37] hover:bg-[#1a1a1a] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="flex items-center justify-between mt-2.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#D4AF37]/50 rounded-sm text-xs">
                      <span className="font-mono text-emerald-800 font-bold flex items-center gap-1.5">
                        <RiCoupon3Line /> {appliedPromo.code} (-{appliedPromo.percent}%)
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove coupon"
                      >
                        <RiCloseLine size={16} />
                      </button>
                    </div>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs text-[#6B6B88] border-t border-[#E5E0D8] pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#0A0A0A]">{formatNaira(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount</span>
                      <span>−{formatNaira(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      Shipping
                      <span className="text-gray-400 cursor-pointer" title="Direct courier fee calculated based on delivery destination.">
                        <RiInformationLine size={14} />
                      </span>
                    </span>
                    <span className="font-semibold text-[#0A0A0A]">
                      {shippingFee === 0 ? 'FREE' : formatNaira(shippingFee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      Estimated taxes
                      <span className="text-gray-400 cursor-pointer" title="Value-added tax included in base retail pricing.">
                        <RiInformationLine size={14} />
                      </span>
                    </span>
                    <span className="font-semibold text-[#0A0A0A]">{formatNaira(estimatedTaxes)}</span>
                  </div>
                </div>

                {/* Total Section */}
                <div className="flex items-baseline justify-between pt-4 border-t border-[#E5E0D8]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A]">Total</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">NGN</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-serif text-[#0A0A0A]">
                      {formatNaira(orderTotal)}
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-sm text-[11px] text-[#6B6B88] space-y-1">
                  <p className="flex items-center gap-1.5 font-semibold text-[#0A0A0A]">
                    <RiShieldCheckLine size={14} className="text-[#D4AF37]" />
                    100% Authentic Luxury Guarantee
                  </p>
                  <p>All items sourced directly from certified European &amp; Middle Eastern perfume houses.</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Policy Modal Overlay */}
      <AnimatePresence>
        {activePolicy && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePolicy(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-2xl border border-[#E5E0D8] pointer-events-auto">
                <div className="flex items-center justify-between mb-3 border-b border-[#E5E0D8] pb-2">
                  <h3 className="font-serif font-bold text-base text-[#0A0A0A]">
                    {POLICY_TEXTS[activePolicy]?.title}
                  </h3>
                  <button
                    onClick={() => setActivePolicy(null)}
                    className="text-gray-400 hover:text-black transition-colors"
                  >
                    <RiCloseLine size={20} />
                  </button>
                </div>
                <p className="text-xs text-[#6B6B88] leading-relaxed mb-6">
                  {POLICY_TEXTS[activePolicy]?.content}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActivePolicy(null)}
                    className="px-4 py-2 text-xs font-bold uppercase rounded-sm bg-[#0A0A0A] text-white hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

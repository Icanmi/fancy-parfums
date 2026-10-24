import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiShield,
  FiPlus,
  FiMinus,
  FiTag,
} from 'react-icons/fi'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumbs from '../components/common/Breadcrumbs'
import { useCart } from '../context/CartContext'

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG')
}

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    discountPercent,
    promoCode,
    applyPromoCode,
    shippingFee,
    total,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart()

  const navigate = useNavigate()
  const [inputCode, setInputCode] = useState('')

  const handleApplyCode = (e) => {
    e.preventDefault()
    if (inputCode.trim()) {
      applyPromoCode(inputCode)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8EF]">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto pt-24 md:pt-28 pb-16 px-4 md:px-8">
        <Breadcrumbs items={[{ label: 'Shopping Bag' }]} />

        <div className="py-4 border-b border-gray-200 mb-8">
          <h1 className="section-heading text-3xl md:text-4xl">
            Your Shopping Bag
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-sm border border-gray-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#FBF8EF] flex items-center justify-center mx-auto text-[#D4AF37]">
              <FiShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A]">
              Your bag is currently empty
            </h2>
            <p className="text-xs text-gray-500">
              Discover authentic signature perfumes, Arabian ouds, and niche masterworks.
            </p>
            <Link to="/shop" className="btn-primary text-xs inline-flex">
              Explore Fragrance Catalogue <FiArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Alert Banner */}
              <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-gray-700">
                    {amountNeededForFreeShipping === 0 ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ Free Nationwide Delivery Unlocked!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-[#D4AF37]">{formatNaira(amountNeededForFreeShipping)}</strong> more to get <strong>Free Delivery</strong>
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {Math.round(freeShippingProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#D4AF37] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-sm border border-gray-200 divide-y divide-gray-100 shadow-sm">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-24 object-cover rounded bg-gray-50 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {item.product.brand}
                        </span>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-bold text-sm text-[#0A0A0A] hover:text-[#D4AF37] block leading-tight mb-1"
                        >
                          {item.product.name}
                        </Link>
                        <span className="inline-block text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Size: {item.size}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Unit: {formatNaira(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Item Total */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0A0A0A] font-['Playfair_Display']">
                          {formatNaira(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-red-500 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <FiTrash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-sm border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A] pb-3 border-b border-gray-200">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-black">{formatNaira(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo Discount ({discountPercent}%)</span>
                      <span className="font-semibold">-{formatNaira(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-black">
                      {shippingFee === 0 ? 'FREE' : formatNaira(shippingFee)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCode} className="pt-2">
                  <label className="text-[11px] font-bold uppercase text-gray-500 flex items-center gap-1 mb-1.5">
                    <FiTag size={12} className="text-[#D4AF37]" /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="e.g. ATELIER10"
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded uppercase focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0A0A0A] text-white text-xs font-bold rounded hover:bg-[#D4AF37] hover:text-black transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoCode && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                      ✓ Promo "{promoCode}" applied
                    </p>
                  )}
                </form>

                {/* Total */}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-[#0A0A0A] font-['Playfair_Display']">
                    {formatNaira(total)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-primary w-full justify-center text-xs py-3.5 shadow-md mt-2"
                >
                  Proceed to Secure Checkout <FiArrowRight size={14} />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-2">
                  <FiShield className="text-[#D4AF37]" size={14} />
                  <span>256-bit SSL Encrypted & Protected</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

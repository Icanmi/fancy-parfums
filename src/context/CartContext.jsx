/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'


const CartContext = createContext(null)

const CART_STORAGE_KEY = 'fancy_atelier_cart_v1'
const FREE_SHIPPING_THRESHOLD = 100000
const STANDARD_SHIPPING_FEE = 5000

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to sync cart to localStorage', e)
    }
  }, [items])

  const addToCart = (product, quantity = 1, size = null) => {
    const selectedSize = size || product.defaultSize || product.sizes?.[0] || '100ml'
    const cartItemId = `${product.id}-${selectedSize}`

    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId)
      if (existing) {
        toast.success(`Updated ${product.name} quantity to ${existing.quantity + quantity}`, {
          style: { background: '#0A0A0A', color: '#FBF8EF', border: '1px solid #D4AF37' },
          iconTheme: { primary: '#D4AF37', secondary: '#0A0A0A' },
        })
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      toast.success(`Added ${product.name} (${selectedSize}) to bag!`, {
        style: { background: '#0A0A0A', color: '#FBF8EF', border: '1px solid #D4AF37' },
        iconTheme: { primary: '#D4AF37', secondary: '#0A0A0A' },
      })
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          size: selectedSize,
          quantity,
          price: product.price,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    )
  }

  const removeFromCart = (cartItemId) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === cartItemId)
      if (target) {
        toast('Removed from bag', {
          icon: '🗑️',
          style: { background: '#0A0A0A', color: '#FBF8EF' },
        })
      }
      return prev.filter((item) => item.id !== cartItemId)
    })
  }

  const clearCart = () => {
    setItems([])
    setPromoCode('')
    setDiscountPercent(0)
  }

  const applyPromoCode = (code) => {
    const formatted = code.trim().toUpperCase()
    if (formatted === 'ATELIER10') {
      setDiscountPercent(10)
      setPromoCode(formatted)
      toast.success('Promo code applied: 10% discount!', {
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' },
      })
      return true
    }
    if (formatted === 'FANCY20') {
      setDiscountPercent(20)
      setPromoCode(formatted)
      toast.success('VIP Promo code applied: 20% discount!', {
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' },
      })
      return true
    }
    toast.error('Invalid promo code. Try ATELIER10', {
      style: { background: '#0A0A0A', color: '#FBF8EF' },
    })
    return false
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const shippingFee =
    items.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const total = Math.max(0, subtotal - discountAmount + shippingFee)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        discountPercent,
        discountAmount,
        promoCode,
        applyPromoCode,
        shippingFee,
        total,
        freeShippingProgress,
        amountNeededForFreeShipping,
        FREE_SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

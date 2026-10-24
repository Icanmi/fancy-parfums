/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { PRODUCTS } from '../data/products'

const WishlistContext = createContext(null)

const WISHLIST_STORAGE_KEY = 'fancy_atelier_wishlist_v1'
const WISHLIST_ITEMS_KEY = 'fancy_atelier_wishlist_products_v1'

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [cachedProducts, setCachedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_ITEMS_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds))
      localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(cachedProducts))
    } catch (e) {
      console.error('Failed to sync wishlist to localStorage', e)
    }
  }, [wishlistIds, cachedProducts])

  const isInWishlist = (productId) => wishlistIds.includes(productId)

  const toggleWishlist = (product) => {
    if (!product) return
    const isSaved = wishlistIds.includes(product.id)
    if (isSaved) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id))
      setCachedProducts((prev) => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      toast(`Removed ${product.name} from wishlist`, {
        icon: '🤍',
        style: { background: '#0A0A0A', color: '#FBF8EF' },
      })
    } else {
      setWishlistIds((prev) => [...prev, product.id])
      setCachedProducts((prev) => ({ ...prev, [product.id]: product }))
      toast.success(`Saved ${product.name} to wishlist!`, {
        style: { background: '#0A0A0A', color: '#D4AF37', border: '1px solid #D4AF37' },
        iconTheme: { primary: '#D4AF37', secondary: '#0A0A0A' },
      })
    }
  }

  const removeFromWishlist = (productId) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId))
    setCachedProducts((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const clearWishlist = () => {
    setWishlistIds([])
    setCachedProducts({})
  }

  const wishlistItems = wishlistIds
    .map((id) => cachedProducts[id] || PRODUCTS.find((p) => String(p.id) === String(id)))
    .filter(Boolean)

  const wishlistCount = wishlistIds.length

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlist: wishlistItems,
        wishlistItems,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

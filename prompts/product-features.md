# Implementation Prompt — Fancy Atelier Parfums Product Suite (Catalogue, PDP, Search, Filters, Categories, Brands, Cart & Wishlist)

## Goal

Build and wire the complete frontend commerce experience for **Fancy Atelier Parfums**:
1. **Product Catalogue (`/shop`)** — Comprehensive grid with view switcher, active filter chips, pagination/infinite display.
2. **Product Detail Pages (`/product/:id`)** — Rich fragrance presentation including image gallery, olfactory pyramid (top/middle/base notes), longevity & sillage ratings, size selector, stock indicator, quantity stepper, add-to-bag, wishlist toggle, customer reviews, and related fragrances.
3. **Product Search** — Interactive global search modal with instant debounced matching, keyword highlight, recent searches, and direct navigation.
4. **Product Filtering & Sorting** — Multi-faceted filter drawer/sidebar (category, brand, gender, fragrance family, price range slider, in-stock toggle) + sorting options (featured, price asc/desc, rating, newest).
5. **Product Categories (`/categories` & `/category/:slug`)** — Visual category cards (Designer, Arabian Oud, Niche, Unisex, Men, Women) linking to filtered catalogue views.
6. **Perfume Brands (`/brands` & `/brand/:slug`)** — Alphabetical Brand Directory and curated brand hero showcases.
7. **Shopping Cart (`CartContext`, Slide-over Drawer & `/cart` page)** — Persistent cart state in `localStorage`, quantity adjustments, remove action, free shipping progress bar, promo code input, subtotal/total calculations, and toast alerts via `react-hot-toast`.
8. **Wishlist (`WishlistContext`, Slide-over Drawer & `/wishlist` page)** — Persistent wishlist state, real-time Navbar badges, one-click "Move to Bag", and empty states.

---

## State Management Architecture

- `src/context/CartContext.jsx`:
  - Items array `{ id, product, size, quantity, price }` stored in `localStorage`.
  - Methods: `addToCart(product, quantity, size)`, `removeFromCart(cartItemId)`, `updateQuantity(cartItemId, quantity)`, `clearCart()`, `isCartOpen`, `setIsCartOpen(bool)`.
  - Computed: `cartCount`, `subtotal`, `shippingFee` (Free over ₦100,000), `total`.
- `src/context/WishlistContext.jsx`:
  - Wishlist item IDs stored in `localStorage`.
  - Methods: `toggleWishlist(product)`, `isInWishlist(productId)`, `removeFromWishlist(productId)`, `isWishlistOpen`, `setIsWishlistOpen(bool)`.
  - Computed: `wishlistCount`, `wishlistItems`.

---

## Extended Dataset (`src/data/products.js`, `categories.js`, `brands.js`)

- **Products**: 12+ realistic luxury fragrances spanning:
  - Designer: Dior Sauvage EDP, Bleu de Chanel, Tom Ford Tobacco Vanille, YSL Libre, Armani Acqua Di Gio.
  - Arabian Oud: Lattafa Khamrah, Afnan 9PM, Swiss Arabian Shaghaf Oud, Lattafa Asad.
  - Niche: Creed Aventus, Parfums de Marly Layton, Maison Francis Kurkdjian Baccarat Rouge 540, Amouage Interlude Man.
  - Complete attributes: notes pyramid (Top, Middle, Base), concentration (EDP, Parfum, Extrait), gender, longevity, sillage, sizes (50ml, 100ml), prices, stock count.
- **Categories**: Designer, Arabian Oud, Niche Fragrances, Unisex, For Him, For Her.
- **Brands**: Dior, Chanel, Tom Ford, Creed, Lattafa, Afnan, Swiss Arabian, Parfums de Marly, MFK, Amouage.

---

## Files to Create & Update

```
src/
  context/
    CartContext.jsx             <- Cart state, localStorage sync, drawer state
    WishlistContext.jsx         <- Wishlist state, localStorage sync, drawer state
  data/
    products.js                 <- Rich dataset of 12+ luxury perfumes with notes & details
    categories.js               <- Category metadata & banner images
    brands.js                   <- Brand list, descriptions, & country of origin
  components/
    common/
      SearchModal.jsx           <- Fullscreen/overlay global search with instant filtering
      CartDrawer.jsx            <- Slide-over cart preview with free shipping meter
      WishlistDrawer.jsx        <- Slide-over wishlist with quick add-to-bag
      Breadcrumbs.jsx           <- Navigation path breadcrumb trail
    ui/
      ProductCard.jsx           <- Updated with CartContext, WishlistContext, Link to PDP
      FilterSidebar.jsx         <- Filter accordion (Brand, Category, Gender, Family, Price, Stock)
      SortDropdown.jsx          <- Sort select component
      FragranceNotes.jsx        <- Olfactory pyramid display (Top, Heart, Base notes)
    layout/
      Navbar.jsx                <- Updated with live cart/wishlist counters, search & drawer triggers, links to /shop, /brands, /categories
      Footer.jsx                <- Updated with proper react-router Links
  pages/
    HomePage.jsx                <- Existing homepage with updated link routes & dynamic data
    ShopPage.jsx                <- Main catalogue with search, filter drawer/sidebar, sorting, pagination
    ProductDetailPage.jsx       <- Comprehensive PDP with gallery, notes pyramid, size selector, add to bag, reviews, related items
    CategoriesPage.jsx          <- Category directory & spotlight grid
    BrandsPage.jsx              <- Brand index (A-Z) & featured brand banners
    CartPage.jsx                <- Dedicated shopping cart & cost summary page
    WishlistPage.jsx            <- Dedicated wishlist collection page
  App.jsx                       <- App router setup with CartProvider, WishlistProvider, Toaster, and route definitions
```

---

## Visual Design & Aesthetics

- Adherence to the **Fancy Atelier Parfums** palette: Gold (`#D4AF37`), Charcoal (`#0A0A0A`), Cream (`#FBF8EF`), Lemon (`#D9F227`), and Muted Gray (`#6B6B88`).
- Elegant typography pairing: *Playfair Display* for headers, quote callouts, and prices; *Inter* for clean UI body text.
- Micro-interactions: Framer Motion animated drawer slides, smooth filter badge chips, hover zooms, and sticky add-to-bag bars on mobile PDP.
- Rich toast notifications with custom gold/dark theme on cart and wishlist actions.

---

## Verification Plan

1. **Build & Lint Check**: `npm run build` and `npm run lint` must pass cleanly.
2. **Navigation Flow**:
   - Verify `/`, `/shop`, `/product/:id`, `/categories`, `/brands`, `/cart`, `/wishlist` routes load cleanly.
3. **Product Search**:
   - Open search modal via Navbar search icon or shortcut.
   - Search by perfume name, brand, or fragrance family and verify real-time matches.
4. **Filtering & Sorting**:
   - Filter by Brand, Category, Gender, Fragrance Family, Price range, In-stock.
   - Sort by Price (Low/High), Rating, and Newest.
5. **Product Detail Page**:
   - Open any product; verify image preview, notes pyramid, size selection price adjustment, stock status, quantity picker, and related perfumes.
6. **Cart & Wishlist Lifecycle**:
   - Add items to Cart with specific sizes and quantities; verify live badge update in Navbar and Cart Drawer.
   - Adjust quantities, test free-shipping threshold bar, apply sample coupon code (e.g. `ATELIER10`).
   - Toggle wishlist hearts; verify Wishlist Drawer & Page updates and "Move to Bag" capability.

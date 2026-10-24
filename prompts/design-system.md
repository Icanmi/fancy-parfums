# Implementation Prompt — Fancy Atelier Parfums Design System

## Goal

Bootstrap the complete **Fancy Atelier Parfums** design system from the reference UI image and render
a fully composed homepage that showcases every design token and UI component. No backend, no auth, no
payment wiring in this pass — pure frontend design system and homepage layout.

---

## Reference Design Tokens (extracted from UI image)

| Token         | Value       |
|---------------|-------------|
| Gold          | `#D4AF37`   |
| Lemon Green   | `#D9F227`   |
| Black         | `#0A0A0A`   |
| White         | `#FFFFFF`   |
| Cream         | `#FBF8EF`   |
| Gray          | `#6B6B88`   |
| Display font  | Playfair Display |
| Body/UI font  | Inter       |

---

## Dependencies to Install

```
npm install tailwindcss @tailwindcss/vite
npm install react-router-dom framer-motion swiper react-icons react-hot-toast axios react-hook-form
```

---

## File Structure to Create

```
src/
  design-system/
    tokens.css                 <- all CSS custom properties
  components/
    ui/
      Button.jsx               <- Primary + Secondary variants
      Badge.jsx                <- new-arrival (lemon) + best-seller (black/gold)
      StarRating.jsx           <- 1-5 filled stars
      ProductCard.jsx          <- image, badge, wishlist, brand, name, rating, price, CTA
    layout/
      Navbar.jsx               <- logo, nav links, icon cluster; mobile drawer
      Footer.jsx               <- 4-column dark footer
      TrustBar.jsx             <- 4-column icon strip
    sections/
      HeroSection.jsx          <- full-bleed dark, headline, dual CTAs, perfume image
      BrandsSection.jsx        <- Swiper brand-name carousel
      BestSellersSection.jsx   <- 4-up product card grid
      QuoteSection.jsx         <- dark quote panel
  pages/
    HomePage.jsx               <- assembles all sections
  App.jsx                      <- React Router shell
  index.css                    <- @import tokens + Tailwind + component classes
  main.jsx                     <- unchanged
index.html                     <- Google Fonts + updated title/meta
tailwind.config.js             <- custom theme extending design tokens
vite.config.js                 <- add @tailwindcss/vite plugin
```

---

## Step-by-Step Implementation

### 1. vite.config.js — add Tailwind Vite plugin

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

### 2. tailwind.config.js — brand token theme extension

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:     '#D4AF37',
        lemon:    '#D9F227',
        cream:    '#FBF8EF',
        charcoal: '#0A0A0A',
        muted:    '#6B6B88',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['Inter', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 24px rgba(212,175,55,0.25)',
        card: '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
```

### 3. index.html — Google Fonts + SEO meta

Add inside <head>:
- title: "Fancy Atelier Parfums — Discover Your Signature Fragrance"
- meta description: "Premium designer, Arabian and niche fragrances. Authentic scents for the refined you."
- Google Fonts preconnect + stylesheet (Playfair Display + Inter)

### 4. src/design-system/tokens.css — CSS custom properties

All brand tokens as CSS variables: colors, surfaces, fonts, transitions, shadows.

### 5. src/index.css — global styles

- @import './design-system/tokens.css'
- @import 'tailwindcss'
- @layer base: box-sizing reset, smooth scroll, body font/bg/color, antialiasing
- @layer components:
  - .btn-primary (gold filled, charcoal text, uppercase, tracking-wide, hover + active states)
  - .btn-secondary (outlined white, hover fills white, text goes charcoal)
  - .badge-new (lemon green bg, charcoal text, tiny caps)
  - .badge-bestseller (charcoal bg, gold text, gold border, tiny caps)
  - .section-heading (Playfair Display, large, charcoal)
  - .text-accent (gold, italic, Playfair Display)

### 6. Components

#### Button.jsx (src/components/ui/)
- Props: variant ('primary'|'secondary'), children, onClick, type, className
- Renders .btn-primary or .btn-secondary

#### Badge.jsx (src/components/ui/)
- Props: type ('new'|'bestseller')
- Renders .badge-new or .badge-bestseller

#### StarRating.jsx (src/components/ui/)
- Props: rating (0-5), count (review count)
- FaStar icons from react-icons, filled/empty based on rating
- Gray review count text

#### ProductCard.jsx (src/components/ui/)
- Props: product { id, image, badge, brand, name, rating, reviewCount, price }
- White/cream card, shadow-card, rounded-sm, overflow-hidden
- Image area: relative, badge top-left, heart wishlist button top-right (toggle)
- Body: brand (uppercase gray small), name (semi-bold), StarRating, price (₦ formatted, bold)
- "Add to Bag" button: btn-primary full-width, Framer Motion reveal on card hover
- Hover: card lifts translateY(-4px) + deeper shadow (Framer Motion)

#### Navbar.jsx (src/components/layout/)
- Fixed top, z-50, full-width
- Transparent when at top of hero, cream bg with shadow on scroll
- Left: inline FA monogram SVG + wordmark text
- Center: nav links (HOME SHOP BRANDS ABOUT CONTACT) spaced, uppercase tracking
- Right: Search, Heart, User, Cart (with item count badge) icons from react-icons
- Mobile (<=768px): hide center links + show hamburger, Framer Motion slide-in drawer
- useEffect scroll listener for bg transition

#### TrustBar.jsx (src/components/layout/)
- Cream bg, thin top border in gold at 20% opacity
- 4-column grid: 100% Authentic, Premium Quality, Secure Payment, Fast Delivery
- Each: icon + bold label + sub-label

#### Footer.jsx (src/components/layout/)
- charcoal (#0A0A0A) bg, white text, gold accents
- 4 columns: Brand (FA logo + tagline + social icons), Navigation, Contact, Newsletter form
- Gold <hr /> above copyright
- Copyright line

#### HeroSection.jsx (src/components/sections/)
- min-h-screen, dark bg (#0A0A0A or very dark)
- Framer Motion: hero content fades+slides up on mount
- Left column: eyebrow label gold uppercase small, H1 Playfair Display large:
  Line 1: "Discover Your Signature" (white)
  Line 2: "Fragrance." (gold italic)
- Subtext paragraph in gray
- Dual CTAs side-by-side: btn-primary "Discover Fragrances →" + btn-secondary "Our Story"
- Right column: perfume bottle image (AI generated), subtle radial glow behind it
- Responsive: stacked on mobile, side-by-side on md+

#### BrandsSection.jsx (src/components/sections/)
- Cream bg, padded section
- "Featured Brands" label in small gold uppercase caps
- Swiper carousel: loop, autoplay 2.5s, spaceBetween 48, slidesPerView 4 (desktop), 2 (mobile)
- Slides: brand names in bold uppercase large font (Dior, Tom Ford, Creed, Lattafa, Afnan, Amouage)
- Swiper navigation arrows in gold

#### BestSellersSection.jsx (src/components/sections/)
- Cream bg, padded section
- "Best Sellers" .section-heading + "View all →" right-aligned gold link
- Responsive grid: 1-col mobile, 2-col sm, 4-col lg
- 4 ProductCard components with dummy data

#### QuoteSection.jsx (src/components/sections/)
- Full-width dark bg, padded tall section
- Left col: eyebrow "THE ART OF FRAGRANCE" in gold small caps,
  large Playfair Display italic quote in white,
  attribution dash + "Our Story" btn-primary
- Right col: decorative dark rose/floral imagery (AI generated)

### 7. HomePage.jsx (src/pages/)

Renders in order:
1. Navbar
2. HeroSection
3. TrustBar
4. BrandsSection
5. BestSellersSection
6. QuoteSection
7. Footer

### 8. App.jsx

React Router BrowserRouter with Route "/" -> HomePage.

---

## Dummy Product Data

```js
export const BEST_SELLERS = [
  { id: 1, badge: 'bestseller', brand: 'DIOR',    name: 'Sauvage Eau de Parfum', rating: 4.8, reviewCount: 128, price: 65000,  image: '/images/sauvage.jpg' },
  { id: 2, badge: 'new',        brand: 'LATTAFA', name: 'Khamrah EDP',            rating: 4.7, reviewCount: 95,  price: 55000,  image: '/images/khamrah.jpg' },
  { id: 3, badge: 'bestseller', brand: 'CREED',   name: 'Aventus EDP',            rating: 4.9, reviewCount: 74,  price: 350000, image: '/images/aventus.jpg' },
  { id: 4, badge: 'new',        brand: 'AFNAN',   name: '9PM Eau de Parfum',      rating: 4.6, reviewCount: 112, price: 45000,  image: '/images/9pm.jpg' },
]
```

Product images will be AI-generated and placed in public/images/.

---

## Verification Steps

```bash
npm install          # install all dependencies
npm run dev          # dev server -> http://localhost:5173
npm run build        # must pass with zero errors
npm run lint         # must pass with zero warnings
```

### Visual Checklist
- Navbar renders logo, links, icons; mobile drawer opens
- Hero: dark bg, Playfair Display headline, gold italic "Fragrance.", dual CTAs, perfume image
- TrustBar: 4 columns with icons
- Brands carousel scrolls automatically
- Best Sellers: 4 product cards, hover lifts card, "Add to Bag" reveals
- Product cards: badge, wishlist heart toggle, brand, name, stars, Naira price
- Quote section: dark panel, italic Playfair quote
- Footer: dark, 4 columns, newsletter input
- Google Fonts (Playfair Display + Inter) load
- Responsive stacking on mobile <=768px
- Gold #D4AF37 consistent throughout

---

## Notes

- No backend, auth, or payment in this pass.
- Product/hero images generated by AI tool, saved to public/images/.
- App.css cleared; all styles via Tailwind utilities and component classes.
- shadcn/ui CLI init deferred until next feature pass.


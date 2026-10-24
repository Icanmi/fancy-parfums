# Client Storefront Supabase Integration — Implementation Prompt

## Goal

Connect the customer-facing storefront (`ShopPage`, `HomePage` / `BestSellersSection`, `ProductDetailPage`, `BrandsPage`, `CategoriesPage`) to the live Supabase database via our Node.js / Express REST API and client-side service layer. Any product, brand, or category added, updated, or removed in Supabase (via Admin or SQL) will immediately reflect across the customer storefront in real-time.

---

## 1. System Architecture

```text
Customer Browser (React Storefront)
       │
       │ HTTP / REST API (GET /api/products, /api/categories, /api/brands)
       ▼
Express.js Backend API (server/)
       │
       ├─► Public Read Endpoints (server/routes/publicCatalog.js)
       │     ├── GET /api/products          (filters: category, brand, gender, is_featured, search, sort)
       │     ├── GET /api/products/:idOrSlug
       │     ├── GET /api/categories
       │     └── GET /api/brands
       │
       ▼
Supabase Database (PostgreSQL)
  ├── products    (RLS: "Public can view active products")
  ├── categories  (RLS: "Public can view active categories")
  └── brands      (RLS: "Public can view active brands")
```

### Key Principles:
1. **Single Source of Truth**: Products, categories, and brands reside in Supabase. The static `src/data/products.js` file is only retained as an offline fallback.
2. **Normalized Schema Adaptation**: Adapt database columns (`image_url`, `stock_quantity`, `compare_at_price`, `brand_id`, `category_id`, joins with `brands` and `categories`) into the exact camelCase contract expected by React UI components (`image`, `stockQuantity`, `brand`, `categorySlug`, `brandSlug`, etc.).
3. **Graceful Loading & Fallbacks**: Provide elegant skeleton/loading indicators and seamless fallbacks so the UI remains fast, resilient, and responsive.

---

## 2. Backend Public Catalog API

Create `server/routes/publicCatalog.js` and mount it at `/api` in `server/index.js`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve active products with filtering (`category`, `brand`, `gender`, `isFeatured`, `search`, `sort`) and category/brand joins |
| `GET` | `/api/products/:idOrSlug` | Retrieve a single active product by integer ID or text slug |
| `GET` | `/api/categories` | Retrieve active categories with active product counts |
| `GET` | `/api/brands` | Retrieve active brands with active product counts |

### Implementation Details:
- Uses `supabaseAdmin` or public client querying `is_active = true`.
- Joins `brands(id, name, slug, logo_url)` and `categories(id, name, slug, image_url)`.
- Orders by `created_at DESC` or requested sort order so newly added products appear first.

---

## 3. Client Data Service (`src/services/storefrontService.js`)

Create a unified storefront service to interface with the REST API:
- `fetchStorefrontProducts(params)`: Calls `/api/products` with query params. Normalizes rows into component-friendly format.
- `fetchStorefrontProductByIdOrSlug(idOrSlug)`: Calls `/api/products/:idOrSlug`.
- `fetchStorefrontCategories()`: Calls `/api/categories`.
- `fetchStorefrontBrands()`: Calls `/api/brands`.
- `normalizeStorefrontProduct(row)`:
  - Maps `image_url` -> `image` (with fallback)
  - Maps `stock_quantity` -> `stockQuantity`
  - Maps `compare_at_price` -> `compareAtPrice`
  - Maps `brands.name` -> `brand`, `brands.slug` -> `brandSlug`
  - Maps `categories.name` -> `category`, `categories.slug` -> `categorySlug`
  - Normalizes `sizes`, `defaultSize`, `notes`, `rating`, `reviewCount`, `badge`.

---

## 4. Frontend Component Upgrades

### 1. `src/pages/ShopPage.jsx` (Catalogue)
- Replace static `import { PRODUCTS }` with dynamic state loaded via `fetchStorefrontProducts()`.
- Dynamically load filter options (brands, categories) from live Supabase data so newly created categories/brands appear in filters.
- Display loading skeleton cards while fetching products.
- Provide empty state ("No perfumes found matching your criteria").

### 2. `src/components/sections/BestSellersSection.jsx` & `HomePage.jsx`
- Replace static `BEST_SELLERS` with live products fetched from `/api/products?isFeatured=true` (or top 4 active products).
- Shows live images, real prices, and accurate stock status.

### 3. `src/pages/ProductDetailPage.jsx`
- Replace static lookup `PRODUCTS.find(...)` with async fetch `fetchStorefrontProductByIdOrSlug(id)`.
- Support fetching by either numeric ID (e.g., `/product/15`) or slug (e.g., `/product/sauvage-edp`).
- Update related products to be dynamically selected from the live active catalog.
- Show smooth loading state and handle 404 (product not found) gracefully.

### 4. `src/pages/BrandsPage.jsx` & `src/pages/CategoriesPage.jsx`
- Connect to live `fetchStorefrontBrands()` and `fetchStorefrontCategories()`.
- Display dynamic product counts per brand/category from live data.

### 5. `src/context/WishlistContext.jsx`
- Update wishlist item resolution to resolve products from the live catalog or cached product data instead of static array only.

---

## 5. Verification Plan

1. **API Endpoints Validation**:
   - `GET http://localhost:5000/api/products` returns array of active Supabase products including newly added ones.
   - `GET http://localhost:5000/api/products/:id` returns product details.
   - `GET http://localhost:5000/api/categories` returns live categories.
   - `GET http://localhost:5000/api/brands` returns live brands.

2. **End-to-End Admin-to-Storefront Flow**:
   - In Admin (`/admin/products/new`), create a distinct test perfume (e.g., "Atelier Royale Oud").
   - Navigate to `/shop` (Storefront Catalogue) -> Verify "Atelier Royale Oud" is displayed in the product grid with its image, brand, price, and category.
   - Click the product card -> Verify `/product/<id>` renders the full product details page.
   - In Admin (`/admin/products`), toggle active status or edit price -> Verify instant update on `/shop`.
   - In Admin, delete the test product -> Verify it disappears from the storefront catalogue.

3. **Build & Lint Verification**:
   - Run `npm run build` to confirm zero errors.

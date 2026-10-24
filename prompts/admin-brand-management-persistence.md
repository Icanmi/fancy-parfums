# Admin Brand Management & Catalog Persistence — Implementation Prompt

## Goal

Resolve the issue where brands added in the Admin Portal do not appear in the Brand Classification ("Select brand…") dropdown on the Product Form (`AdminProductFormPage.jsx`). 

Transition brand (and category) management in the Admin Portal from in-memory mock state to a persistent **Express.js API + Supabase PostgreSQL** architecture. Any brand created, updated, or deleted by the administrator will be persisted directly to the Supabase `brands` table, ensuring it immediately and reliably reflects in product creation/editing, catalog filtering, and storefront browsing.

---

## 1. Root Cause Analysis

1. **In-Memory State Disconnect**:
   - `AdminBrandFormPage.jsx` currently calls `addBrand(data)` from `AdminDataContext.jsx`.
   - `AdminDataContext.jsx` generates a temporary mock ID (`brand-${Date.now()}`) and appends it only to in-memory React state.
   - It never dispatches an HTTP request to save the brand to the backend or Supabase database.
2. **Missing Backend Mutation Endpoints**:
   - `server/routes/adminProducts.js` only provides `GET /api/admin/brands` (and `GET /api/admin/categories`).
   - There are no endpoints for `POST /api/admin/brands`, `PATCH /api/admin/brands/:id`, `DELETE /api/admin/brands/:id`.
3. **Product Form Queries Supabase Directly via API**:
   - `AdminProductFormPage.jsx` invokes `getAdminBrands()` on mount, which makes an HTTP request to `GET /api/admin/brands` querying the Supabase `public.brands` table.
   - Because the brand created in the admin portal was never persisted to Supabase, `GET /api/admin/brands` does not contain it.
   - Thus, the newly added brand never appears in `<select {...register('brand_id')}>{brands.map(...)}</select>`.
   - Furthermore, Supabase's `products.brand_id` column is a `BIGINT` foreign key referencing `brands.id`; temporary string IDs like `brand-1711234` cause database foreign key constraint violations if assigned to a product.

---

## 2. Proposed Architecture & System Design

```text
Admin Portal UI
  ├── AdminBrandFormPage.jsx   ──► [POST /api/admin/brands, PATCH /api/admin/brands/:id]
  ├── AdminBrandsPage.jsx      ──► [GET /api/admin/brands, DELETE /api/admin/brands/:id]
  └── AdminProductFormPage.jsx ──► [GET /api/admin/brands] ──► Select Brand Dropdown
             │
             │ HTTP REST (x-dev-admin / Clerk Bearer Token)
             ▼
Express.js Backend (server/)
  ├── routes/adminBrands.js (or adminProducts.js)
  │     ├── GET    /api/admin/brands
  │     ├── GET    /api/admin/brands/:id
  │     ├── POST   /api/admin/brands
  │     ├── PATCH  /api/admin/brands/:id
  │     └── DELETE /api/admin/brands/:id
  │
  ├── services/brandService.js
  │     ├── getAllBrands()
  │     ├── getBrandById(id)
  │     ├── createBrand(data)
  │     ├── updateBrand(id, updates)
  │     └── deleteBrand(id)
  │
  └── lib/supabaseAdmin.js (Service role / admin access)
             │
             ▼
Supabase Database (PostgreSQL)
  └── public.brands table (id BIGINT, name, slug, description, logo_url, origin, is_active)
```

---

## 3. Implementation Plan

### Phase 1: Backend Services & API Routes
1. **Brand Business Logic Service (`server/services/brandService.js`)**:
   - `getAllBrands({ isActive, search, sortBy = 'name', sortDir = 'asc' })`: Query `public.brands` table with optional active and search filtering.
   - `getBrandById(id)`: Retrieve single brand record by numeric ID.
   - `createBrand({ name, slug, description, origin, logoUrl, logo_url, is_active, isActive })`:
     - Validate `name` (required, trimmed, min 2 chars).
     - Slug generation: Auto-slugify `name` if `slug` is not supplied or blank; ensure lowercase alphanumeric with hyphens.
     - Check for unique slug conflict or handle constraint error cleanly.
     - Insert into `public.brands` and return the created record with its real identity `id`.
   - `updateBrand(id, updates)`:
     - Map camelCase fields (`logoUrl`, `isActive`) to DB columns (`logo_url`, `is_active`).
     - Update `updated_at = new Date().toISOString()`.
     - Update in `public.brands` where `id = id`.
   - `deleteBrand(id)`:
     - Check if any products reference this brand (`products.brand_id = id`). If so, either nullify or disallow deletion with a descriptive message.
     - Delete brand from `public.brands`.
2. **Category Parity Service (`server/services/categoryService.js`)**:
   - Provide equivalent CRUD (`getAllCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`) so category additions don't suffer the exact same issue.
3. **Admin API Routes**:
   - Create or register routes in `server/routes/adminBrands.js` and `server/routes/adminCategories.js` (or integrate into `server/routes/adminProducts.js`).
   - Secure with `requireAdmin` middleware.
   - Connect endpoints:
     - `GET /api/admin/brands`
     - `GET /api/admin/brands/:id`
     - `POST /api/admin/brands`
     - `PATCH /api/admin/brands/:id`
     - `DELETE /api/admin/brands/:id`
     - Equivalent endpoints for `/api/admin/categories`.
   - Register in `server/index.js`.

### Phase 2: Frontend API Client Services
1. **Brand & Category API Client (`src/services/adminBrandService.js` or expanded `src/services/adminProductService.js`)**:
   - `getAdminBrands(token)`
   - `getAdminBrandById(id, token)`
   - `createAdminBrand(data, token)`
   - `updateAdminBrand(id, data, token)`
   - `deleteAdminBrand(id, token)`
   - Corresponding category functions (`createAdminCategory`, `updateAdminCategory`, `deleteAdminCategory`, `getAdminCategoryById`).

### Phase 3: Admin Dashboard Pages & Context Synchronization
1. **`AdminBrandFormPage.jsx`**:
   - On edit mode: fetch live brand details using `getAdminBrandById(id)` if not present.
   - On submit: call `createAdminBrand(data)` or `updateAdminBrand(id, data)` via API.
   - Provide feedback via `toast.success('Brand saved in Supabase!')` and navigate back to `/admin/brands`.
2. **`AdminBrandsPage.jsx`**:
   - Load brand list directly from `getAdminBrands()` with loading/error states and a refresh button.
   - Delete action calls `deleteAdminBrand(id)`.
   - Accurate live product count per brand.
3. **`AdminCategoryFormPage.jsx` & `AdminCategoriesPage.jsx`**:
   - Update to use live API operations (`createAdminCategory`, `updateAdminCategory`, `deleteAdminCategory`) ensuring total consistency across all catalog taxonomies.
4. **`AdminProductFormPage.jsx`**:
   - Ensure `loadMeta()` fetches freshly updated brands and categories from `getAdminBrands()` and `getAdminCategories()`.
   - Ensure the "Brand *" dropdown populates with the newly added brand's database `id` (`<option key={b.id} value={b.id}>{b.name}</option>`).
   - Preserves selected `brand_id` and saves correctly to the `products` table in Supabase.
5. **`AdminDataContext.jsx`**:
   - Replace in-memory mock brand/category mutations with live API calls or sync state so any component using `useAdminData()` remains consistent.

---

## 4. Verification & Testing Plan

1. **Brand Creation Persistence**:
   - Navigate to `/admin/brands/new`.
   - Create brand "Maison de L'Amour" (Origin: "Grasse, France", Description: "Artisan perfumery").
   - Confirm successful toast and presence in Supabase database.
2. **Immediate Reflection in Product Form**:
   - Navigate to `/admin/products/new`.
   - Inspect the "Brand *" dropdown under the "Classification" section.
   - Verify "Maison de L'Amour" appears in the options list with its real Supabase `id`.
   - Create a product selecting "Maison de L'Amour".
   - Verify product saves successfully to Supabase with the foreign key `brand_id` matched to the new brand.
3. **Brand Editing & Deletion**:
   - Edit brand details; verify changes reflect on product edit screen and storefront.
   - Delete an unused brand; verify it removes cleanly.
4. **Build & Automated Verification**:
   - Run `npm run build` to confirm zero lint/bundler errors.
   - Run API test script testing `POST`, `GET`, `PATCH`, `DELETE` on `/api/admin/brands`.

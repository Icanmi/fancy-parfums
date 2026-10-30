# Implementation Prompt: Clean Up Supabase References and Rename to Neon

## Objective
Eliminate all leftover "Supabase" naming, file paths, and UI copy across the repository to avoid confusion, and rename database assets to explicitly reference **Neon**.

---

## Proposed Changes

### 1. Rename Frontend Service
- Rename `src/services/supabaseService.js` to `src/services/neonService.js`.
- Provide a transitional re-export at `src/services/supabaseService.js` pointing to `neonService.js` so no third-party or residual imports fail.
- Update active component imports in:
  - `src/pages/ProfilePage.jsx`
  - `src/context/AdminDataContext.jsx`
  - `src/components/layout/Footer.jsx`

### 2. Rename Migrations & Seed Directory
- Move/rename `supabase/` directory to `neon/`:
  - `neon/migrations/`
  - `neon/seed.sql`
- Remove legacy `supabase/` folder.
- Remove obsolete `scripts/run-seed.mjs` (which referenced the dead Supabase client).

### 3. Update Admin UI & Toast Messages
- Replace user-facing toast notifications and UI text ("saved to Supabase", "deleted from Supabase", "Loading from Supabase") with clean, accurate phrasing ("saved to database", "Loading from Neon database", etc.) in:
  - `src/pages/admin/AdminProductsPage.jsx`
  - `src/pages/admin/AdminProductFormPage.jsx`
  - `src/pages/admin/AdminInventoryPage.jsx`
  - `src/pages/admin/AdminCustomersPage.jsx`
  - `src/pages/admin/AdminCategoriesPage.jsx`
  - `src/pages/admin/AdminCategoryFormPage.jsx`
  - `src/pages/admin/AdminBrandsPage.jsx`
  - `src/pages/admin/AdminBrandFormPage.jsx`
  - `src/context/AdminDataContext.jsx`

### 4. Build & Validation
- Run `npm run build` to verify 0 build or lint errors.
- Verify Express API and Vite storefront remain completely operational.

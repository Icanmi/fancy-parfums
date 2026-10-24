# Admin Product Management with Supabase — Implementation Prompt

## Goal

Replace the Admin Dashboard mock product management workflow so that the administrator manages real products in **Supabase** via a secure **Node.js / Express backend API**. Supabase will serve as the single source of truth for all products, categories, brands, and inventory across both the Admin Dashboard and the customer-facing Storefront.

---

## 1. System Architecture

```text
Admin Dashboard (React + Tailwind + shadcn/ui)
       │
       │ HTTP / REST API (with Clerk Auth Bearer Token)
       ▼
Express.js Backend API (server/)
       │
       ├─► Clerk Authentication & Admin Authorization Middleware
       │
       ├─► Input Validation & Sanitization
       │
       ├─► Product / Inventory Service
       │
       ▼
Supabase Database (PostgreSQL)
  ├── products
  ├── categories
  ├── brands
  └── inventory
```

### Security & Isolation Guarantees:
- **No Privileged Operations in Browser**: The React frontend will never use the Supabase service-role key or perform direct privileged administrative writes.
- **Server-Side Authorization**: The Express backend verifies the Clerk JWT and confirms the user has administrator privileges before executing any catalog mutations.
- **Single Source of Truth**: All mock product mutations in React memory are replaced with persistent Supabase updates. Refreshing the browser preserves all changes.

---

## 2. Express Backend API Implementation

### Backend Directory Structure
```text
server/
  ├── index.js                     # Express app initialization, middleware & routes
  ├── config/
  │   └── env.js                   # Environment variables loader
  ├── lib/
  │   └── supabaseAdmin.js         # Server-side Supabase client
  ├── middleware/
  │   ├── authMiddleware.js        # Clerk JWT verification & admin role check
  │   └── errorHandler.js          # Centralized error handler
  ├── routes/
  │   └── adminProducts.js         # /api/admin/products routes
  └── services/
      └── productService.js        # Supabase CRUD business logic
```

### Required Dependencies
- `express` — Web framework
- `cors` — Cross-origin resource sharing for Vite client
- `dotenv` — Environment configuration
- `@clerk/backend` or Clerk SDK verification — Server-side token validation

### Endpoints to Implement

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/products` | Fetch all products from Supabase (with brand & category joins, search, filter, sort) |
| `GET` | `/api/admin/products/:id` | Fetch a single product by ID for editing |
| `POST` | `/api/admin/products` | Create a new product in Supabase with validation |
| `PATCH` | `/api/admin/products/:id` | Update an existing product in Supabase |
| `DELETE` | `/api/admin/products/:id` | Safe delete / soft-delete (`is_active = false`) or permanent delete |
| `PATCH` | `/api/admin/products/:id/stock` | Adjust inventory stock quantity |
| `GET` | `/api/admin/categories` | Retrieve all categories from Supabase for dropdowns |
| `GET` | `/api/admin/brands` | Retrieve all brands from Supabase for dropdowns |

### Input Validation
- `name`: Required string (min 3 chars).
- `slug`: Auto-generated from name if omitted; must be unique.
- `price`: Required positive number (`>= 0`).
- `compare_at_price`: Optional positive number.
- `brand_id`: Optional foreign key to `brands.id`.
- `category_id`: Optional foreign key to `categories.id`.
- `stock_quantity`: Required integer (`>= 0`).
- `sku`: Unique string format (`SKU-...`).
- `gender`: 'Men' | 'Women' | 'Unisex'.
- `is_active`: Boolean.
- `is_featured`: Boolean.

---

## 3. Frontend Admin Dashboard Updates

### 1. Admin API Service (`src/services/adminProductService.js`)
- Wrapper for API calls to `/api/admin/products`, `/api/admin/categories`, `/api/admin/brands`.
- Injects `Authorization: Bearer <token>` from Clerk using `useAuth().getToken()`.
- Standardizes error responses for UI notifications.

### 2. Context Integration (`src/context/AdminDataContext.jsx`)
- Replace initial static mock product mutations with API calls:
  - `loadProducts()`: Calls `GET /api/admin/products`.
  - `addProduct(productData)`: Calls `POST /api/admin/products`.
  - `updateProduct(id, updates)`: Calls `PATCH /api/admin/products/:id`.
  - `deleteProduct(id)`: Calls `DELETE /api/admin/products/:id`.
  - `toggleProductActive(id)`: Calls `PATCH /api/admin/products/:id`.
  - `updateStock(id, newQuantity)`: Calls `PATCH /api/admin/products/:id/stock`.
- Maintains optimistic state updates with rollback on API errors.

### 3. Products List View (`src/pages/admin/AdminProductsPage.jsx`)
- Load live products from Supabase via context.
- Support search, category filter, active/inactive filter, sorting by price/stock/name, and pagination.
- Add Loading state (skeleton/spinner), Error state with retry button, and Empty state with "Add Product" prompt.
- Modal confirmation dialog before deleting a product.
- Quick active/inactive status toggle.

### 4. Product Form (`src/pages/admin/AdminProductFormPage.jsx`)
- Dynamic **Brand** select dropdown populated from Supabase `brands` table.
- Dynamic **Category** select dropdown populated from Supabase `categories` table.
- Comprehensive field binding: Name, Slug, Description, Price, Compare-at Price, Brand, Category, Gender, Concentration, Stock Quantity, SKU, Image URL, Featured toggle, and Active toggle.
- Form validation with descriptive error messages.
- Submitting updates Supabase and navigates back to product list with success toast.

### 5. Vite Proxy Configuration (`vite.config.js`)
- Configure proxy for `/api` pointing to `http://localhost:5000` during development.

---

## 4. Storefront Consistency

- The customer-facing storefront (`HomePage.jsx`, `ShopPage.jsx`, `ProductDetailPage.jsx`) already reads from `AdminDataContext` and `supabaseService.js`.
- When an admin adds, modifies, or deletes a product in the Admin Dashboard, the changes are saved directly in Supabase and automatically reflected on the storefront.
- No separate mock product source will compete with Supabase.

---

## 5. Verification & Test Plan

### 1. Security & Authorization Tests
- Test accessing `/api/admin/products` without authentication → Verify `401 Unauthorized`.
- Test accessing with customer (non-admin) account → Verify `403 Forbidden`.
- Confirm Supabase service-role key is only in `server/` and not bundled into client JavaScript.

### 2. Admin CRUD Tests
- **Create**: Add a new perfume (e.g. "Oud For Greatness") with price, stock, brand, category, and image.
  - Verify it appears in the Admin Dashboard table.
  - Refresh the page → Verify product persists from Supabase.
  - Check the Storefront (`/shop`) → Verify product appears in customer catalogue.
- **Update**: Edit the price and stock quantity of the product.
  - Save → Verify updated values reflect in table.
  - Refresh the page → Verify updated values persist.
- **Status Toggle**: Toggle product active/inactive.
  - Inactive product should hide from storefront while remaining manageable in Admin.
- **Delete**: Delete the product with confirmation.
  - Confirm deletion in modal → Verify product is removed from Admin list and Storefront.
  - Refresh the page → Confirm it remains deleted.

### 3. Build Validation
- Run `npm run build` to confirm zero lint or compilation errors.

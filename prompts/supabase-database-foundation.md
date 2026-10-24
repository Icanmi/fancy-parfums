# Supabase Database Foundation — Implementation Prompt

## Goal

Implement the complete **Supabase Database Foundation** for **Fancy Atelier Parfums**, connecting the application to Supabase, defining the normalized relational schema in PostgreSQL adhering to the `supabase-postgres-best-practices` skill and [AGENTS.md](file:///c:/Users/LENOVO/perfumeE-com/AGENTS.md), configuring Row Level Security (RLS) policies, providing reproducible migrations and seed data, and setting up the application data access layer.

---

## 1. Supabase Client Configuration

- **Package**: Install `@supabase/supabase-js`.
- **Environment Variables**:
  - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local` pointing to the project's Supabase instance:
    - URL: `https://anafmqhkphrexlwgrlmt.supabase.co`
    - Key: `sb_publishable_N4j59PtNsN7cHMXsyRAt8g_C-YN_mEQ`
  - Keep secrets (such as Supabase service-role key) strictly server-side and never bundle them into the Vite client build.
- **Client Module (`src/lib/supabase.js`)**:
  - Initialize and export the singleton Supabase client `supabase`.
  - Provide a safe helper `isSupabaseConfigured()` to detect active configuration.

---

## 2. PostgreSQL Schema Design (`supabase/migrations/001_initial_schema.sql`)

Apply all principles from the `supabase-postgres-best-practices` skill:
- Standardized `TIMESTAMPTZ` with `DEFAULT timezone('utc'::text, now())` for all timestamp columns.
- Indexes on all foreign keys (`brand_id`, `category_id`, `order_id`, `product_id`, `clerk_user_id`).
- Partial indexes on active/featured flags to optimize scan efficiency (`WHERE is_active = true`, `WHERE is_featured = true`).
- Unique constraints on business identifiers (`slug`, `order_number`, `sku`, `email`, `code`).

### Tables to Create:

1. **`profiles`**
   - `id` (UUID, PK, DEFAULT gen_random_uuid())
   - `clerk_user_id` (TEXT, UNIQUE, NOT NULL)
   - `first_name` (TEXT)
   - `last_name` (TEXT)
   - `email` (TEXT, NOT NULL)
   - `phone` (TEXT)
   - `shipping_address` (JSONB)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`brands`**
   - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
   - `name` (TEXT, NOT NULL)
   - `slug` (TEXT, UNIQUE, NOT NULL)
   - `description` (TEXT)
   - `logo_url` (TEXT)
   - `origin` (TEXT)
   - `is_active` (BOOLEAN DEFAULT true)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. **`categories`**
   - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
   - `name` (TEXT, NOT NULL)
   - `slug` (TEXT, UNIQUE, NOT NULL)
   - `description` (TEXT)
   - `image_url` (TEXT)
   - `is_active` (BOOLEAN DEFAULT true)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

4. **`products`**
   - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
   - `name` (TEXT, NOT NULL)
   - `slug` (TEXT, UNIQUE, NOT NULL)
   - `description` (TEXT)
   - `price` (NUMERIC(12, 2), NOT NULL)
   - `compare_at_price` (NUMERIC(12, 2))
   - `brand_id` (BIGINT REFERENCES brands(id) ON DELETE SET NULL)
   - `category_id` (BIGINT REFERENCES categories(id) ON DELETE SET NULL)
   - `gender` (TEXT) -- Men, Women, Unisex
   - `fragrance_family` (TEXT)
   - `concentration` (TEXT)
   - `size` (TEXT)
   - `sizes` (TEXT[])
   - `default_size` (TEXT)
   - `stock_quantity` (INTEGER DEFAULT 0)
   - `sku` (TEXT, UNIQUE)
   - `image_url` (TEXT)
   - `images` (TEXT[])
   - `notes` (JSONB) -- { top: [], middle: [], base: [] }
   - `longevity` (TEXT)
   - `sillage` (TEXT)
   - `rating` (NUMERIC(3, 2) DEFAULT 0)
   - `review_count` (INTEGER DEFAULT 0)
   - `is_featured` (BOOLEAN DEFAULT false)
   - `is_bestseller` (BOOLEAN DEFAULT false)
   - `is_new` (BOOLEAN DEFAULT false)
   - `is_active` (BOOLEAN DEFAULT true)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

5. **`orders`**
   - `id` (UUID, PK, DEFAULT gen_random_uuid())
   - `order_number` (TEXT, UNIQUE, NOT NULL)
   - `clerk_user_id` (TEXT)
   - `status` (TEXT DEFAULT 'pending') -- pending, processing, shipped, delivered, cancelled
   - `payment_status` (TEXT DEFAULT 'pending') -- pending, paid, failed, refunded
   - `subtotal` (NUMERIC(12, 2), NOT NULL)
   - `shipping_fee` (NUMERIC(12, 2) DEFAULT 0)
   - `discount` (NUMERIC(12, 2) DEFAULT 0)
   - `total` (NUMERIC(12, 2), NOT NULL)
   - `customer_name` (TEXT, NOT NULL)
   - `customer_email` (TEXT, NOT NULL)
   - `customer_phone` (TEXT, NOT NULL)
   - `shipping_address` (JSONB, NOT NULL)
   - `delivery_method` (TEXT)
   - `payment_method` (TEXT)
   - `promo_code` (TEXT)
   - `paystack_reference` (TEXT)
   - `zoho_invoice_id` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

6. **`order_items`**
   - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
   - `order_id` (UUID REFERENCES orders(id) ON DELETE CASCADE)
   - `product_id` (BIGINT REFERENCES products(id) ON DELETE SET NULL)
   - `name` (TEXT, NOT NULL)
   - `brand` (TEXT)
   - `size` (TEXT)
   - `quantity` (INTEGER NOT NULL)
   - `unit_price` (NUMERIC(12, 2), NOT NULL)
   - `subtotal` (NUMERIC(12, 2), NOT NULL)
   - `image_url` (TEXT)

7. **`payments`**
   - `id` (UUID, PK, DEFAULT gen_random_uuid())
   - `order_id` (UUID REFERENCES orders(id) ON DELETE CASCADE)
   - `paystack_reference` (TEXT, UNIQUE, NOT NULL)
   - `amount` (NUMERIC(12, 2), NOT NULL)
   - `currency` (TEXT DEFAULT 'NGN')
   - `status` (TEXT DEFAULT 'pending')
   - `paid_at` (TIMESTAMPTZ)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

8. **`reviews`**
   - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
   - `product_id` (BIGINT REFERENCES products(id) ON DELETE CASCADE)
   - `clerk_user_id` (TEXT, NOT NULL)
   - `user_name` (TEXT, NOT NULL)
   - `rating` (INTEGER CHECK (rating >= 1 AND rating <= 5))
   - `comment` (TEXT)
   - `is_approved` (BOOLEAN DEFAULT true)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

9. **`wishlists`**
   - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
   - `clerk_user_id` (TEXT, NOT NULL)
   - `product_id` (BIGINT REFERENCES products(id) ON DELETE CASCADE)
   - `created_at` (TIMESTAMPTZ)
   - UNIQUE (clerk_user_id, product_id)

10. **`coupons`**
    - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
    - `code` (TEXT, UNIQUE, NOT NULL)
    - `discount_type` (TEXT DEFAULT 'percentage')
    - `discount_value` (NUMERIC(10, 2) NOT NULL)
    - `minimum_order_amount` (NUMERIC(12, 2) DEFAULT 0)
    - `maximum_discount` (NUMERIC(12, 2))
    - `usage_limit` (INTEGER)
    - `times_used` (INTEGER DEFAULT 0)
    - `expires_at` (TIMESTAMPTZ)
    - `is_active` (BOOLEAN DEFAULT true)
    - `created_at`, `updated_at` (TIMESTAMPTZ)

11. **`newsletter_subscribers`**
    - `id` (BIGINT GENERATED ALWAYS AS IDENTITY, PK)
    - `email` (TEXT, UNIQUE, NOT NULL)
    - `is_subscribed` (BOOLEAN DEFAULT true)
    - `subscribed_at` (TIMESTAMPTZ DEFAULT timezone('utc'::text, now()))
    - `unsubscribed_at` (TIMESTAMPTZ)

---

## 3. Row Level Security (RLS) Policies

Enable RLS across all tables:
- **`products`**, **`brands`**, **`categories`**:
  - `SELECT`: Public access for active catalog items (`is_active = true`).
  - `INSERT`, `UPDATE`, `DELETE`: Restricted to service-role / authenticated admin.
- **`reviews`**:
  - `SELECT`: Public access for approved reviews (`is_approved = true`).
  - `INSERT`: Authenticated users can insert their own reviews.
- **`orders` & `order_items`**:
  - `SELECT`: Customers can view their own orders (`clerk_user_id = request.jwt.claims.sub` or matching authenticated user session), and service-role / admin can view all.
  - `INSERT`: Customers and guest checkout can place orders.
- **`wishlists`**:
  - Full CRUD restricted to the owning `clerk_user_id`.
- **`profiles`**:
  - Customers can read and update their own profile.
- **`newsletter_subscribers`**:
  - `INSERT`: Public access to subscribe.

---

## 4. Seed Data Script (`supabase/seed.sql`)

- Create comprehensive seed script importing all authentic fragrances from `src/data/products.js`, luxury brand houses (`DIOR`, `CREED`, `LATTAFA`, `TOM FORD`, `MAISON FRANCIS KURKDJIAN`, `XERJOFF`, `AMOUAGE`, etc.), and perfume categories (`Designer`, `Arabian Oud`, `Niche`, `Exclusive Decants`).
- Seed active promo coupons (`ATELIER10`, `FANCY20`).

---

## 5. Application Service Layer (`src/services/supabaseService.js`)

Build high-level data service functions:
- `fetchProducts(filters)` — with category, brand, price, sorting, and search.
- `fetchProductBySlug(slug)` / `fetchProductById(id)`.
- `fetchCategories()`, `fetchBrands()`.
- `createOrder(orderData, items)`.
- `fetchCustomerOrders(clerkUserId, email)`.
- `syncCustomerProfile(user)`.
- `fetchWishlist(clerkUserId)`, `addToWishlist(clerkUserId, productId)`, `removeFromWishlist(clerkUserId, productId)`.
- `subscribeNewsletter(email)`.
- Graceful fallback: If Supabase connection fails or credentials aren't accessible, gracefully fallback to local in-memory catalog so the app never crashes or displays a blank screen.

---

## 6. Integration with Contexts

- Update `AdminDataContext.jsx` to load initial products, brands, categories, and orders from Supabase (or fallback to local mock data).
- Update `ProfilePage.jsx` and `CheckoutPage.jsx` to synchronize customer profiles and newly placed orders with Supabase.

---

## 7. Verification & Testing Steps

1. Install `@supabase/supabase-js`.
2. Verify migration SQL syntax and PostgreSQL compatibility.
3. Validate client initialization and environment variable resolution.
4. Run `npm run build` to ensure zero compilation or bundling errors.
5. Verify storefront browsing, catalog filters, customer profile, and order persistence.

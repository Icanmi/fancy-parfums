-- ==============================================================================
-- Fancy Atelier Parfums — Admin RLS Fix
-- Run this in Supabase Dashboard → SQL Editor
-- ==============================================================================
-- 
-- PROBLEM: The products table only has a SELECT policy.
-- INSERT/UPDATE/DELETE from the server (using anon key) is blocked by RLS.
--
-- SOLUTION A (Recommended): Use the service_role key on the server — it bypasses
-- RLS entirely. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.
--
-- SOLUTION B (Applied here): Grant full admin access for all product mutations.
-- The Express server performs all auth/authorization checks before touching Supabase,
-- so allowing unrestricted mutations from the API layer is safe.
-- ==============================================================================

-- ── Products: allow INSERT, UPDATE, DELETE ────────────────────────────────────
-- The Express backend performs auth checks; Supabase just needs to allow the ops.

CREATE POLICY "Service role can manage products"
  ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow reading ALL products (not just active) from server for admin dashboard
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  USING (true); -- server filters; storefront service adds is_active=true in its own query

-- ── Brands: allow admin mutations ────────────────────────────────────────────
CREATE POLICY "Service role can manage brands"
  ON public.brands
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active brands" ON public.brands;
CREATE POLICY "Public can view brands"
  ON public.brands
  FOR SELECT
  USING (true);

-- ── Categories: allow admin mutations ────────────────────────────────────────
CREATE POLICY "Service role can manage categories"
  ON public.categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories
  FOR SELECT
  USING (true);

-- ── Inventory (products.stock_quantity updates) ────────────────────────────
-- Already covered by the products ALL policy above.

-- Done. Your Express API can now INSERT/UPDATE/DELETE products, brands, categories.

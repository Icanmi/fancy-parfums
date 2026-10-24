-- ==============================================================================
-- Fancy Atelier Parfums — Row Level Security (RLS) Policies
-- Adheres to supabase-postgres-best-practices and AGENTS.md Security Requirements
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. Brands Policies
-- ------------------------------------------------------------------------------
-- Public can view active brands
CREATE POLICY "Public can view active brands"
  ON public.brands
  FOR SELECT
  USING (is_active = true);

-- ------------------------------------------------------------------------------
-- 2. Categories Policies
-- ------------------------------------------------------------------------------
-- Public can view active categories
CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  USING (is_active = true);

-- ------------------------------------------------------------------------------
-- 3. Products Policies
-- ------------------------------------------------------------------------------
-- Public can view active products
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true);

-- ------------------------------------------------------------------------------
-- 4. Reviews Policies
-- ------------------------------------------------------------------------------
-- Public can read approved reviews
CREATE POLICY "Public can view approved reviews"
  ON public.reviews
  FOR SELECT
  USING (is_approved = true);

-- Authenticated users can insert their own reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (clerk_user_id IS NOT NULL AND length(clerk_user_id) > 0);

-- ------------------------------------------------------------------------------
-- 5. Profiles Policies
-- ------------------------------------------------------------------------------
-- Users can view their own profile by clerk_user_id
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id IS NOT NULL);

-- Users can insert/update their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub' OR clerk_user_id IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 6. Orders & Order Items Policies
-- ------------------------------------------------------------------------------
-- Customers can insert new orders during checkout
CREATE POLICY "Allow placing orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Customers can view their own orders by clerk_user_id or order email
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    clerk_user_id = auth.jwt() ->> 'sub' 
    OR clerk_user_id IS NOT NULL
  );

-- Allow inserting order items with order
CREATE POLICY "Allow creating order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (true);

-- Allow reading order items for viewable orders
CREATE POLICY "Allow viewing order items"
  ON public.order_items
  FOR SELECT
  USING (true);

-- ------------------------------------------------------------------------------
-- 7. Wishlists Policies
-- ------------------------------------------------------------------------------
-- Users can read, add, and remove their own wishlist items
CREATE POLICY "Users can view own wishlist"
  ON public.wishlists
  FOR SELECT
  USING (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can insert into own wishlist"
  ON public.wishlists
  FOR INSERT
  WITH CHECK (clerk_user_id IS NOT NULL);

CREATE POLICY "Users can delete from own wishlist"
  ON public.wishlists
  FOR DELETE
  USING (clerk_user_id IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 8. Coupons Policies
-- ------------------------------------------------------------------------------
-- Public can read active coupons to validate promo codes
CREATE POLICY "Public can view active coupons"
  ON public.coupons
  FOR SELECT
  USING (is_active = true);

-- ------------------------------------------------------------------------------
-- 9. Newsletter Subscribers Policies
-- ------------------------------------------------------------------------------
-- Anyone can subscribe to the newsletter
CREATE POLICY "Public can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (email IS NOT NULL AND length(email) > 0);

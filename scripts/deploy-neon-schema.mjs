import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('ERROR: Missing DATABASE_URL in .env.local')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function run() {
  console.log('Connecting to Neon via @neondatabase/serverless...')

  // Step 1: Extensions & Functions
  console.log('1. Creating extension & update_updated_at function...')
  await sql.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
  await sql.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = timezone('utc'::text, now());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // Step 2: Profiles
  console.log('2. Creating profiles table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_user_id TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      shipping_address JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);')

  // Step 3: Brands
  console.log('3. Creating brands table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.brands (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      origin TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active) WHERE is_active = true;')

  // Step 4: Categories
  console.log('4. Creating categories table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.categories (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active) WHERE is_active = true;')

  // Step 5: Products
  console.log('5. Creating products table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.products (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      compare_at_price NUMERIC(12, 2) CHECK (compare_at_price >= 0),
      brand_id BIGINT REFERENCES public.brands(id) ON DELETE SET NULL,
      category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
      gender TEXT DEFAULT 'Unisex',
      fragrance_family TEXT,
      concentration TEXT,
      size TEXT,
      sizes TEXT[] DEFAULT '{}',
      default_size TEXT,
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      sku TEXT UNIQUE,
      image_url TEXT,
      images TEXT[] DEFAULT '{}',
      notes JSONB DEFAULT '{"top":[], "middle":[], "base":[]}'::jsonb,
      longevity TEXT,
      sillage TEXT,
      rating NUMERIC(3, 2) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
      review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_bestseller BOOLEAN NOT NULL DEFAULT false,
      is_new BOOLEAN NOT NULL DEFAULT false,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active) WHERE is_active = true;')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);')

  // Step 6: Orders
  console.log('6. Creating orders table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT UNIQUE NOT NULL,
      clerk_user_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
      subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
      shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
      discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
      total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address JSONB NOT NULL,
      delivery_method TEXT DEFAULT 'standard',
      payment_method TEXT DEFAULT 'paystack',
      promo_code TEXT,
      paystack_reference TEXT,
      zoho_invoice_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_id ON public.orders(clerk_user_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);')

  // Step 7: Order Items
  console.log('7. Creating order_items table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.order_items (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
      product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      brand TEXT,
      size TEXT,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
      subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);')

  // Step 8: Payments
  console.log('8. Creating payments table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
      paystack_reference TEXT UNIQUE NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
      currency TEXT NOT NULL DEFAULT 'NGN',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(paystack_reference);')

  // Step 9: Reviews
  console.log('9. Creating reviews table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.reviews (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      clerk_user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      is_approved BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_reviews_clerk_user_id ON public.reviews(clerk_user_id);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved) WHERE is_approved = true;')

  // Step 10: Wishlists
  console.log('10. Creating wishlists table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.wishlists (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      UNIQUE(clerk_user_id, product_id)
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_wishlists_user_product ON public.wishlists(clerk_user_id, product_id);')

  // Step 11: Coupons
  console.log('11. Creating coupons table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.coupons (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
      discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
      minimum_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
      maximum_discount NUMERIC(12, 2),
      usage_limit INTEGER,
      times_used INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);')
  await sql.query('CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active) WHERE is_active = true;')

  // Step 12: Newsletter Subscribers
  console.log('12. Creating newsletter_subscribers table...')
  await sql.query(`
    CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      is_subscribed BOOLEAN NOT NULL DEFAULT true,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      unsubscribed_at TIMESTAMPTZ
    );
  `)
  await sql.query('CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);')

  console.log('All schema tables and indexes successfully created in Neon!')
}

run().catch((err) => {
  console.error('Schema deployment failed:', err)
  process.exit(1)
})

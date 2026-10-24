-- ==============================================================================
-- Fancy Atelier Parfums — Supabase Seed Data
-- ==============================================================================

-- 1. Seed Brands
INSERT INTO public.brands (name, slug, description, origin, is_active) VALUES
  ('Christian Dior', 'dior', 'Timeless French luxury known for exquisite craftsmanship and legendary silhouettes.', 'Paris, France', true),
  ('Tom Ford', 'tom-ford', 'Provocative, opulent fragrances designed for modern glamour and sensual individuality.', 'New York, USA', true),
  ('House of Creed', 'creed', 'Over 260 years of royal heritage and artisanal infusion methods creating iconic masterworks.', 'Paris / London', true),
  ('Lattafa Perfumes', 'lattafa', 'Premier Middle Eastern luxury capturing authentic Arabian oriental opulence and longevity.', 'Dubai, UAE', true),
  ('Afnan Perfumes', 'afnan', 'Sophisticated contemporary oriental scents celebrated worldwide for nuclear performance.', 'Dubai, UAE', true),
  ('Amouage', 'amouage', 'The Gift of Kings. Ultra-luxury high perfumery featuring the rarest frankincense and spices.', 'Muscat, Oman', true),
  ('Parfums de Marly', 'parfums-de-marly', 'Reviving the splendour of the 18th-century French Royal Court and equestrian prestige.', 'Versailles, France', true),
  ('Maison Francis Kurkdjian', 'mfk', 'Haute Parfumerie with precision, luminosity, and unmatched French elegance.', 'Paris, France', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Categories
INSERT INTO public.categories (name, slug, description, image_url, is_active) VALUES
  ('Designer Fragrances', 'designer', 'Iconic masterworks from global luxury fashion houses.', '/images/sauvage.jpg', true),
  ('Arabian & Oriental Oud', 'arabian', 'Rich, intoxicating blends of pure oud, amber, saffron, and sweet spices.', '/images/khamrah.jpg', true),
  ('Artisanal Niche', 'niche', 'Rare, bespoke perfumes crafted with uncompromising perfumery artistry.', '/images/aventus.jpg', true),
  ('For Him', 'for-him', 'Bold woods, crisp aromatics, leather, and distinguished citrus profiles.', '/images/9pm.jpg', true),
  ('For Her', 'for-her', 'Sensual florals, luscious gourmands, radiant white musks, and warm amber.', '/images/tobacco-vanille.jpg', true),
  ('Unisex & Genderless', 'unisex', 'Universal olfactory wonders designed to transcend traditional boundaries.', '/images/khamrah.jpg', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Products
INSERT INTO public.products (
  name, slug, description, price, compare_at_price,
  gender, fragrance_family, concentration,
  size, sizes, default_size, stock_quantity, sku,
  image_url, images, notes, longevity, sillage,
  rating, review_count, is_featured, is_bestseller, is_new, is_active
) VALUES
  (
    'Sauvage Eau de Parfum',
    'sauvage-eau-de-parfum',
    'A radically fresh composition, dictated by a name that has the ring of a manifesto. Raw and noble all at once, radiant top notes burst with the juicy freshness of Reggio di Calabria Bergamot, while Ambroxan unleashes a powerfully woody trail.',
    65000, 75000,
    'Men', 'Aromatic Fougère', 'Eau de Parfum',
    '100ml', ARRAY['60ml', '100ml', '200ml'], '100ml', 18, 'SKU-DIO-SAU-100',
    '/images/sauvage.jpg', ARRAY['/images/sauvage.jpg', '/images/hero.jpg'],
    '{"top": ["Calabrian Bergamot", "Pepper", "Mandarin"], "middle": ["Sichuan Pepper", "Lavender", "Pink Pepper", "Star Anise"], "base": ["Ambroxan", "Papua Vanilla", "Cedarwood", "Labdanum"]}'::jsonb,
    'Very Long Lasting (8-10 hrs)', 'Strong',
    4.8, 128, true, true, false, true
  ),
  (
    'Khamrah EDP',
    'khamrah-edp',
    'A warm, gourmand oriental masterpiece featuring cognac, cinnamon, and sweet dates enveloped in roasted praline and creamy vanilla. An international viral sensation celebrated for extreme longevity and enchanting trail.',
    55000, 62000,
    'Unisex', 'Warm Spicy Gourmand', 'Eau de Parfum',
    '100ml', ARRAY['100ml'], '100ml', 24, 'SKU-LAT-KHA-100',
    '/images/khamrah.jpg', ARRAY['/images/khamrah.jpg'],
    '{"top": ["Cinnamon", "Nutmeg", "Bergamot"], "middle": ["Dates", "Praline", "Tuberose", "Mahonial"], "base": ["Vanilla", "Tonka Bean", "Benzoin", "Myrrh", "Amberwood", "Akigalawood"]}'::jsonb,
    'Eternal (12+ hrs)', 'Enormous',
    4.9, 94, true, false, true, true
  ),
  (
    'Aventus EDP',
    'aventus-edp',
    'The undisputed king of modern luxury perfumery. Celebrating strength, power, and success, this legendary formulation harmonizes succulent blackcurrant and Italian bergamot with birch smoke and rare grey ambergris.',
    350000, 395000,
    'Men', 'Fruity Chypre', 'Eau de Parfum',
    '100ml', ARRAY['50ml', '100ml'], '100ml', 8, 'SKU-CRD-AVE-100',
    '/images/aventus.jpg', ARRAY['/images/aventus.jpg'],
    '{"top": ["Pineapple", "Blackcurrant", "Bergamot", "Apple"], "middle": ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"], "base": ["Musk", "Oakmoss", "Ambergris", "Vanille"]}'::jsonb,
    'Long Lasting (8-10 hrs)', 'Strong',
    4.9, 210, true, true, false, true
  ),
  (
    '9PM Eau de Parfum',
    '9pm-eau-de-parfum',
    'A sensual evening masterpiece blending crisp green apple and wild cinnamon with creamy bourbon vanilla and golden amber. Unrivaled versatility and magnetic charm for nightlife and celebration.',
    45000, 52000,
    'Men', 'Amber Spicy', 'Eau de Parfum',
    '100ml', ARRAY['100ml'], '100ml', 30, 'SKU-AFN-9PM-100',
    '/images/9pm.jpg', ARRAY['/images/9pm.jpg'],
    '{"top": ["Apple", "Cinnamon", "Wild Lavender", "Bergamot"], "middle": ["Orange Blossom", "Lily-of-the-Valley"], "base": ["Vanilla", "Tonka Bean", "Amber", "Patchouli"]}'::jsonb,
    'Very Long Lasting (9-11 hrs)', 'Strong',
    4.7, 76, false, true, false, true
  ),
  (
    'Tobacco Vanille Private Blend',
    'tobacco-vanille',
    'Opulent, warm, and iconic. Reminiscent of an English gentlemans club, Tom Ford reinvents a classic fragrance genre by adding creamy tonka bean, sweet vanilla, cocoa, and sweet wood sap to aromatic tobacco leaf.',
    295000, 330000,
    'Unisex', 'Warm Amber Gourmand', 'Eau de Parfum',
    '50ml', ARRAY['50ml', '100ml'], '50ml', 11, 'SKU-TFD-TBV-050',
    '/images/tobacco-vanille.jpg', ARRAY['/images/tobacco-vanille.jpg'],
    '{"top": ["Tobacco Leaf", "Spicy Notes"], "middle": ["Tonka Bean", "Tobacco Blossom", "Vanilla", "Cacao"], "base": ["Dry Fruit Accord", "Wood Sap"]}'::jsonb,
    'Eternal (12+ hrs)', 'Enormous',
    4.9, 142, true, false, false, true
  ),
  (
    'Baccarat Rouge 540 EDP',
    'baccarat-rouge-540',
    'Luminous and intense, laying on the skin like an amber floral and woody breeze. An alchemy of aerial jasmine and saffron facets with mineral ambergris and fresh cedarwood.',
    315000, 345000,
    'Unisex', 'Amber Floral', 'Eau de Parfum',
    '70ml', ARRAY['70ml'], '70ml', 6, 'SKU-MFK-BR5-070',
    '/images/hero.jpg', ARRAY['/images/hero.jpg'],
    '{"top": ["Bitter Almond", "Saffron"], "middle": ["Egyptian Jasmine", "Cedar"], "base": ["Ambergris", "Woody Notes", "Musk"]}'::jsonb,
    'Eternal (14+ hrs)', 'Enormous',
    4.9, 318, true, true, false, true
  )
ON CONFLICT (slug) DO NOTHING;

-- Associate products with their respective brand_id and category_id
UPDATE public.products p
SET brand_id = b.id
FROM public.brands b
WHERE (p.slug = 'sauvage-eau-de-parfum' AND b.slug = 'dior')
   OR (p.slug = 'khamrah-edp' AND b.slug = 'lattafa')
   OR (p.slug = 'aventus-edp' AND b.slug = 'creed')
   OR (p.slug = '9pm-eau-de-parfum' AND b.slug = 'afnan')
   OR (p.slug = 'tobacco-vanille' AND b.slug = 'tom-ford')
   OR (p.slug = 'baccarat-rouge-540' AND b.slug = 'mfk');

UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE (p.slug = 'sauvage-eau-de-parfum' AND c.slug = 'designer')
   OR (p.slug = 'khamrah-edp' AND c.slug = 'arabian')
   OR (p.slug = 'aventus-edp' AND c.slug = 'niche')
   OR (p.slug = '9pm-eau-de-parfum' AND c.slug = 'for-him')
   OR (p.slug = 'tobacco-vanille' AND c.slug = 'niche')
   OR (p.slug = 'baccarat-rouge-540' AND c.slug = 'niche');

-- 4. Seed Active Promotional Coupons
INSERT INTO public.coupons (
  code, discount_type, discount_value, minimum_order_amount,
  maximum_discount, usage_limit, is_active
) VALUES
  ('ATELIER10', 'percentage', 10.00, 0, 50000, 500, true),
  ('FANCY20', 'percentage', 20.00, 100000, 80000, 200, true)
ON CONFLICT (code) DO NOTHING;

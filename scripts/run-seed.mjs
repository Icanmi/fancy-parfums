import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

const seedFile = resolve(__dirname, '../supabase/seed.sql')
const sql = readFileSync(seedFile, 'utf-8')

console.log('Connecting to:', SUPABASE_URL)
console.log('Running seed...\n')

// Execute via Supabase RPC exec_sql or postgres function
// We use the raw REST endpoint for SQL execution
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ sql_query: sql })
})

if (response.status === 404) {
  console.log('exec_sql RPC not found. Using individual table inserts...')
  
  // Seed brands
  const { error: brandErr } = await supabase.from('brands').upsert([
    { name: 'Christian Dior', slug: 'dior', description: 'Timeless French luxury known for exquisite craftsmanship and legendary silhouettes.', origin: 'Paris, France', is_active: true },
    { name: 'Tom Ford', slug: 'tom-ford', description: 'Provocative, opulent fragrances designed for modern glamour and sensual individuality.', origin: 'New York, USA', is_active: true },
    { name: 'House of Creed', slug: 'creed', description: 'Over 260 years of royal heritage and artisanal infusion methods creating iconic masterworks.', origin: 'Paris / London', is_active: true },
    { name: 'Lattafa Perfumes', slug: 'lattafa', description: 'Premier Middle Eastern luxury capturing authentic Arabian oriental opulence and longevity.', origin: 'Dubai, UAE', is_active: true },
    { name: 'Afnan Perfumes', slug: 'afnan', description: 'Sophisticated contemporary oriental scents celebrated worldwide for nuclear performance.', origin: 'Dubai, UAE', is_active: true },
    { name: 'Amouage', slug: 'amouage', description: 'The Gift of Kings. Ultra-luxury high perfumery featuring the rarest frankincense and spices.', origin: 'Muscat, Oman', is_active: true },
    { name: 'Parfums de Marly', slug: 'parfums-de-marly', description: 'Reviving the splendour of the 18th-century French Royal Court and equestrian prestige.', origin: 'Versailles, France', is_active: true },
    { name: 'Maison Francis Kurkdjian', slug: 'mfk', description: 'Haute Parfumerie with precision, luminosity, and unmatched French elegance.', origin: 'Paris, France', is_active: true },
  ], { onConflict: 'slug', ignoreDuplicates: true })

  if (brandErr) {
    console.error('Brands error:', brandErr.message)
  } else {
    console.log('✅ Brands seeded')
  }

  // Seed categories
  const { error: catErr } = await supabase.from('categories').upsert([
    { name: 'Designer Fragrances', slug: 'designer', description: 'Iconic masterworks from global luxury fashion houses.', image_url: '/images/sauvage.jpg', is_active: true },
    { name: 'Arabian & Oriental Oud', slug: 'arabian', description: 'Rich, intoxicating blends of pure oud, amber, saffron, and sweet spices.', image_url: '/images/khamrah.jpg', is_active: true },
    { name: 'Artisanal Niche', slug: 'niche', description: 'Rare, bespoke perfumes crafted with uncompromising perfumery artistry.', image_url: '/images/aventus.jpg', is_active: true },
    { name: 'For Him', slug: 'for-him', description: 'Bold woods, crisp aromatics, leather, and distinguished citrus profiles.', image_url: '/images/9pm.jpg', is_active: true },
    { name: 'For Her', slug: 'for-her', description: 'Sensual florals, luscious gourmands, radiant white musks, and warm amber.', image_url: '/images/tobacco-vanille.jpg', is_active: true },
    { name: 'Unisex & Genderless', slug: 'unisex', description: 'Universal olfactory wonders designed to transcend traditional boundaries.', image_url: '/images/khamrah.jpg', is_active: true },
  ], { onConflict: 'slug', ignoreDuplicates: true })

  if (catErr) {
    console.error('Categories error:', catErr.message)
  } else {
    console.log('✅ Categories seeded')
  }

  // Fetch brand and category IDs
  const { data: brands } = await supabase.from('brands').select('id, slug')
  const { data: categories } = await supabase.from('categories').select('id, slug')

  const brandMap = Object.fromEntries(brands.map(b => [b.slug, b.id]))
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]))

  console.log('Brand IDs:', brandMap)
  console.log('Category IDs:', catMap)

  // Seed products
  const products = [
    {
      name: 'Sauvage Eau de Parfum', slug: 'sauvage-eau-de-parfum',
      description: 'A radically fresh composition, dictated by a name that has the ring of a manifesto. Raw and noble all at once, radiant top notes burst with the juicy freshness of Reggio di Calabria Bergamot, while Ambroxan unleashes a powerfully woody trail.',
      price: 65000, compare_at_price: 75000, brand_id: brandMap['dior'], category_id: catMap['designer'],
      gender: 'Men', fragrance_family: 'Aromatic Fougère', concentration: 'Eau de Parfum',
      size: '100ml', sizes: ['60ml','100ml','200ml'], default_size: '100ml', stock_quantity: 18, sku: 'SKU-DIO-SAU-100',
      image_url: '/images/sauvage.jpg', images: ['/images/sauvage.jpg', '/images/hero.jpg'],
      notes: { top: ['Calabrian Bergamot','Pepper','Mandarin'], middle: ['Sichuan Pepper','Lavender','Pink Pepper','Star Anise'], base: ['Ambroxan','Papua Vanilla','Cedarwood','Labdanum'] },
      longevity: 'Very Long Lasting (8-10 hrs)', sillage: 'Strong', rating: 4.8, review_count: 128,
      is_featured: true, is_bestseller: true, is_new: false, is_active: true
    },
    {
      name: 'Khamrah EDP', slug: 'khamrah-edp',
      description: 'A warm, gourmand oriental masterpiece featuring cognac, cinnamon, and sweet dates enveloped in roasted praline and creamy vanilla.',
      price: 55000, compare_at_price: 62000, brand_id: brandMap['lattafa'], category_id: catMap['arabian'],
      gender: 'Unisex', fragrance_family: 'Warm Spicy Gourmand', concentration: 'Eau de Parfum',
      size: '100ml', sizes: ['100ml'], default_size: '100ml', stock_quantity: 24, sku: 'SKU-LAT-KHA-100',
      image_url: '/images/khamrah.jpg', images: ['/images/khamrah.jpg'],
      notes: { top: ['Cinnamon','Nutmeg','Bergamot'], middle: ['Dates','Praline','Tuberose'], base: ['Vanilla','Tonka Bean','Benzoin','Myrrh','Amberwood'] },
      longevity: 'Eternal (12+ hrs)', sillage: 'Enormous', rating: 4.9, review_count: 94,
      is_featured: true, is_bestseller: false, is_new: true, is_active: true
    },
    {
      name: 'Aventus EDP', slug: 'aventus-edp',
      description: 'The undisputed king of modern luxury perfumery. Celebrating strength, power, and success, this legendary formulation harmonizes succulent blackcurrant and Italian bergamot with birch smoke and rare grey ambergris.',
      price: 350000, compare_at_price: 395000, brand_id: brandMap['creed'], category_id: catMap['niche'],
      gender: 'Men', fragrance_family: 'Fruity Chypre', concentration: 'Eau de Parfum',
      size: '100ml', sizes: ['50ml','100ml'], default_size: '100ml', stock_quantity: 8, sku: 'SKU-CRD-AVE-100',
      image_url: '/images/aventus.jpg', images: ['/images/aventus.jpg'],
      notes: { top: ['Pineapple','Blackcurrant','Bergamot','Apple'], middle: ['Birch','Patchouli','Moroccan Jasmine','Rose'], base: ['Musk','Oakmoss','Ambergris','Vanille'] },
      longevity: 'Long Lasting (8-10 hrs)', sillage: 'Strong', rating: 4.9, review_count: 210,
      is_featured: true, is_bestseller: true, is_new: false, is_active: true
    },
    {
      name: '9PM Eau de Parfum', slug: '9pm-eau-de-parfum',
      description: 'A sensual evening masterpiece blending crisp green apple and wild cinnamon with creamy bourbon vanilla and golden amber.',
      price: 45000, compare_at_price: 52000, brand_id: brandMap['afnan'], category_id: catMap['for-him'],
      gender: 'Men', fragrance_family: 'Amber Spicy', concentration: 'Eau de Parfum',
      size: '100ml', sizes: ['100ml'], default_size: '100ml', stock_quantity: 30, sku: 'SKU-AFN-9PM-100',
      image_url: '/images/9pm.jpg', images: ['/images/9pm.jpg'],
      notes: { top: ['Apple','Cinnamon','Wild Lavender','Bergamot'], middle: ['Orange Blossom','Lily-of-the-Valley'], base: ['Vanilla','Tonka Bean','Amber','Patchouli'] },
      longevity: 'Very Long Lasting (9-11 hrs)', sillage: 'Strong', rating: 4.7, review_count: 76,
      is_featured: false, is_bestseller: true, is_new: false, is_active: true
    },
    {
      name: 'Tobacco Vanille Private Blend', slug: 'tobacco-vanille',
      description: 'Opulent, warm, and iconic. Reminiscent of an English gentleman\'s club, Tom Ford reinvents tobacco with creamy tonka bean, vanilla, cocoa, and sweet wood sap.',
      price: 295000, compare_at_price: 330000, brand_id: brandMap['tom-ford'], category_id: catMap['niche'],
      gender: 'Unisex', fragrance_family: 'Warm Amber Gourmand', concentration: 'Eau de Parfum',
      size: '50ml', sizes: ['50ml','100ml'], default_size: '50ml', stock_quantity: 11, sku: 'SKU-TFD-TBV-050',
      image_url: '/images/tobacco-vanille.jpg', images: ['/images/tobacco-vanille.jpg'],
      notes: { top: ['Tobacco Leaf','Spicy Notes'], middle: ['Tonka Bean','Tobacco Blossom','Vanilla','Cacao'], base: ['Dry Fruit Accord','Wood Sap'] },
      longevity: 'Eternal (12+ hrs)', sillage: 'Enormous', rating: 4.9, review_count: 142,
      is_featured: true, is_bestseller: false, is_new: false, is_active: true
    },
    {
      name: 'Baccarat Rouge 540 EDP', slug: 'baccarat-rouge-540',
      description: 'Luminous and intense, laying on the skin like an amber floral and woody breeze. An alchemy of aerial jasmine and saffron with mineral ambergris and fresh cedarwood.',
      price: 315000, compare_at_price: 345000, brand_id: brandMap['mfk'], category_id: catMap['niche'],
      gender: 'Unisex', fragrance_family: 'Amber Floral', concentration: 'Eau de Parfum',
      size: '70ml', sizes: ['70ml'], default_size: '70ml', stock_quantity: 6, sku: 'SKU-MFK-BR5-070',
      image_url: '/images/hero.jpg', images: ['/images/hero.jpg'],
      notes: { top: ['Bitter Almond','Saffron'], middle: ['Egyptian Jasmine','Cedar'], base: ['Ambergris','Woody Notes','Musk'] },
      longevity: 'Eternal (14+ hrs)', sillage: 'Enormous', rating: 4.9, review_count: 318,
      is_featured: true, is_bestseller: true, is_new: false, is_active: true
    },
  ]

  const { error: prodErr } = await supabase.from('products').upsert(products, { onConflict: 'slug', ignoreDuplicates: true })
  if (prodErr) {
    console.error('Products error:', prodErr.message)
  } else {
    console.log('✅ Products seeded (6 products)')
  }

  // Seed coupons
  const { error: couponErr } = await supabase.from('coupons').upsert([
    { code: 'ATELIER10', discount_type: 'percentage', discount_value: 10.00, minimum_order_amount: 0, maximum_discount: 50000, usage_limit: 500, is_active: true },
    { code: 'FANCY20', discount_type: 'percentage', discount_value: 20.00, minimum_order_amount: 100000, maximum_discount: 80000, usage_limit: 200, is_active: true },
    { code: 'VIP15', discount_type: 'percentage', discount_value: 15.00, minimum_order_amount: 0, maximum_discount: 60000, usage_limit: 100, is_active: true },
  ], { onConflict: 'code', ignoreDuplicates: true })

  if (couponErr) {
    console.error('Coupons error:', couponErr.message)
  } else {
    console.log('✅ Coupons seeded (ATELIER10, FANCY20, VIP15)')
  }

  // Final verification
  const { data: brandCount } = await supabase.from('brands').select('id', { count: 'exact', head: true })
  const { data: catCount } = await supabase.from('categories').select('id', { count: 'exact', head: true })
  const { data: prodCount } = await supabase.from('products').select('id', { count: 'exact', head: true })
  
  const { count: bCount } = await supabase.from('brands').select('*', { count: 'exact', head: true })
  const { count: cCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true })

  console.log('')
  console.log('=== VERIFICATION ===')
  console.log(`Brands in DB:     ${bCount}`)
  console.log(`Categories in DB: ${cCount}`)
  console.log(`Products in DB:   ${pCount}`)
  console.log('')
  console.log('🎉 Seed complete!')

} else {
  const result = await response.json()
  console.log('✅ Seed executed via exec_sql RPC:', result)
}

# Mock Data Cleanup & Live Data Migration

## Goal

Replace all remaining static mock data in the application with live data from Supabase and the Express API. After this implementation:

- Admin Dashboard shows real orders from Supabase `orders` table
- Profile page shows the current user's real orders
- Promo codes are validated server-side via Supabase `coupons` table
- Bank/payment details are loaded from environment config — not hardcoded in the client bundle
- `formatNaira` and `formatDate` are moved to a shared utility file
- Static fallback JS files (`products.js`, `brands.js`, `categories.js`) are removed after confirming Supabase data is live
- `adminMockData.js` is deleted once orders are wired up

---

## Prerequisites

- [ ] `seed.sql` has been run in Supabase SQL Editor — brands, categories, products, and coupons are seeded
- [ ] Express server is running (`npm run server`)
- [ ] Vite dev server is running (`npm run dev`)

---

## Scope

### In scope
- Wire `orders` state in `AdminDataContext` to load from Supabase `orders` table
- Wire `updateOrderStatus` to persist to Supabase via Express API
- Wire Profile page orders to fetch current user's real orders from Supabase
- Move promo code validation to Express API + Supabase `coupons` table
- Move `BANK_DETAILS` to `.env.local` and serve via `/api/config/payment`
- Create `src/lib/format.js` with `formatNaira` and `formatDate`
- Remove `MOCK_ORDERS` and `MOCK_CUSTOMERS` from `adminMockData.js`
- Remove `src/data/products.js`, `brands.js`, `categories.js` static fallback imports once DB confirmed live
- Delete `adminMockData.js` when no consumers remain

### Out of scope
- Paystack live payment integration
- Zoho Books invoice integration
- SMS / email notifications
- Admin order creation from the admin panel

---

## Architecture

```
Frontend (React)
  └── AdminDataContext.jsx
        └── fetchAdminOrders()  ──► GET /api/admin/orders  ──► Supabase orders table
        └── updateOrderStatus() ──► PATCH /api/admin/orders/:id/status ──► Supabase

Frontend (CheckoutPage)
  └── handleApplyPromo()  ──► POST /api/coupons/validate  ──► Supabase coupons table

Frontend (ProfilePage)
  └── fetchCustomerOrders() ──► GET /api/orders (filtered by clerk_user_id) ──► Supabase
```

---

## Implementation Steps

### Step 1 — Create `src/lib/format.js`

Extract `formatNaira` and `formatDate` from `adminMockData.js` into a shared utility:

```js
// src/lib/format.js
export function formatNaira(amount) {
  return '₦' + (amount || 0).toLocaleString('en-NG')
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
```

Update all 5 import sites to use `../../lib/format` or `../lib/format`:
- `src/pages/ProfilePage.jsx`
- `src/pages/admin/AdminDashboardPage.jsx`
- `src/pages/admin/AdminOrdersPage.jsx`
- `src/pages/admin/AdminOrderDetailPage.jsx`
- `src/pages/admin/AdminCustomersPage.jsx`

---

### Step 2 — Add orders API routes to Express server

Create `server/routes/adminOrders.js`:

```js
GET  /api/admin/orders              → fetch all orders, sorted by created_at DESC
GET  /api/admin/orders/:id          → fetch single order with items
PATCH /api/admin/orders/:id/status  → update order status (validate enum)
```

Requirements:
- Protected by `requireAdmin` middleware
- Uses `supabaseAdmin` client (service role)
- Returns orders with their `order_items` joined (via `.select('*, order_items(*)')`)
- `PATCH /status` only allows transitions: pending → processing → shipped → delivered | cancelled

Create `server/services/orderService.js`:
```js
export async function getAdminOrders({ search, status, sortBy, sortDir })
export async function getAdminOrderById(id)
export async function updateOrderStatus(id, status)
export async function getCustomerOrders(clerkUserId)  // for profile page
```

Register route in `server/index.js`:
```js
import adminOrdersRouter from './routes/adminOrders.js'
app.use('/api/admin', adminOrdersRouter)
```

---

### Step 3 — Add customer orders route

Create `server/routes/orderRoutes.js`:

```js
GET /api/orders   → returns orders for the authenticated clerk user (from header token)
```

Requirements:
- Protected by `requireAuth` middleware (verify Clerk JWT)
- Filters orders by `clerk_user_id = req.auth.userId`
- Returns orders with order_items joined

Register in `server/index.js`:
```js
import orderRoutes from './routes/orderRoutes.js'
app.use('/api', orderRoutes)
```

---

### Step 4 — Add coupon validation route to Express

Create `server/routes/couponRoutes.js`:

```js
POST /api/coupons/validate
  body: { code: string }
  → validates code in Supabase coupons table
  → checks: is_active, expires_at, usage_limit vs times_used
  → returns: { valid: true, discount_type, discount_value, maximum_discount, minimum_order_amount }
  → or:      { valid: false, message: 'Invalid or expired code' }
```

No auth required (public endpoint, server-side validation only).

Register in `server/index.js`:
```js
import couponRoutes from './routes/couponRoutes.js'
app.use('/api', couponRoutes)
```

---

### Step 5 — Add frontend service functions

In `src/services/adminProductService.js` (or create `src/services/orderService.js`):

```js
export async function getAdminOrders(params)  // GET /api/admin/orders
export async function patchOrderStatus(id, status)  // PATCH /api/admin/orders/:id/status
export async function getCustomerOrders()  // GET /api/orders
export async function validateCouponCode(code)  // POST /api/coupons/validate
```

---

### Step 6 — Update `AdminDataContext.jsx`

Replace mock order initialization with live data:

```js
// REMOVE:
import { MOCK_ORDERS, MOCK_CUSTOMERS } from '../data/adminMockData'
const [orders, setOrders] = useState(MOCK_ORDERS)

// ADD:
const [orders, setOrders] = useState([])
const [ordersLoading, setOrdersLoading] = useState(true)

// In initSupabaseData():
const dbOrders = await getAdminOrders().catch(() => null)
if (dbOrders && dbOrders.length >= 0) setOrders(dbOrders)
```

Update `updateOrderStatus`:
```js
const updateOrderStatus = useCallback(async (id, status) => {
  await patchOrderStatus(id, status)  // persists to Supabase
  setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
}, [])
```

Expose `ordersLoading` in context value.

---

### Step 7 — Update `ProfilePage.jsx`

Replace mock-order fallback with live customer orders:

```js
// REMOVE:
const displayOrders = customerOrders.length > 0 ? customerOrders : orders.slice(0, 3)

// ADD:
const [myOrders, setMyOrders] = useState([])
const [ordersLoading, setOrdersLoading] = useState(true)

useEffect(() => {
  if (!user) return
  getCustomerOrders()
    .then(setMyOrders)
    .catch(() => setMyOrders([]))
    .finally(() => setOrdersLoading(false))
}, [user])
```

Remove the dependency on `useAdminData().orders` in ProfilePage — it should fetch its own orders.

---

### Step 8 — Update `CheckoutPage.jsx` — promo codes

Replace hardcoded `PROMO_CODES` object with server-side validation:

```js
// REMOVE:
const PROMO_CODES = { ATELIER10: 10, FANCY20: 20, VIP15: 15 }

// UPDATE handleApplyPromo:
const handleApplyPromo = async (e) => {
  e.preventDefault()
  const code = promoInput.trim().toUpperCase()
  if (!code) return
  setPromoLoading(true)
  try {
    const result = await validateCouponCode(code)
    if (result.valid) {
      setAppliedPromo({ code, percent: result.discount_value })
      toast.success(`Promo code applied: ${result.discount_value}% off!`)
    } else {
      toast.error(result.message || 'Invalid promo code.')
    }
  } catch {
    toast.error('Could not validate promo code. Please try again.')
  } finally {
    setPromoLoading(false)
  }
}
```

---

### Step 9 — Move `BANK_DETAILS` to environment config

In `.env.local`:
```
VITE_OPAY_ACCOUNT_NAME=DENNNIS UWEM
VITE_OPAY_ACCOUNT_NUMBER=9121536442
VITE_WHATSAPP_NUMBER=2349121536442
```

In `CheckoutPage.jsx`:
```js
// REMOVE hardcoded BANK_DETAILS constant
// ADD:
const BANK_DETAILS = {
  bankName: 'OPAY',
  accountName: import.meta.env.VITE_OPAY_ACCOUNT_NAME,
  accountNumber: import.meta.env.VITE_OPAY_ACCOUNT_NUMBER,
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER,
}
```

> Note: These are still in the client bundle since they need to be shown to customers. The env var approach is still better — easier to change without touching code, and works correctly with Vercel deploy config.

---

### Step 10 — Cleanup: remove static data files

Once Supabase is confirmed working:

1. Remove `PRODUCTS` import from `AdminDataContext.jsx` — replace `useState(() => PRODUCTS.map(...))` with `useState([])`
2. Remove `BRANDS` import — replace `useState(BRANDS)` with `useState([])`
3. Remove `CATEGORIES` import — replace `useState(CATEGORIES)` with `useState([])`
4. Delete `src/data/products.js`
5. Delete `src/data/brands.js`
6. Delete `src/data/categories.js`
7. Delete `src/data/adminMockData.js` (after Step 1 format utility is extracted)

---

## Verification Steps

After implementation, verify each piece:

### Orders
```
1. Open Admin Dashboard → Orders
   ✅ Orders list is empty or shows real Supabase orders (not mock Nigerian names)
2. Place a test order via checkout
   ✅ Order appears in Admin Dashboard
   ✅ Change status to "processing" → refreshing page retains the status
3. Open Profile page as signed-in user
   ✅ Shows only orders belonging to that user's clerk_user_id
   ✅ Shows "No orders yet" for new users instead of fake mock orders
```

### Coupons
```
1. Go to /checkout with items in cart
2. Enter ATELIER10 → ✅ 10% discount applied (validated from Supabase)
3. Enter INVALID123 → ✅ "Invalid or expired code" toast shown
4. Enter FANCY20 → ✅ 20% discount applied
5. Check server logs → ✅ POST /api/coupons/validate called (not client-side lookup)
```

### Catalog (after seed.sql)
```
1. Open /shop → ✅ Products load from Supabase (not static JS file)
2. Open /brands → ✅ 8 brands from Supabase
3. Open /categories → ✅ 6 categories from Supabase
4. Admin → Products → ✅ 6 products from Supabase, not 15 from products.js
```

### Format utilities
```
1. Open Admin Dashboard → ✅ Prices formatted as ₦X,XXX (from src/lib/format.js)
2. Open Admin Orders → ✅ Dates formatted correctly
3. No console errors about missing formatNaira imports
```

---

## Files Changed Summary

| Action | File |
|---|---|
| CREATE | `src/lib/format.js` |
| CREATE | `server/routes/adminOrders.js` |
| CREATE | `server/routes/orderRoutes.js` |
| CREATE | `server/routes/couponRoutes.js` |
| CREATE | `server/services/orderService.js` |
| MODIFY | `src/context/AdminDataContext.jsx` — live orders, remove mock |
| MODIFY | `src/pages/ProfilePage.jsx` — live customer orders |
| MODIFY | `src/pages/admin/AdminOrdersPage.jsx` — ordersLoading state |
| MODIFY | `src/pages/admin/AdminDashboardPage.jsx` — update imports |
| MODIFY | `src/pages/admin/AdminOrderDetailPage.jsx` — update imports |
| MODIFY | `src/pages/admin/AdminCustomersPage.jsx` — update imports |
| MODIFY | `src/pages/CheckoutPage.jsx` — server-side coupon validation, env-based bank details |
| MODIFY | `server/index.js` — register new routes |
| MODIFY | `.env.local` — add VITE_OPAY_* vars |
| DELETE | `src/data/adminMockData.js` |
| DELETE | `src/data/products.js` |
| DELETE | `src/data/brands.js` |
| DELETE | `src/data/categories.js` |

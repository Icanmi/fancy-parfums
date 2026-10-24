# Customer Registration & Supabase Sync — Implementation Prompt

## Goal

Ensure that whenever a customer registers or signs in on the storefront via **Clerk**, their profile is automatically synced and persisted into the **Supabase** `profiles` table. Additionally, update the **Admin Dashboard** (`/admin/customers` and `/admin/dashboard`) so that administrators view live registered customers from Supabase rather than static mock data.

---

## 1. System Architecture

```text
Customer (Storefront)
   │
   ├─► Clerk Auth (Sign-Up / Sign-In)
   │     │
   │     ▼ Authenticated User Object (id, email, names, phone)
   │
   └─► POST /api/users/sync
         │
         ▼
Express API Backend (server/)
   │
   ├─► Validates user payload (clerkUserId, email)
   ├─► Server-side Supabase client (supabaseAdmin)
   │
   ▼
Supabase Database
   └── public.profiles (upsert: clerk_user_id, first_name, last_name, email, phone)
         ▲
         │
         │ GET /api/admin/customers (Admin Authorization)
         │
Admin Dashboard (/admin/customers)
```

---

## 2. Backend Implementation (Express REST API)

### 1. User Profile Sync Route (`server/routes/userRoutes.js`)
- `POST /api/users/sync`:
  - Body: `{ clerkUserId, email, firstName, lastName, phone, shippingAddress }`.
  - Performs an `upsert` on `public.profiles` keyed by `clerk_user_id`.
  - Bypasses RLS using `supabaseAdmin`.
  - Returns `{ success: true, profile }`.
- `GET /api/users/me`:
  - Retrieves the current user's profile from `profiles`.

### 2. Admin Customers Route (`server/routes/adminCustomers.js` or in `adminProducts.js`)
- `GET /api/admin/customers`:
  - Requires admin authorization (Clerk admin role or `x-dev-admin` in development).
  - Queries all profiles from `public.profiles`, ordered by `created_at DESC`.
  - Aggregates total orders and total spent for each customer from the `orders` table.
  - Returns `{ success: true, count, data: [...] }`.

### 3. Server Index Mounting (`server/index.js`)
- Mount `/api/users` routes.
- Mount `/api/admin/customers` route.

---

## 3. Frontend Client-Side Implementation

### 1. Automatic User Synchronization (`src/components/auth/UserSync.jsx` or hook `useUserSync.js`)
- Uses Clerk's `useUser()` and `useAuth()`.
- When `isSignedIn && user` is detected:
  - Dispatches an asynchronous sync request to `POST /api/users/sync`.
  - Prevents redundant calls by caching the synced state in session.
- Mounted at the root level inside `ClerkProvider` in `App.jsx`, ensuring that registration via `/sign-up`, sign-in via `/sign-in`, OAuth, or existing sessions immediately syncs to Supabase.

### 2. Admin Customer Service (`src/services/adminCustomerService.js`)
- `getAdminCustomers(token)`: Makes an authenticated GET request to `/api/admin/customers`.
- Normalizes customer records (mapping `first_name` -> `firstName`, `last_name` -> `lastName`, `created_at` -> `createdAt`, etc.) for UI components.

### 3. Admin Customers Page (`src/pages/admin/AdminCustomersPage.jsx`)
- Replaces static mock customer data with live data fetched via `getAdminCustomers()`.
- Displays real names, emails, phone numbers, cities, order counts, and registration dates.
- Adds loading state, search filtering, and empty state ("No customers registered yet").
- Detail modal displays full profile and shipping details stored in Supabase.

### 4. Admin Context & Dashboard Sync (`src/context/AdminDataContext.jsx`)
- Updates `AdminDataContext` to initialize and refresh customers from the live API.
- The Admin Dashboard metrics ("Total Customers") will reflect real Supabase customer registrations.

---

## 4. Verification Plan

1. **New Customer Registration Flow**:
   - Register a new customer account on `/sign-up` (e.g., `amara.okafor@example.com`, "Amara Okafor").
   - Verify that `POST /api/users/sync` responds with `200 OK`.
   - Directly query Supabase: verify that `profiles` has a row matching the Clerk user ID and email.

2. **Admin Dashboard Customer Listing**:
   - Open `/admin/customers` in the browser.
   - Confirm that the newly registered user ("Amara Okafor", `amara.okafor@example.com`) appears in the customers table.
   - Check customer count metric on `/admin`.

3. **Build Validation**:
   - Run `npm run build` to confirm clean compilation with 0 errors.

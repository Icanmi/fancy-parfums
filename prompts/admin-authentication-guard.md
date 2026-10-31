# Admin Authentication Guard

## Problem

The `/admin` route tree is completely unprotected on the frontend.
`AdminLayout` renders `<Outlet />` with no authentication check, so anyone who
navigates to `/admin` reaches the admin dashboard without signing in.

The backend `requireAdmin` middleware also has a blanket bypass:

```js
process.env.NODE_ENV === 'development' // permissive in dev for testing
```

This means every request — including unauthenticated ones — is treated as an
admin in development.

---

## Goal

Gate every `/admin/*` route behind:

1. **Clerk authentication** — the user must be signed in.
2. **Admin role check via Neon** — the user's `profiles.role` must equal
   `'admin'`.

Non-admins (no session, or role ≠ `'admin'`) are redirected to the sign-in
page. The role is authoritative from the Neon `profiles` table, fetched through
the Express API — never from the browser alone.

---

## Tech Stack

- **Frontend:** React + Clerk (`@clerk/clerk-react`)
- **Backend:** Node.js + Express
- **Database:** Neon Serverless PostgreSQL (project `lucky-butterfly-08899536`)
- **Auth:** Clerk (already wired — `ClerkProvider`, `useUser`, `useAuth`)

---

## Implementation Steps

### 1. Database Migration — Add `role` column to `profiles`

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('nancydennis1113@gmail.com');

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
```

### 2. Backend — New endpoint `GET /api/users/me/role`

Add to `server/routes/userRoutes.js`.  
Reads the Clerk token from `Authorization: Bearer <token>`, decodes the
`sub` (clerk_user_id), and returns the `role` from the `profiles` table.

### 3. Backend — Fix `requireAdmin` dev bypass

Remove the blanket `process.env.NODE_ENV === 'development'` bypass on line 65
of `server/middleware/authMiddleware.js`. Admin access should be based only on
role/email checks, not the environment.

### 4. Frontend — `ProtectedAdminRoute` component

New file: `src/components/auth/ProtectedAdminRoute.jsx`

- Uses `useAuth()` and `useUser()` from Clerk.
- On mount, calls `GET /api/users/me/role` with the Clerk Bearer token.
- Shows a spinner while loading.
- Redirects to `/sign-in` if not signed in.
- Redirects to `/` if signed in but role ≠ `'admin'`.
- Renders `<Outlet />` for confirmed admins.

### 5. Frontend — Wrap admin routes in `App.jsx`

Nest the entire `/admin` route tree inside `<Route element={<ProtectedAdminRoute />}>`.

### 6. Frontend — `AdminLayout` header

Show the real signed-in user's first name using `useUser()` instead of the
static "Admin" label.

---

## Files Changed

| File | Change |
|---|---|
| Neon DB | `ALTER TABLE profiles ADD COLUMN role` |
| `server/routes/userRoutes.js` | Add `GET /me/role` endpoint |
| `server/middleware/authMiddleware.js` | Remove blanket dev bypass |
| `src/components/auth/ProtectedAdminRoute.jsx` | New guard component |
| `src/App.jsx` | Wrap admin routes with `ProtectedAdminRoute` |
| `src/components/admin/AdminLayout.jsx` | Show real admin name |

---

## Test Steps

1. **Unauthenticated blocked** — Private tab → `/admin` → redirects to `/sign-in`.
2. **Non-admin blocked** — Sign in as `role = 'customer'` → `/admin` → redirects to `/`.
3. **Admin access** — Sign in as admin email → `/admin` → dashboard loads.
4. **Role endpoint** — `GET /api/users/me/role` returns correct role.
5. **Backend middleware** — `GET /api/admin/brands` with no token → HTTP 401 in dev.


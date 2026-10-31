# Separate Admin Authentication via Neon Only (Decoupled from Clerk)

## Problem
Currently, the admin portal relies on Clerk for user identity and attempts to map Clerk sessions to the database. Because admin accounts are not pre-configured as Clerk customers, admin logins get blocked or redirected to the client storefront. Furthermore, administrative access should not be coupled with the customer-facing Clerk authentication service.

## Objective
Completely separate administrat
or authentication from Clerk so that admin access is managed and verified **solely through Neon PostgreSQL**.

---

## Architecture & Design

### 1. Database Foundation (Neon PostgreSQL)
Create a dedicated `admin_users` table in Neon:
```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);
```
Seed the initial administrator:
- Email: `nancydennis1113@gmail.com`
- Name: `Nancy Dennis`
- Role: `admin`
- Password: Securely hashed with scrypt/salt using Node.js standard `crypto` module (initial credentials provided to administrator).

### 2. Backend Admin Authentication API (`server/routes/adminAuth.js`)
- `POST /api/admin/auth/login`:
  - Validates `email` and `password`.
  - Queries `public.admin_users` by email.
  - Verifies hashed password using constant-time timing safe check.
  - Issues a cryptographically signed Admin Session Token (HMAC-SHA256).
  - Returns `{ success: true, token, admin: { id, name, email, role } }`.
- `GET /api/admin/auth/me`:
  - Validates Admin Bearer token.
  - Returns current admin profile.
- `POST /api/admin/auth/logout`:
  - Clears admin session.

### 3. Server-Side Admin Middleware (`server/middleware/authMiddleware.js`)
- Update `requireAdmin` to verify the Neon Admin Session Token from `Authorization: Bearer <token>`.
- Admin API routes (`/api/admin/*`) will exclusively authenticate against Neon admin tokens, with zero dependency on Clerk JWTs.

### 4. Frontend Admin Auth State (`src/context/AdminAuthContext.jsx`)
- Create `AdminAuthProvider` to manage:
  - `admin` (current admin user object)
  - `token` (stored in `localStorage.getItem('atelier_admin_token')`)
  - `login(email, password)`
  - `logout()`
  - `isLoading` (verifies session on app startup via `GET /api/admin/auth/me`)

### 5. Dedicated Admin Login Page (`src/pages/admin/AdminLoginPage.jsx`)
- Luxury gold/dark themed admin portal login screen matching the Fancy Atelier Parfums design system.
- Form fields: Email, Password.
- Loading states, error notifications via `react-hot-toast`.
- Redirects to `/admin/dashboard` upon successful login.

### 6. Admin Route Protection & Layout Integration
- Update `src/components/auth/ProtectedAdminRoute.jsx`:
  - Uses `useAdminAuth()`.
  - Shows loading indicator while checking Neon admin session.
  - If unauthenticated, redirects to `/admin/login`.
  - If authenticated, renders admin pages via `<Outlet />`.
- Update `src/App.jsx`:
  - Route `/admin/login` -> `<AdminLoginPage />`
  - Routes `/admin/*` protected by `<ProtectedAdminRoute />`
  - Wrap application or admin subtree in `<AdminAuthProvider>`
- Update `src/components/admin/AdminLayout.jsx`:
  - Display actual logged-in admin name (`admin.name`).
  - Add "Sign Out" button that triggers `logout()` and redirects to `/admin/login`.

---

## Files to Create / Modify
| File | Action | Purpose |
|---|---|---|
| Neon DB | Migration | Create `admin_users` table & seed admin |
| `server/routes/adminAuth.js` | Create | Admin login, me, and logout endpoints |
| `server/middleware/authMiddleware.js` | Modify | Validate Neon admin tokens for all admin routes |
| `server/index.js` | Modify | Mount `/api/admin/auth` routes |
| `src/context/AdminAuthContext.jsx` | Create | Frontend admin session state & token management |
| `src/pages/admin/AdminLoginPage.jsx` | Create | Dedicated luxury admin login page |
| `src/components/auth/ProtectedAdminRoute.jsx` | Modify | Guard admin routes using Neon admin session |
| `src/components/admin/AdminLayout.jsx` | Modify | Show admin info & sign out button |
| `src/App.jsx` | Modify | Add `/admin/login` and provide `AdminAuthProvider` |

---

## Verification & Test Plan
1. **Unauthenticated access**: Visit `/admin` in a new tab -> automatically redirects to `/admin/login`.
2. **Invalid credentials**: Attempt login with wrong password -> displays clear error message without granting access.
3. **Successful login**: Login with `nancydennis1113@gmail.com` -> redirects to `/admin/dashboard`.
4. **Session persistence**: Refresh the page on `/admin/dashboard` -> remains logged in as admin without redirect.
5. **Admin operations**: Test category/brand/product admin operations to ensure backend accepts the Neon admin token.
6. **Sign out**: Click Sign Out in admin sidebar/header -> session cleared and redirected to `/admin/login`.
7. **Customer separation**: Verify storefront Clerk sign-in/sign-up continues to function normally and independently.


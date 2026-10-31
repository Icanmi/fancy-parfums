# Vercel Deployment Configuration for Full-Stack App (Vite + Express API on Neon)

## Problem
When deployed to Vercel:
1. **SPA Routing Failure (404 on refresh/direct visit):** Vercel serves static files from `dist/`. Navigating directly to `/admin`, `/admin/login`, or `/admin/dashboard` returns a 404 Page Not Found error because Vercel doesn't have an `index.html` rewrite rule configured.
2. **Missing Backend on Vercel:** In local development, the Express server runs on port 5000 and Vite proxies `/api` to it. In production on Vercel, there is no server process running unless configured as a Vercel Serverless Function (`api/index.js`). Without this, all `/api/admin/auth/login` and `/api/admin/*` requests 404.
3. **Missing Environment Variables:** `.env.local` is git-ignored and never committed to GitHub. On Vercel, `DATABASE_URL` and `ADMIN_JWT_SECRET` are undefined until added to the Vercel project settings.

## Solution

### 1. Create `vercel.json` in Root
Configure rewrites so:
- `/api/(.*)` routes to the Vercel serverless function handler (`/api`).
- All other routes (`/(.*)`) route to `/index.html` for client-side React Router DOM navigation.

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Create Serverless Function Entry Point: `api/index.js`
Create `api/index.js` exporting the Express `app`:
```javascript
import app from '../server/index.js'

export default app
```

### 3. Update `server/index.js`
Guard `app.listen()` so it only starts a standalone HTTP server when NOT running inside Vercel's serverless environment:
```javascript
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[API Server] Fancy Atelier Parfums Express API running on http://localhost:${PORT}`)
  })
}
```

### 4. Provide Vercel Environment Variables Checklist
The following environment variables must be configured in **Vercel Dashboard → Settings → Environment Variables**:
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `ADMIN_JWT_SECRET`
- `ADMIN_EMAILS`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

---

## Files to Create / Modify
| File | Action | Purpose |
|---|---|---|
| `vercel.json` | Create | Configure SPA routing fallback and API route handler |
| `api/index.js` | Create | Serverless bridge exporting Express app to Vercel |
| `server/index.js` | Modify | Guard `app.listen()` for serverless runtime |

---

## Verification Plan
1. Local build check (`npm run build`).
2. Verify local standalone server (`npm run server`) continues to work on port 5000.
3. Verify `vercel.json` rewrites and `api/index.js` syntax.
4. User pushes changes to GitHub for automatic Vercel redeployment.


# Customer Authentication, Profile & Checkout — Implementation Prompt

## Goal

Implement the complete customer authentication flow using **Clerk**, a dedicated **Customer Profile** page (`/profile`), and a full **Checkout** flow (`/checkout` + `/order-confirmation/:id`) for **Fancy Atelier Parfums**, adhering to the requirements in [AGENTS.md](file:///c:/Users/LENOVO/perfumeE-com/AGENTS.md).

---

## 1. Customer Authentication (Clerk)

- **Clerk Package**: Install and configure `@clerk/clerk-react`.
- **Environment Keys**: Read publishable key from `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `VITE_CLERK_PUBLISHABLE_KEY` with fallback to `pk_test_dGFsZW50ZWQtYWRkZXItMzUzOC5jbGVyay5hY2NvdW50cy5kZXYk`).
- **Luxury Theming**: Configure `ClerkProvider` with custom `appearance` matching the Fancy Atelier Parfums luxury dark/gold aesthetic (`#0A0A0A` background, `#D4AF37` primary/accent, serif heading typography, clean borders).
- **Dedicated Auth Pages**:
  - `/sign-in/*` with Clerk `<SignIn />` centered on a luxury background.
  - `/sign-up/*` with Clerk `<SignUp />`.
- **Navbar Integration**:
  - When **Signed Out**: Display "Sign In" button / icon linking to `/sign-in`.
  - When **Signed In**: Display Clerk `<UserButton />` with custom links ("Customer Profile", "My Orders", "Admin Portal").
  - Mobile navigation drawer updated to reflect sign-in / user state.

---

## 2. Customer Profile (`/profile`)

- **Route**: `/profile` (protected: redirects to `/sign-in` if unauthenticated).
- **Hero / Header**:
  - Welcome greeting with customer avatar, full name, email, and "Atelier Member" gold badge.
- **Interactive Tabs**:
  1. **My Orders**: Displays order history (filtered by the user's email/ID, plus interactive mock history) showing Order #, Date, Status Badge, Items, and Total in ₦. Clicking an order expands or views details.
  2. **Delivery & Addresses**: Manage default delivery address, phone number, and city/state for quick checkout.
  3. **Account Settings**: Embedded Clerk `<UserProfile />` or user credentials management.
  4. **Wishlist**: Quick view of saved fragrances with direct "Move to Bag" buttons.

---

## 3. Checkout Experience (`/checkout` & `/order-confirmation/:id`)

- **Cart Page Integration**: Replace placeholder alert on [`src/pages/CartPage.jsx`](file:///c:/Users/LENOVO/perfumeE-com/src/pages/CartPage.jsx) with navigation to `/checkout`.
- **Checkout Page (`/checkout`)**:
  - 2-Column Luxury Layout:
    - **Left Column**:
      - **Contact Information**: Pre-filled automatically from Clerk if authenticated; option to sign in or proceed as guest.
      - **Shipping Details**: Full Name, Phone Number, Street Address, City, State (Nigerian states: Lagos, Abuja FCT, Rivers, etc.), Delivery Notes.
      - **Delivery Method**: Standard Delivery (Free on orders over ₦100,000) or Express Dispatch (₦5000).
      - **Payment Method**: Debit Card or Bank Transfer and Paystack Payment Gateway Integration.
    - **Right Column**:
      - Real-time Order Summary with fragrance thumbnails, item names, sizes, quantities, and subtotal.
      - Promo code application with immediate discount calculation.
      - Live Total in ₦.
      - Trust & Authenticity guarantee badges (100% Authentic, 256-bit SSL).
- **Order Placement**:
  - Validates all delivery fields.
  - Generates unique order number (e.g. `FA-2026-XXXX`).
  - Saves the new order into `AdminDataContext` (instantly updates Admin Dashboard orders, revenue, and stock count).
  - Clears the user's cart.
  - Navigates to `/order-confirmation/:id`.
- **Order Confirmation Page (`/order-confirmation/:id`)**:
  - Celebration banner ("Order Confirmed & Allocated").
  - Order number, estimated delivery date, recipient contact & shipping address, item breakdown.
  - Actions: "View in My Orders" (redirects to `/profile`), "Continue Shopping" (redirects to `/shop`).

---

## 4. File Changes

### New Files
- `src/pages/SignInPage.jsx` — Clerk sign-in page.
- `src/pages/SignUpPage.jsx` — Clerk sign-up page.
- `src/pages/ProfilePage.jsx` — Customer profile, order history, address book.
- `src/pages/CheckoutPage.jsx` — Multi-step luxury checkout flow.
- `src/pages/OrderConfirmationPage.jsx` — Post-purchase success & tracking page.

### Modified Files
- `.env.local` — Ensure `VITE_CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are configured.
- `package.json` — Add `@clerk/clerk-react`.
- `src/App.jsx` — Wrap application in `ClerkProvider` and register new routes (`/sign-in/*`, `/sign-up/*`, `/profile`, `/checkout`, `/order-confirmation/:id`).
- `src/components/layout/Navbar.jsx` — Add Clerk `<SignedIn>`, `<SignedOut>`, `<UserButton>`, and mobile auth controls.
- `src/pages/CartPage.jsx` — Link "Proceed to Secure Checkout" button to `/checkout`.

---

## 5. Verification Plan

1. **Build & Dependency Check**:
   - `npm run build` succeeds without bundle or lint errors.
2. **Authentication Flow**:
   - Navigate to `/sign-in` and verify Clerk Sign In component renders with gold/dark styling.
   - Verify Navbar shows Sign In button when logged out and UserButton when logged in.
3. **Profile Page**:
   - Navigate to `/profile` and verify customer tabs (My Orders, Addresses, Account).
4. **Checkout Flow**:
   - Add a product to cart and click "Proceed to Secure Checkout".
   - Verify `/checkout` loads with cart items, pre-filled info if signed in, shipping form, and payment selection.
   - Place order and verify redirect to `/order-confirmation/:id` with order reference.
   - Verify cart is emptied.
   - Navigate to `/admin/orders` and confirm the new order appears in the Admin Dashboard with updated revenue stats.

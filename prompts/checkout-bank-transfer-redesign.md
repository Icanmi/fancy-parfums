# Modern Two-Column Checkout & Bank Transfer Flow — Implementation Prompt

## Goal

Redesign and implement the **Fancy Atelier Parfums Checkout Experience** (`src/pages/CheckoutPage.jsx`) to feature a luxury, Shopify-grade two-column layout on desktop (collapsible/top on mobile), comprehensive form validation, direct bank deposit with one-click copy, automated WhatsApp proof-of-payment redirection, and post-checkout order confirmation and email notification.

---

## 1. Design & Layout Specification

### 1.1 Visual Palette & Typography
- **Background**: Soft warm luxury cream (`#FBF8EF` or `#F7F5F0`) with crisp white form containers (`#FFFFFF`) and hairline borders (`#E5E0D8`).
- **Accent & Borders**: Antique Gold (`#D4AF37`) for active focus rings, selection highlights, and badges.
- **Primary CTA Button**: Premium deep dark red / wine crimson (`#8B1E1E` hover `#721818`, text white, uppercase tracking-wider font-bold).
- **Typography**: Display/Serif typography for section titles and totals; clean sans-serif (Inter) for labels, inputs, and helper tooltips.
- **Form States**:
  - Normal: `#E5E0D8` border, white background.
  - Focus: `#D4AF37` border with soft glow ring (`focus:ring-2 focus:ring-[#D4AF37]/30`).
  - Error: Red border (`border-red-500`) with red subtext (`text-red-500 text-xs mt-1`).

### 1.2 Responsive Layout
- **Desktop (>= 1024px)**:
  - 12-column grid layout:
    - **Left Column (7 cols)**: Form input sections (Contact, Delivery, Shipping method, Payment, Billing address, CTA, Footer policies).
    - **Right Column (5 cols)**: Sticky Order Summary panel with items list, coupon input, subtotal, shipping breakdown, estimated taxes, and prominent NGN total.
- **Mobile (< 1024px)**:
  - Single column with an expandable/collapsible **Order Summary Banner** pinned to the top (displaying cart icon, "Show order summary", and total amount), expanding to reveal item thumbnails and price breakdown on tap.

---

## 2. Component & Section Architecture

### 2.1 Left Column: Form Sections

#### 1. Contact Section
- **Header**: "Contact" with right-aligned "Sign in" link (`/sign-in?redirect=/checkout`). If the user is authenticated via Clerk, display the user's name/email with a "Sign out" or account badge.
- **Input**:
  - `email`: Validated email address. Includes a floating info/help tooltip icon explaining order receipt delivery.
  - Inline error: Red border and message `"Enter an email"` or `"Enter a valid email address"` on blur or failed submit.
- **Checkbox**: `"Email me with news and offers"` (checked by default).

#### 2. Delivery / Shipping Address Section
- **Header**: "Delivery".
- **Segmented Toggle / Tabs**:
  - **Ship** (default active): Shows full delivery address form.
  - **Pickup**: Hides delivery fields and displays Boutique Concierge pickup address (e.g., *Fancy Atelier Parfums Flagship, Victoria Island, Lagos*). Sets shipping fee to ₦0.00.
- **Ship Address Form Fields**:
  - **Country/Region**: Select dropdown, defaulted to `"Nigeria"` (disabled or single-option).
  - **First Name & Last Name**: 2-column inline grid on desktop. Inline validation: `"Enter a first name"`, `"Enter a last name"`.
  - **Company**: Single line, optional.
  - **Address**: Full-width input with street and number. Validated: `"Enter an address"`.
  - **Apartment, suite, etc.**: Single line, optional.
  - **City, State, Postal Code**: 3-column inline grid on desktop:
    - `city`: Text input (e.g., "Ikeja", "Maitama"). Validated: `"Enter a city"`.
    - `state`: Select dropdown populated with all 36 Nigerian states + Abuja FCT. Validated: `"Select a state"`.
    - `postalCode`: Text input, optional.
  - **Phone Number**:
    - Input with country prefix selector (`+234` with Nigerian flag 🇳🇬) and helper tooltip icon. Validated: `"Enter a phone number"`.
- **Checkbox**: `"Save this information for next time"` (saves non-sensitive address fields to `localStorage`).

#### 3. Shipping Method Section
- **Header**: "Shipping method".
- **Radio List Options** (styled as luxury selectable card boxes with radio button, title, delivery window, and formatted price):
  1. **Internal Shipping** (Default selected):
     - Title: `Internal Shipping`
     - Subtext: `2 - 4 Working days (Within Lagos & Abuja)`
     - Price: `₦6,000.00`
  2. **External Shipping**:
     - Title: `External Shipping`
     - Subtext: `5 - 7 Working days (Outside Lagos)`
     - Price: `₦9,000.00`
- Dynamic selection instantly updates the order total in the right summary column.

#### 4. Payment Section
- **Header**: "Payment"
- **Subtext**: `"All transactions are secure and encrypted."`
- **Method: Bank Deposit / Bank Transfer Card**:
  - Encased in a bordered luxury callout box:
    ```text
    Pay with bank transfer
    BANK NAME : OPAY
    ACCOUNT NAME : DENNNIS UWEM  
    ACCOUNT NUMBER : 9121536442
    ```
  - **One-Click Copy**: Interactive button next to the account number with `navigator.clipboard.writeText('9121536442')` and feedback state (*"Copied!"* with checkmark icon and toast).
  - Sub-instruction: `"Please transfer the exact order total. After payment, click 'I've sent the money' below to submit your payment proof on WhatsApp."`

#### 5. Billing Address Section
- **Header**: "Billing address".
- **Radio Group Options**:
  1. `"Same as shipping address"` (Default selected).
  2. `"Use a different billing address"`:
     - Expands smoothly with billing address inputs: Country, First/Last Name, Street Address, City, State, Phone.

#### 6. Submit Action & Footer
- **Primary CTA Button**:
  - Full-width button with Dark Red styling:
    - Background: `#8B1E1E` (hover: `#721818`, active: `#5D1313`).
    - Label: **"I've sent the money"**.
    - Loading state: Spinner with "Processing order…".
- **Post-Submission & WhatsApp Redirection Flow**:
  1. Validate all required form fields.
  2. Create the order record in Supabase / Express backend with payment method `"bank_transfer"` and status `"pending_payment"`.
  3. Save order confirmation to session state so that when the customer returns to the browser tab, the **Order Confirmation Page** (`/order-confirmation/:id`) is shown with complete details and receipt status.
  4. Trigger background client email simulation / backend transactional order email to customer.
  5. Format pre-filled WhatsApp message:
     ```text
     Hello Fancy Atelier Parfums, I have transferred ₦{TOTAL} for Order #{ORDER_NUMBER}.
     Customer Name: {FULL_NAME}
     Phone: {PHONE}
     Items: {ITEM_NAMES}
     I am sending my proof of payment here.
     ```
  6. Open WhatsApp (`https://wa.me/2349121536442?text=...` or configured store WhatsApp number) in a new window/tab, while navigating the current browser tab to `/order-confirmation/:id`.
- **Footer Policy Links**:
  - Inline links: `Refund policy` | `Shipping` | `Privacy policy` | `Terms of service` (opens modal dialogs with official store policies).

---

### 2.2 Right Column: Order Summary Panel

- **Product List**:
  - For each cart item:
    - Thumbnail image (64x64px rounded border) with high-contrast quantity badge overlay in the top-right corner.
    - Product title, size / concentration label (e.g. `Sauvage Eau de Parfum · 100ml`).
    - Line item total: `₦{price * quantity}`.
- **Discount / Coupon Code Section**:
  - Input field with placeholder `"Discount code"` + `"Apply"` button.
  - Active coupon tag (e.g., `ATELIER10 (-10%)` with remove cross button).
- **Price Calculation Breakdown**:
  - **Subtotal**: `₦...`
  - **Shipping**: `₦6,000.00` or `₦9,000.00` (or `Free` for Pickup) with tooltip icon explaining carrier rates.
  - **Estimated taxes**: `₦0.00` (with info tooltip icon).
- **Final Total Section**:
  - Displays `"Total"` with small text `"NGN"` beside a prominent large font formatted price (e.g., `₦136,000.00`).

---

## 3. Form Validation & Interaction Specifications

### 3.1 Field Validation Rules
- `email`: Required, valid email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Error: `"Enter an email"`.
- `firstName`: Required, min 2 chars. Error: `"Enter a first name"`.
- `lastName`: Required, min 2 chars. Error: `"Enter a last name"`.
- `street`: Required, min 4 chars. Error: `"Enter an address"`.
- `city`: Required. Error: `"Enter a city"`.
- `state`: Required, must be a selected Nigerian state. Error: `"Select a state"`.
- `phone`: Required, valid Nigerian phone number (10-14 digits). Error: `"Enter a phone number"`.
- Billing address fields (if `"Use a different billing address"` is selected): validated identically.

### 3.2 Dynamic Interactivity
- Changing shipping method from "Internal" to "External" instantly recalculates the shipping fee and total.
- Changing delivery type from "Ship" to "Pickup" zeros out shipping fee and changes description.
- Clicking the copy button next to Account Number copies `9121536442` to clipboard, swaps button icon to a green checkmark, and triggers a toast: `"Account number copied to clipboard"`.

---

## 4. Implementation Steps

1. **State & Validation Hook in `src/pages/CheckoutPage.jsx`**:
   - Refactor state structure to hold contact, shipping address, pickup preference, shipping method, bank deposit copy state, billing address options, and field-level validation errors.
2. **Implement Two-Column Layout**:
   - Structure container into left column (`lg:w-[58%]`) and right summary panel (`lg:w-[42%]`) with border dividers.
   - Add mobile collapsible toggle with chevron and live total.
3. **Build Individual Form Sections**:
   - Contact with Sign-in link and news checkbox.
   - Delivery tabs ("Ship" vs "Pickup") + Nigerian address grid.
   - Shipping method selectable radio cards (₦6,000 vs ₦9,000).
   - Bank deposit callout with OPay account details and copy button.
   - Billing address radio toggle with collapsible custom address form.
   - Dark red button `"I've sent the money"`.
4. **Order Placement & WhatsApp Redirection Flow**:
   - Construct order payload matching database schema (`orders` and `order_items`).
   - Persist order via `persistOrder` / `addOrder`.
   - Assemble formatted WhatsApp text URI.
   - Launch WhatsApp link and navigate customer to `/order-confirmation/:id`.
5. **Confirmation & Email Notifications**:
   - Ensure `OrderConfirmationPage.jsx` displays the bank deposit summary, WhatsApp proof submission status, and instructions on order processing.
   - Simulate/dispatch transactional order summary email to `customerEmail`.
6. **Policy Modals / Links**:
   - Connect footer policy links (Refund, Shipping, Privacy, Terms) to clean modal overlays.
7. **Build Validation & Verification**:
   - Run `npm run build` to ensure zero compilation or styling errors.
   - Perform end-to-end checkout submission test.

---

## 5. Verification Checklist

- [ ] Desktop layout shows two columns with sticky order summary on the right.
- [ ] Mobile layout displays collapsible order summary at top with live total.
- [ ] Empty required fields highlight with red borders and show specific error messages.
- [ ] Internal Shipping computes ₦6,000; External Shipping computes ₦9,000.
- [ ] Bank details (OPay, Dennis Uwem, 9121536442) display prominently with working one-click copy.
- [ ] Clicking "I've sent the money" validates the form, saves the order, opens WhatsApp with order details, and displays order confirmation.
- [ ] Order confirmation renders order number, bank transfer summary, and allocated items.

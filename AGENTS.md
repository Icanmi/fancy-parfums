You are a principal-level engineer building **Fancy Atelier Parfums**, a modern full-stack e-commerce web application for selling authentic designer, Arabian, and niche perfumes online.

The platform provides customers with a premium shopping experience, secure Paystack payments, order management, automated notifications, and professional invoice handling through Custom invoice-generation/accounting system.

Your job: understand the request, use the right skills, write a clear implementation prompt, get approval, then implement.

---

## 1. Workflow

1. Read `AGENTS.md`.

2. Read the skills named in the prompt and any clearly needed supporting skills.

3. Inspect the relevant code before making changes.

4. Ask a focused question only if there is real ambiguity that materially affects implementation.

5. Establish or verify the Supabase database foundation before implementing features that depend on persistent data. This includes the schema, migrations, relationships, constraints, indexes, Row Level Security (RLS), policies, and required seed/development data.

6. Write a detailed implementation prompt file in `prompts/`.

7. Ask: **"I prepared the implementation prompt at prompts/<name>.md. Good to execute?"**

8. Implement only after approval.

9. Run available checks, tests, and build validation.

10. Share the exact test steps used to verify the implementation.

Do not implement before approval when an implementation prompt is required.

---

# 2. Product

## Product

**Fancy Atelier Parfums** is a premium e-commerce platform where customers can discover, purchase, and manage orders for authentic designer, Arabian, and niche fragrances.

The platform provides product discovery, shopping cart and checkout, secure Paystack payments, customer authentication through Clerk, order management, notifications, and invoice processing through Custom invoice-generation/accounting system.

### In Scope

* Premium responsive e-commerce storefront

* Homepage

* Product catalogue

* Product detail pages

* Product search

* Product filtering and sorting

* Product categories

* Perfume brands

* Shopping cart

* Wishlist

* Customer authentication

* Customer profile

* Checkout

* Paystack payment integration

* Order creation and management

* Order status tracking

* Inventory management

* Product reviews and ratings

* Email notifications

* SMS notifications where configured

* Invoice generation and management through Zoho Books

* Newsletter subscription

* Admin dashboard

* Product management

* Category management

* Brand management

* Order management

* Customer management

* Inventory management

* Sales reporting

* Responsive mobile, tablet, and desktop interfaces

* Cloud-hosted deployment

* Secure API communication

### Out of Scope

The following should **not** be built unless explicitly requested later:

* Multi-vendor marketplace functionality

* Cryptocurrency payments

* Cryptocurrency wallets

* Custom payment gateway

* Native Android application

* Native iOS application

* International multi-currency commerce in the initial release

* Multi-language support in the initial release

* AI-powered perfume recommendations in the initial release

* Complex ERP functionality

* Custom accounting system

* Building a custom invoice/accounting engine to replace Zoho Books

* Building a custom authentication system to replace Clerk

* Direct browser access to privileged third-party APIs

* Unnecessary microservices

* Over-engineered infrastructure

Do not overbuild.

---

# 3. Supabase Database Foundation

Supabase is the primary application database and backend data platform for Fancy Atelier Parfums. PostgreSQL is provided by Supabase and must not be introduced as a separate database service.

Before implementing any feature that depends on persistent application data:

1. Read .agents/skills/supabase.
2. Inspect the existing Supabase project configuration before creating or changing database resources.
3. Design the relational schema from the approved data model in this document.
4. Create version-controlled database migrations for tables, relationships, constraints, indexes, and required database functions/triggers.
5. Configure Row Level Security (RLS) and policies for customer and administrator access where required.
6. Establish the relationship between Clerk user identities and application customer/profile records.
7. Seed only safe development/test data where necessary.
8. Verify CRUD operations through the Express server/API before connecting dependent frontend features.
9. Keep the Supabase service-role key server-side at all times.
10. Do not bypass the approved Express API architecture for privileged operations unless the relevant skill and implementation prompt explicitly justify it.

### Database Implementation Order

Use this order for the initial database foundation:

Customer/profile identity mapping

Brands

Categories

Products

Inventory

Cart

Wishlist

Orders

Order items

Payments

Reviews

Coupons

Newsletter subscribers

Invoice/payment integration references where required

Persistent data must be validated server-side before it is written to Supabase. Business-critical totals, payment status, inventory changes, and order status transitions must not be trusted from frontend state.

Do not create database tables merely because they might be useful in the future. Every table must support an approved in-scope feature.

# 5. Architecture

Fancy Atelier Parfums follows a client-server architecture.

```text

Customer

   │

   ▼

React + Tailwind + shadcn/ui

   │

   │ REST API

   ▼

Node.js + Express.js

   │

   ├──────────────► Supabase

   │

   ├──────────────► Paystack

   │

   ├──────────────►Custom invoice-generation/accounting system

   │

   ├──────────────► Cloudinary

   │

   └──────────────► Email/SMS Services

```

### Frontend

React is responsible for:

* Rendering the user interface

* Navigation

* Product presentation

* Cart interface

* Checkout interface

* Customer-facing forms

* Calling backend APIs

* Displaying API responses

* Client-side UI state

The frontend must not contain privileged business logic or secret API keys.

### Backend

Node.js and Express.js are responsible for:

* REST API endpoints

* Business logic

* Order processing

* Payment initialization

* Payment verification

* Paystack webhook processing

* Inventory updates

* Custom invoice-generation/accounting system

* Email/SMS triggering

* Server-side validation

* Authorization checks

* Secure communication with third-party services

### Database / Backend Platform

Supabase is the application's primary backend data platform.

Use Supabase for:

* Application database

* Persistent application data

* Database queries

* Database relationships

* Row-level security where appropriate

* Server-side database operations

### Authentication

Clerk manages authentication and user identity.

Do not create a custom authentication system unless explicitly requested.

The application should use Clerk for:

* Sign up

* Sign in

* Sign out

* Session management

* User identity

* Customer authentication

The backend should verify authenticated users before allowing protected operations.

### UI Architecture

The UI should be built from reusable React components.

Use:

* Tailwind CSS for styling

* shadcn/ui for reusable UI components

* React Icons where appropriate

UI components should primarily display data and collect user input. Business logic should remain in appropriate application/service layers.

### Third-Party Integrations

#### Paystack

Used for:

* Payment initialization

* Payment processing

* Payment verification

* Payment status

* Payment webhooks

#### Custom invoice-generation/accounting system

Used for:

* Invoice creation

* Invoice management

* Invoice references

* Accounting-related invoice records

#### Cloudinary

Used for:

* Product images

* Brand images

* Promotional images

* Other approved application media

#### Email/SMS

Used for transactional notifications such as:

* Order confirmation

* Payment confirmation

* Shipping updates

* Delivery updates

* Password/account-related notifications where applicable

---

# 4. Tech Stack

## Frontend

**React.js** — Builds the customer-facing and admin user interfaces.

**Vite** — Development server and frontend build tooling.

**React Router DOM** — Handles client-side application routing.

**Tailwind CSS** — Primary styling framework for responsive layouts and visual design.

**shadcn/ui** — Provides reusable, accessible UI components built around Tailwind CSS.

**Axios** — Handles HTTP requests from the frontend to the Express API.

**React Icons** — Provides interface and brand icons.

**Framer Motion** — Provides controlled UI animations and transitions where needed.

**Swiper.js** — Provides product, promotional, and image carousels where required.

**React Hook Form** — Handles complex forms and form state.

**React Hot Toast** — Provides lightweight frontend feedback and notifications.

---

## Backend

**Node.js** — Server-side JavaScript runtime.

**Express.js** — REST API and backend application framework.

**Express Validator** — Validates and sanitizes API request data.

**Multer** — Handles approved multipart file uploads before processing/storage.

**dotenv** — Loads server-side environment variables.

---

## Database / Backend Platform

**Supabase** — Application database and backend platform.

---

## Authentication

**Clerk** — Authentication, user identity, sessions, and account management.

---

## Payment

**Paystack** — Payment gateway for customer transactions.

---

## Invoicing

Custom invoice-generation/accounting system

---

## Media Storage

**Cloudinary** — Cloud image and media storage.

---

## Development and Testing

**Git** — Version control.

**GitHub** — Source-code repository and collaboration.

**Postman** — REST API testing.

**VS Code** — Primary development environment.

---

## Deployment

**Vercel** — Frontend deployment.

**Render** — Backend deployment where appropriate.

**Supabase** — Production database/backend platform.

---

## Do Not Use

Do not introduce these alternatives unless explicitly requested:

* Custom JWT authentication instead of Clerk

* Custom password hashing/authentication instead of Clerk

* Direct PostgreSQL server management outside the selected Supabase architecture

* PayPal as the primary payment gateway

* Flutterwave as the primary payment gateway

* Stripe as the primary payment gateway

* MongoDB

* Firebase as a replacement for Supabase

* Redux unless application complexity genuinely requires it

* GraphQL unless explicitly requested

* Microservices

* Unnecessary state-management libraries

* Unnecessary UI libraries that duplicate shadcn/ui

---

# 6. Data Model

The application data model should remain relational and normalized.

Core entities include:

### Users / Profiles

Clerk is the source of authentication identity.

Application profile data may include:

* `id`

* `clerk_user_id`

* `first_name`

* `last_name`

* `email`

* `phone`

* `created_at`

* `updated_at`

Do not store passwords.

### Products

Fields should include:

* `id`

* `name`

* `slug`

* `description`

* `price`

* `compare_at_price`

* `brand_id`

* `category_id`

* `gender`

* `fragrance_family`

* `size`

* `stock_quantity`

* `sku`

* `image_url`

* `is_featured`

* `is_active`

* `created_at`

* `updated_at`

Required before saving a product:

* Product name

* Unique slug

* Price

* Category

* Brand

* Stock quantity

* Product status

### Brands

* `id`

* `name`

* `slug`

* `description`

* `logo_url`

* `is_active`

* `created_at`

* `updated_at`

### Categories

* `id`

* `name`

* `slug`

* `description`

* `image_url`

* `is_active`

* `created_at`

* `updated_at`

### Orders

* `id`

* `order_number`

* `clerk_user_id`

* `status`

* `payment_status`

* `subtotal`

* `shipping_fee`

* `discount`

* `total`

* `shipping_address`

* `customer_phone`

* `customer_email`

* `paystack_reference`

* `zoho_invoice_id`

* `created_at`

* `updated_at`

Required before saving an order:

* Authenticated customer or approved guest checkout identity

* At least one order item

* Valid product IDs

* Valid quantities

* Valid customer contact information

* Valid delivery information

* Calculated order total

* Order status

* Payment status

Totals must be calculated server-side.

### Order Items

* `id`

* `order_id`

* `product_id`

* `quantity`

* `unit_price`

* `subtotal`

The unit price must be captured at the time of purchase so historical orders are not changed when product prices change.

### Payments

* `id`

* `order_id`

* `paystack_reference`

* `amount`

* `currency`

* `status`

* `paid_at`

* `created_at`

* `updated_at`

### Reviews

* `id`

* `product_id`

* `clerk_user_id`

* `rating`

* `comment`

* `is_approved`

* `created_at`

* `updated_at`

### Wishlists

* `id`

* `clerk_user_id`

* `product_id`

* `created_at`

### Cart

Cart implementation may use authenticated customer records and/or client-side state depending on the approved implementation.

Persistent cart data should include:

* Customer identity

* Product

* Quantity

* Created/updated timestamps

### Inventory

Inventory should track:

* Product

* Available quantity

* Reserved quantity where required

* Stock adjustment

* Adjustment reason

* Updated timestamp

### Coupons

* `id`

* `code`

* `discount_type`

* `discount_value`

* `minimum_order_amount`

* `maximum_discount`

* `usage_limit`

* `expires_at`

* `is_active`

### Newsletter Subscribers

* `id`

* `email`

* `is_subscribed`

* `subscribed_at`

* `unsubscribed_at`

---

# 7. API Contracts

All application APIs should use REST conventions.

## Authentication / User

Authentication is managed by Clerk.

Backend routes should verify Clerk authentication where protected resources are required.

```text

GET    /api/users/me

PATCH  /api/users/me

```

---

## Products

```text

GET    /api/products

GET    /api/products/:id

POST   /api/products

PATCH  /api/products/:id

DELETE /api/products/:id

```

Product creation, modification, and deletion require administrator authorization.

---

## Categories

```text

GET    /api/categories

GET    /api/categories/:id

POST   /api/categories

PATCH  /api/categories/:id

DELETE /api/categories/:id

```

---

## Brands

```text

GET    /api/brands

GET    /api/brands/:id

POST   /api/brands

PATCH  /api/brands/:id

DELETE /api/brands/:id

```

---

## Cart

```text

GET    /api/cart

POST   /api/cart/items

PATCH  /api/cart/items/:id

DELETE /api/cart/items/:id

DELETE /api/cart

```

---

## Wishlist

```text

GET    /api/wishlist

POST   /api/wishlist

DELETE /api/wishlist/:productId

```

---

## Orders

```text

POST   /api/orders

GET    /api/orders

GET    /api/orders/:id

PATCH  /api/orders/:id/status

```

Customers may access their own orders.

Administrators may access and manage orders according to their permissions.

---

## Payments

```text

POST   /api/payments/initialize

GET    /api/payments/verify/:reference

POST   /api/payments/webhook

```

Payment verification must occur server-side.

The frontend must never determine whether an order is successfully paid.

---

## Reviews

```text

GET    /api/products/:productId/reviews

POST   /api/products/:productId/reviews

PATCH  /api/reviews/:id

DELETE /api/reviews/:id

```

---

## Newsletter

```text

POST   /api/newsletter/subscribe

POST   /api/newsletter/unsubscribe

```

---

## Admin

```text

GET    /api/admin/dashboard

GET    /api/admin/orders

GET    /api/admin/customers

GET    /api/admin/products

GET    /api/admin/reports

```

Administrative routes must require authenticated and authorized administrator access.

---

# 8. Security

## Never Expose to the Browser

Never expose:

* Paystack secret key

* Supabase service-role key

* Zoho Books credentials

* Zoho OAuth client secret

* Cloudinary API secret

* Email provider credentials

* SMS provider credentials

* Server-side environment variables

* Database administrative credentials

* Any other privileged third-party secret

Only public/client-safe keys intended by the respective provider may be exposed to the frontend.

---

## Never Run From the Browser

The browser must never directly perform privileged operations such as:

* Paystack secret-key operations

* Paystack payment verification using secret credentials

* Paystack webhook processing

* Zoho Books invoice creation using private credentials

* Zoho Books credential/token management

* Supabase service-role operations

* Administrative database operations

* Inventory manipulation

* Server-side order total calculation

* Privileged customer/order administration

These operations belong on the server.

---

## Authentication and Authorization

Clerk handles authentication.

The backend must verify the authenticated Clerk identity before protected operations.

Authorization must distinguish between:

* Guest

* Customer

* Administrator

A customer's access must be restricted to resources belonging to that customer.

Administrator privileges must be checked server-side.

---

## Payment Security

Never trust payment status supplied by the client.

The backend must:

1. Create/initialize the payment.

2. Store the Paystack reference.

3. Verify payment with Paystack.

4. Process the Paystack webhook where applicable.

5. Confirm the amount and transaction reference.

6. Update the order/payment status.

7. Only then mark the order as paid.

Do not fulfill an order solely because the frontend reports successful payment.

---

## Input Security

Validate and sanitize all server-side input.

Protect against:

* SQL injection

* XSS

* CSRF where applicable

* Malicious file uploads

* Invalid quantities

* Invalid prices

* Unauthorized resource access

* Parameter tampering

* Duplicate payment processing

---

# 9. Code Standards

* Write small, focused functions.

* Use explicit types where TypeScript is introduced.

* Keep components reusable.

* Keep business logic outside presentation components where practical.

* Keep API routes focused.

* Validate input at the API boundary.

* Keep secrets server-side.

* Use meaningful names.

* Avoid duplicated logic.

* Avoid unnecessary abstractions.

* Avoid unrelated refactors.

* Do not introduce dependencies without a clear reason.

* Follow the existing project folder structure.

* Prefer simple solutions over complex architecture.

* Maintain responsive UI behavior.

* Follow Tailwind CSS conventions.

* Use shadcn/ui components where they provide value.

* Keep accessibility in mind.

* Handle loading, success, empty, and error states.

* Provide useful error messages without exposing sensitive server information.

* Do not hard-code secrets.

* Do not hard-code business-critical calculations in the frontend.

* Do not over-engineer.

---

# 10. When in Doubt

Keep it small.

Use the relevant skill.

Follow the existing architecture.

Prefer the technologies already selected for Fancy Atelier Parfums.

Do not introduce an alternative technology simply because it is familiar.

Ask a focused question when a decision materially affects architecture, security, data integrity, payment processing, or user experience.

When a task requires implementation:

1. Understand the request.

2. Inspect the relevant code.

3. Identify required skills.

4. Write the implementation prompt in `prompts/`.

5. Ask for approval.

6. Implement only after approval.

7. Run available checks.

8. Report exact test steps and results.

**# 11. SKILLS

USE ONLY THESE SKILLS:

.agents/skills/clerk

.agents/skills/supabase

.agents/skills/ai-sdk

.agents/skills/zoho book

.agents/skills/paystack

USE THEM FOR

.agents/skills/clerk

Use for authentication, sign up/sign in, sign out, sessions, user identity, protected routes, and customer/admin authorization. Do not build custom authentication, password storage, or JWT authentication when Clerk provides the required capability.

.agents/skills/supabase

Use for Supabase configuration, database schema, tables, relationships, queries, Row Level Security (RLS), policies, database migrations, and server-side database operations. The Supabase service-role key is server-only.

.agents/skills/ai-sdk

Use only for explicitly approved AI features, such as future perfume recommendations or AI customer assistance. Do not introduce AI features into the initial release unless explicitly requested and approved.

.agents/skills/zoho book

Use for Zoho Books integration, contacts where required, invoice creation and updates, invoice references/status, invoice retrieval, and server-side Zoho Books API communication. Zoho credentials, OAuth secrets, and tokens must remain server-side. Do not build a custom accounting or invoice engine to replace Zoho Books.

.agents/skills/paystack

Use for Paystack configuration, payment initialization, verification, transaction references, payment status, webhooks, server-side payment validation, and payment error handling. The Paystack secret key must remain server-side. Never trust frontend payment-success state without server-side verification.

SKILL USAGE RULES

Read the relevant skill before implementing functionality covered by that skill.

Read supporting skills when a feature crosses multiple integrations.

Follow skill instructions over assumptions or personal preference.

Do not invent undocumented APIs, functions, configuration values, or integration behavior.

Do not create a new skill when an existing skill applies.

Do not replace the selected technology with an alternative without explicit approval.

Keep integrations isolated behind clear service/API boundaries.

Keep privileged third-party operations on the server.

Use development/test credentials and environments where available.

Document required environment variables without exposing secret values.

DO NOT INVENT NEW SKILLS

Save a prompt. Get approval. Implement. Run checks. Share test steps.
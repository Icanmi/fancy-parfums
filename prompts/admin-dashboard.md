# Admin Dashboard — Implementation Prompt

## Goal

Build a fully functional, premium frontend-only Admin Dashboard for **Fancy Atelier Parfums** with the following six management modules:

1. **Product Management** — CRUD interface for perfume products
2. **Category Management** — CRUD interface for categories
3. **Brand Management** — CRUD interface for brands
4. **Order Management** — View & update order statuses
5. **Customer Management** — View customer list and profiles
6. **Inventory Management** — Stock level tracking and adjustments

---

## Scope & Constraints

- **Frontend only** — all data from existing static data files in `src/data/`. Orders and customers will use realistic mock data arrays defined locally in the admin module.
- **No backend integration yet** — no Supabase, no Paystack, no Clerk calls. Mock all data in-memory.
- **No Clerk auth gate yet** — a simple `/admin` route. Admin authentication will be wired in a future sprint.
- **No new npm packages** — use existing: React Router DOM, Framer Motion, React Icons, React Hook Form, React Hot Toast, Tailwind CSS.
- **Design language** — matches existing site: dark sidebar `#0A0A0A`, gold accent `#D4AF37`, cream body `#FBF8EF`, Inter/Playfair fonts.
- **Do not overbuild** — no Redux, no GraphQL, no unnecessary abstractions.

---

## Route Structure

```
/admin                      redirect to /admin/dashboard
/admin/dashboard            Overview / Stats
/admin/products             Product list
/admin/products/new         Add product form
/admin/products/:id/edit    Edit product form
/admin/categories           Category list
/admin/categories/new       Add category form
/admin/categories/:id/edit  Edit category form
/admin/brands               Brand list
/admin/brands/new           Add brand form
/admin/brands/:id/edit      Edit brand form
/admin/orders               Order list + status update
/admin/orders/:id           Order detail view
/admin/customers            Customer list + profile view
/admin/inventory            Inventory adjustments
```

All admin routes share a persistent **AdminLayout** (dark sidebar + top bar). Main site routes are completely separate and unaffected.

---

## File Structure to Create

```
src/
  pages/admin/
    AdminDashboardPage.jsx
    AdminProductsPage.jsx
    AdminProductFormPage.jsx
    AdminCategoriesPage.jsx
    AdminCategoryFormPage.jsx
    AdminBrandsPage.jsx
    AdminBrandFormPage.jsx
    AdminOrdersPage.jsx
    AdminOrderDetailPage.jsx
    AdminCustomersPage.jsx
    AdminInventoryPage.jsx
  components/admin/
    AdminLayout.jsx
    AdminSidebar.jsx
    AdminStatCard.jsx
    AdminDataTable.jsx
    AdminStatusBadge.jsx
  context/
    AdminDataContext.jsx
  data/
    adminMockData.js
```

---

## Module Specifications

### AdminLayout
- Fixed left sidebar `w-64` dark `#0A0A0A`.
- Gold logo + "Fancy Atelier Admin" at top.
- Nav links with React Icons: Dashboard, Products, Categories, Brands, Orders, Customers, Inventory, Back to Store.
- Active link: gold left border + gold text.
- Top bar: page title + admin avatar placeholder.
- Main content: scrollable, `bg-[#F5F3EE]`.
- Responsive: sidebar collapses on mobile.

### Dashboard Overview
- 4 Stat cards: Total Products, Total Orders, Total Customers, Total Revenue (mock ₦).
- Recent Orders table (last 5).
- Low Stock Alerts (products with stockQuantity <= 10).
- Framer Motion micro-animations on cards.

### Product Management
List: search, filter by category/brand/status, sortable columns, Edit/Delete/Toggle actions, pagination 10/page.
Form: React Hook Form with all fields (name, slug auto-gen, description, price, compareAtPrice, brand select, category select, gender, fragranceFamily, concentration, size, stockQuantity, sku, imageUrl, isFeatured, isActive).

### Category Management
List: Name, Slug, Product Count, Status, Actions.
Form: Name, Slug (auto), Description, Image URL, Is Active.

### Brand Management
List: Name, Origin, Status, Actions.
Form: Name, Slug (auto), Description, Logo URL, Is Active.

### Order Management
List: Order #, Date, Customer, Total, Payment Status, Order Status, inline status update.
Filter by status. Click row → detail page.
Detail: customer info, order items table, order summary, status timeline, update status.
15 mock orders with realistic Nigerian data.

### Customer Management
List: Name, Email, Phone, Orders Count, Total Spent, Joined.
Search by name/email. View profile inline.
20 mock customers.

### Inventory Management
Table: Product, Brand, SKU, Stock, Status badge (In Stock >= 10, Low Stock 1-9, Out of Stock = 0).
Inline stock adjustment per row. Export CSV button.
Filter by status.

---

## State Management

Use `AdminDataContext` (React Context + useState):
- products, brands, categories, orders, customers state
- addProduct, updateProduct, deleteProduct, updateOrderStatus, updateStock CRUD actions

---

## App.jsx Changes

Add nested admin routes under `<Route path="/admin" element={<AdminLayout />}>` with Navigate redirect from index.

---

## Verification Plan

1. `/admin` redirects to `/admin/dashboard` with stat cards.
2. `/admin/products` shows product table with search/filter.
3. Add/Edit/Delete product flows work with toast feedback.
4. `/admin/categories` and `/admin/brands` same CRUD flow.
5. `/admin/orders` shows 15 mock orders, filterable, inline status update.
6. Order detail page shows full order info and timeline.
7. `/admin/customers` shows 20 customers, searchable.
8. `/admin/inventory` shows all products with stock badges, inline adjustment works.
9. Main site routes `/`, `/shop` completely unaffected.
10. `npm run build` completes without errors.

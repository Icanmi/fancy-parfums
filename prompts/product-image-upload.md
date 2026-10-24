# Product Image Upload (Folder & URL) — Implementation Prompt

## Goal

Enhance the **Media & Settings** section in the Admin Product Form ([`src/pages/admin/AdminProductFormPage.jsx`](file:///c:/Users/LENOVO/perfumeE-com/src/pages/admin/AdminProductFormPage.jsx)) so that administrators can upload product images directly from their device/folder via a file picker or drag-and-drop, in addition to entering an image URL.

---

## Proposed Solution

1. **Dual-Mode Image Input**:
   - **Upload from Device**: Drag-and-drop zone + file browser button for local images (`.png`, `.jpg`, `.jpeg`, `.webp`).
   - **Image URL**: Text input for direct web/CDN URLs (preserving existing capability).
   - Clean tab/toggle button to switch between "Upload File" and "Image URL".

2. **Client-Side File Processing & Preview**:
   - When an admin selects or drops an image file, read it using `FileReader.readAsDataURL()`.
   - Set the resulting base64 data URL into the form's `image` field so it displays immediately across the storefront, product catalog, and admin tables.
   - Show a live preview with perfume bottle aspect ratio, file name/size badge, and a "Change / Remove" action button.
   - Validate file type (images only) and size (e.g., maximum 5MB) with hot-toast notifications for invalid files.

3. **Component Architecture**:
   - Create a reusable [`src/components/admin/AdminImageUpload.jsx`](file:///c:/Users/LENOVO/perfumeE-com/src/components/admin/AdminImageUpload.jsx) component that integrates cleanly with `react-hook-form` via `value` and `onChange`.
   - Update [`src/pages/admin/AdminProductFormPage.jsx`](file:///c:/Users/LENOVO/perfumeE-com/src/pages/admin/AdminProductFormPage.jsx) to replace the basic text input with `AdminImageUpload`.

4. **Design & Aesthetics**:
   - Consistent with Fancy Atelier Parfums admin design language (`#0A0A0A`, `#D4AF37` gold accents, subtle dashed borders, clean typography).
   - Drag-over state highlighting in gold border.

---

## File Changes

- **[NEW]** `src/components/admin/AdminImageUpload.jsx` — Drag-and-drop / file picker + URL toggle with live image preview.
- **[MODIFY]** `src/pages/admin/AdminProductFormPage.jsx` — Replace text input in "Media & Settings" with `AdminImageUpload`.

---

## Verification Plan

1. Open `/admin/products/new`.
2. Verify the "Media & Settings" section displays the new image uploader with "Upload File" and "Image URL" options.
3. Test selecting an image file from a local folder: verify preview appears and file details display.
4. Test drag-and-drop: drag an image into the drop area and verify it loads.
5. Test switching to "Image URL": verify entering a URL updates the preview.
6. Submit the form: verify the newly created product has the uploaded image visible in the product table.
7. Open `/admin/products/:id/edit`: verify existing product image loads into the preview and can be replaced or cleared.
8. Run `npm run build` to confirm zero errors.

# Fix Frontend ↔ Backend Mismatches & Bugs

The frontend and backend were built with mismatched data models. The backend (Prisma schema) is the source of truth. The frontend has types, forms, and pages that reference fields that **do not exist** in the backend API responses.

## Summary of Issues Found

### 1. Product Model Mismatch (Critical)
The **backend** `Product` schema has: `name`, `sku`, `category`, `unitPrice`, `currentStock`, `minStockAlert`, `location`

The **frontend** `Product` type expects: `name`, `sku`, `description`, `unit`, `price`, `hsnCode`, `taxRate`, `stockQty`

**None of these overlap correctly** — field names are different (`unitPrice` vs `price`, `currentStock` vs `stockQty`) and the frontend expects fields that don't exist in the DB (`description`, `unit`, `hsnCode`, `taxRate`). The form sends wrong fields, the list reads wrong fields.

### 2. Inventory/StockMovement Model Mismatch (Moderate)
- Backend returns `reason` field on stock movements
- Frontend expects `referenceInfo` and `notes` fields
- Frontend `InventoryPage.tsx` line 95 reads `mov.referenceInfo` — but backend returns `mov.reason`

### 3. Challan Model Mismatch (Critical)
- Backend returns `totalQuantity` — frontend expects `total`, `subtotal`, `taxTotal`
- Backend challan items use `productNameSnap`, `productSkuSnap`, `unitPriceSnap` — frontend expects `snapshotName`, `snapshotSku`, `snapshotPrice`, `snapshotTaxRate`
- Frontend `ChallansPage.tsx` line 113: `challan.total.toFixed(2)` → crashes because backend returns `totalQuantity`, not `total`
- Frontend `ChallanFormPage.tsx` line 102: `challanDetails.total.toFixed(2)` → same crash
- Backend returns `user` (for `createdBy` relation) — frontend type expects `createdBy` as an object

### 4. Mock Login Fallback Has Wrong Emails/Passwords (Minor)
[auth.api.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/features/auth/auth.api.ts) mock fallback uses `admin@erp.com` and passwords like `Admin@123`, but the real accounts use `admin@minierp.com` and `password123`. The fallback will also bypass actual API login if the backend briefly fails.

### 5. `followUpDate` Validation (Minor)
Backend `customer.schema.ts` expects `z.string().datetime()` for `followUpDate`. The frontend form uses `<input type="datetime-local">` which produces a format like `2024-01-01T12:00` (no timezone), which `.datetime()` may reject.

---

## Proposed Changes

### Frontend Types (align to backend schema)

#### [MODIFY] [product.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/types/product.ts)
- Rename fields to match backend: `price` → `unitPrice`, `stockQty` → `currentStock`
- Add `category`, `minStockAlert`, `location`
- Remove non-existent fields: `description`, `unit`, `hsnCode`, `taxRate`

#### [MODIFY] [inventory.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/types/inventory.ts)
- Replace `referenceInfo` and `notes` with `reason` (single field matching backend `StockMovement.reason`)

#### [MODIFY] [challan.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/types/challan.ts)
- `ChallanItem`: rename `snapshotName` → `productNameSnap`, `snapshotSku` → `productSkuSnap`, `snapshotPrice` → `unitPriceSnap`; remove `snapshotTaxRate`
- `Challan`: replace `subtotal`, `taxTotal`, `total` with `totalQuantity`; rename `createdById` → `createdBy`; `createdBy?` → `user?`; remove `validUntil`, `notes` (not in Prisma schema)

---

### Frontend Validation Schemas (align to backend)

#### [MODIFY] [product.validation.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/features/products/product.validation.ts)
- Replace `price`, `unit`, `hsnCode`, `taxRate`, `description` with `unitPrice`, `category`, `minStockAlert`, `location`

#### [MODIFY] [inventory.validation.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/features/inventory/inventory.validation.ts)
- Replace `referenceInfo` and `notes` with single `reason` field

---

### Frontend Pages (fix field references)

#### [MODIFY] [ProductsPage.tsx](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/pages/Products/ProductsPage.tsx)
- Replace `product.description` → `product.category`
- Replace `product.unit` column → `product.category` column (header change too)
- Replace `product.price` → `product.unitPrice`
- Replace `product.stockQty` → `product.currentStock`

#### [MODIFY] [ProductFormPage.tsx](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/pages/Products/ProductFormPage.tsx)
- Replace `price` field → `unitPrice`; remove `unit`, `hsnCode`, `taxRate`, `description` fields
- Add `category`, `minStockAlert`, `location` fields

#### [MODIFY] [InventoryPage.tsx](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/pages/Inventory/InventoryPage.tsx)
- Replace `mov.referenceInfo` → `mov.reason`

#### [MODIFY] [AddMovementModal.tsx](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/pages/Inventory/AddMovementModal.tsx)
- Replace `referenceInfo` and `notes` fields with single `reason` field

#### [MODIFY] [ChallansPage.tsx](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/pages/Challans/ChallansPage.tsx)
- Replace `challan.total.toFixed(2)` → `challan.totalQuantity` (display as quantity count, not currency)
- Change column header "Total Value" → "Total Qty"

#### [MODIFY] [ChallanFormPage.tsx](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/pages/Challans/ChallanFormPage.tsx)
- View mode: fix snapshot field references (`snapshotName` → `productNameSnap`, etc.)
- Fix `total` → `totalQuantity`
- Fix price calculation in create mode: use `product.unitPrice` instead of `product.price`

---

### Frontend Auth (fix mock fallback)

#### [MODIFY] [auth.api.ts](file:///c:/Users/Dev%20Verma/Desktop/Mini-CRM-Submission/frontend/src/features/auth/auth.api.ts)
- Update mock emails to `@minierp.com` domain
- Update mock password to `password123`
- Fix operator precedence bug on line 22 (missing parentheses around the `||` chain)

---

## Verification Plan

### Manual Verification
1. Start both frontend (`npm run dev`) and backend (`npm run dev`)
2. Login with `admin@minierp.com` / `password123`
3. Navigate to each page (Customers, Products, Inventory, Challans) and verify no crashes
4. Create a product, verify it shows in the list with correct fields
5. Create a stock movement, verify it shows with the "reason" field
6. Create a challan, verify the draft shows correctly and can be confirmed

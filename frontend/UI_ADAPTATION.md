# Final frontend UI adaptation

The UI reference was the supplied `frontend.zip`. Its layouts, orange/charcoal styling,
Inter font, icons and product image assets were adapted to the existing college application.
The backend and database schema were not changed.

## Preserved college contracts

- API base: `VITE_API_BASE_URL`, falling back to `http://localhost:8081`.
  Existing environment files, Vite configuration, package dependencies and API client remain unchanged.
- Cookie sessions (`withCredentials: true`), login, immediate registration login and logout.
  Existing CUSTOMER, STAFF and ADMIN route restrictions remain in place.
- Product/category CRUD with archive/restore. Product submissions retain the nested
  `category: { categoryId }` payload and do not submit stock quantities.
- Catalogue filters, sorting and pagination operate locally over the existing product array API.
  No `/api/products/browse` endpoint is required.
- Inventory consumes `{ inventoryId, product, quantityOnHand, reorderLevel, lastUpdated }` rows.
  Stock updates use the existing inventory endpoint with `{ quantity }`; reorder levels are read-only.
- Cart quantities use the existing query parameters. Checkout still creates an order directly,
  without shipping, delivery, payment or collection fields.
- Order management uses only PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED and CANCELLED.
  Cancellation now calls the already-implemented `/api/orders/{id}/cancel` endpoint, which restores stock.
- User role/account-status updates keep the existing endpoints and own-account restrictions.

The login page also retains the requested destination when signing in from a protected page.
Cart controls are disabled while a change is in progress.

## Reference features excluded

Google login, registration OTP, password reset, account editing, image upload, admin user creation,
dashboard APIs, fulfilment/payment forms and READY_FOR_COLLECTION were not imported.
The personal fork's API/configuration files and contact details were not copied.

## Assets

Inter is self-hosted under `public/fonts/inter/` with its supplied OFL license and README.
Reference product images are available under `public/images/products/`. Product cards still use
image URLs returned by the college backend; no database image URLs or product records were altered.
The homepage uses a bundled drill photograph as an illustrative banner.

## Verification

- `npm run lint` and `npm run build` passed.
- Browser checks at desktop (1440px) and mobile (390px) sizes covered catalogue filters/pagination,
  protected routes, login return paths, registration/logout, add-to-cart, quantity updates,
  checkout errors/success, customer order items, product creation/archive/restore,
  category creation, nested inventory/stock updates, user role/status controls and order status/cancellation.
- Four browser contexts issued 107 requests using mocked responses matching the college controllers.
  No unsupported API endpoints, runtime page errors or document-level horizontal overflow were observed.
- Live backend/database integration was not tested: the backend was not running during these checks.
  The browser fixtures were temporary verification data and are not included in the application.

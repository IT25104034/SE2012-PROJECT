# Member 1: Product and Category

This branch implements Member 1's revised DMS catalogue design. Category and Product
use the report's singular table names, column names, active flags and timestamps.
Product retains imageUrl. Stock lives in a separate Inventory row per product;
there is no persisted Product.quantity column. JSON still returns `quantity` for
existing catalogue, cart, checkout and inventory screens.

## Database preparation before starting

Do not start against the old database expecting Hibernate to migrate it.
`spring.jpa.hibernate.ddl-auto=validate` checks the schema and fails when it does not
match; it does not create the new tables or discard data.

1. Stop the application and back up the entire database, including cart/order data.
2. Rehearse `../backend/db/member1_dms_migration.sql` on a restored copy of the current
   database. It targets the original `categories` and `products` tables only,
   preserves their IDs and transfers each quantity to Inventory. It refuses
   duplicate category names, invalid stock/prices and pre-existing target tables.
3. Compare row counts, total stock and existing cart/order product references.
   Test startup on that copy before approving the same migration for the real database.
4. MySQL DDL commits implicitly. Restore the backup if any stage fails; do not rerun
   a partially completed migration. The script is not automatically executed.

The other entities retain their current mappings. The full nine-table DMS baseline
still requires Member 2/3 changes, including the relational Role and future staff
permissions. This commit does not implement those features or migrate their tables.
Inventory's model/repository are the shared foundation needed for the Product change;
Member 3 owns further inventory operations, reorder-level controls and role work.

## Start and screens

Use the configured Spring Boot port (currently 8081). Keep the frontend API base URL
consistent with it. Start Vite on port 5173; that origin is permitted with session
cookies. Log in as ADMIN for `/admin/products` and `/admin/categories`.

- `/products`: public active catalogue with search, category/price/stock filters and sorting.
- `/products/:productId`: active product details; archived records return 404.
- `/admin/products`: list all products, create, edit, archive and restore through Edit.
- `/admin/categories`: create/edit categories, archive, or restore through the active checkbox.
- The existing inventory screen/API changes stock separately. Product forms cannot overwrite it.

New products have zero stock until the administrator updates Inventory. Archiving
preserves category/product IDs, inventory and historical references. Archiving a
category hides its products from the public catalogue without changing each product's
own active flag. Restoring a category reveals products that are still individually active.
Cart additions and checkout reject archived products/categories, including old cart entries.

## Validation and demonstration

Search, filtering and sorting run in React, not SQL pagination. ProductForm sends
`category: { categoryId }`, plus name, description, price, imageUrl and active.
Only ADMIN sessions may write catalogue records or request `includeInactive=true`.
The four read-only SQL examples are in `../backend/db/member1_dms_queries.sql`.

Demonstrate category/product creation and validation, separate stock update, metadata
edit without stock changes, filters, archive/restore, and forbidden customer/anonymous
writes. Use temporary demo records and preserve team data. The automated regression
tests use a separate in-memory H2 database, never the configured MySQL database.
Run backend `./mvnw test` and frontend `npm run lint` / `npm run build`.

Concurrency protection for simultaneous checkout and the remaining order lifecycle
work remain with the shared Member 2/3 implementation; this compatibility change does
not claim to complete them. Rehearse migration and browser integration on MySQL before
capturing final viva evidence. Do not label prepared SQL or automated H2 results as
executed MySQL evidence in the report.

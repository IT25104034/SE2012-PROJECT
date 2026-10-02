# Member 1: Product and Category demo

Run Spring Boot in IntelliJ on port 8081. Run `npm run dev -- --port 5173 --strictPort` here. The backend permits browser requests from http://localhost:5173. Frontend `.env` uses `VITE_API_BASE_URL=http://localhost:8081`.

## Screens

- `/`: storefront with real categories.
- `/products`: catalogue, search, category/price filters and sorting.
- `/products/:productId`: product details fetched by ID.
- `/admin/products`: list, create, edit and delete products.
- `/admin/categories`: existing category CRUD.

## What to understand

`productService.js` calls the existing ProductController. GET returns an array; search, filtering and sorting run in React. This is not backend search or pagination. ProductForm sends `category: { categoryId }`, matching the JPA relationship. React Query tracks pending/errors and refreshes queries after mutations. Category renames also invalidate product data so category names stay current.

Product fields: name, description, price, imageUrl, quantity and category. Authentication, cart and checkout are integrated. Management routes require an ADMIN account in the frontend; backend product/category writes still need role enforcement. SKU, brand and active status are not implemented.

## Demo checklist

1. Create a temporary category. Submit an empty name to demonstrate backend validation.
2. Create a product in that category, first with an empty name/price to show field errors.
3. Verify the nested category in the browser Network request and response.
4. Edit the product price and description. Confirm the ID stays the same.
5. Browse the catalogue, search by name, filter by category and price, sort prices.
6. Open product details, including a direct URL refresh. Check a nonexistent product ID shows an error.
7. Rename the category and revisit the catalogue to verify the refreshed name.
8. Test Delete → Cancel, then delete the temporary product and its temporary category.
9. Reload to confirm persistence. Do not delete existing team records for testing.
10. Stop the backend briefly and Refresh to demonstrate the API error state; restart it and retry.

Foreign-key constraints can reject deletion of products/categories in use. The UI reports the failure; the current backend does not provide a dedicated friendly conflict response. Empty names are intentionally submitted using `noValidate` to demonstrate backend validation. Image URLs display a fallback if unavailable. Stock availability is shown in product details and integrated with cart and checkout.

# Admin orders and inventory

Run the backend on port 8081 with MySQL ECOM and the ignored application-local.properties configured. Run the frontend on port 5173 (npm ci, then npm run dev -- --port 5173 --strictPort). The backend initializes admin@mustafa.com with password admin if that email does not exist. Existing accounts/passwords are preserved. Registration creates CUSTOMER accounts.

## Orders: /admin/orders

- Filter orders by any backend status: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED.
- Switch to Customer ID and submit a positive integer ID to view that customer's orders. The backend has no customer-list endpoint.
- Expand an order to inspect its items and totals.
- Select a different status and save. The current list refreshes; an order moves out of the list if it no longer matches the selected status.
- Retry failed loads or use Refresh to fetch current data.

## Inventory: /admin/inventory

- View product counts, total available units and out-of-stock counts.
- Search product/category names and filter by availability.
- Update stock loads the individual product through the inventory API. Save sets the total stock, rather than adding units.
- Empty, negative and fractional quantities are rejected by the form. Zero marks a product out of stock.
- Successful updates refresh inventory and cached catalogue/detail data.

## Verification checklist

Use temporary test records. Verify all six status filters, a customer with orders, an empty customer result, expanded items, status updates, stock set to zero and then restored, search/filter empty states, backend outage/retry, and customer denial of both admin routes. Pre-shipping cancellation restores stock once. Only the allowed next statuses are offered; delivered/cancelled orders are final. Staff uses /staff/orders and /staff/inventory. Admin manages accounts and roles at /admin/users; public registration creates CUSTOMER only.

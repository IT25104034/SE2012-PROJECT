# Four main workflows

These workflows preserve the reference brief's four-function structure. This personal fork does not establish lecturer approval of the historical three-member exception. Editable activity diagrams are in `uml/`.

## UC01 — Manage catalogue

Actor: Admin. Requirements: FR17/FR18. Trigger: maintain store products/categories.

Preconditions: authenticated Admin, existing category before creating a product.

1. Open catalogue/category management.
2. Enter fields and category association, or select a record to edit/delete.
3. Server checks current permission and validates submitted data.
4. Service resolves the category and saves/deletes through JPA.
5. UI refreshes the affected catalogue/inventory and reports success.

Alternatives: guest 401; unauthorized role 403; invalid fields 400; missing record 404; referenced delete 409 with a friendly message. Cancelling the UI delete prompt sends no request.

Postcondition: valid change persists; failed referenced deletion preserves data.

## UC02 — Place order

Actor: Customer. Requirements: FR08–FR11. Trigger: checkout a populated cart.

Preconditions: authenticated user, valid positive quantities, existing products and available stock.

1. Add products, adjust quantities or remove lines; service updates totals transactionally.
2. Submit checkout with a stable UUID key for this purchase attempt.
3. Server checks ownership, locks the customer and looks up any order already created with this key.
4. If no previous order exists, validate cart quantities/prices and deduct product stock conditionally in ID order.
5. Create PENDING order/items using stored line prices, clear cart and reset total in the same transaction.
6. Return order confirmation and refresh catalogue stock.

Alternatives: empty/invalid cart rejected; shortage returns 409; transaction rollback preserves cart and earlier stock. Concurrent buyers cannot oversell. Repeated key returns the same order. A new intended purchase uses a new key.

Postcondition: exactly one confirmed checkout result for the key, with matching order/cart/stock state. No online payment is processed.

## UC03 — Manage inventory

Actors: Staff/Admin. Requirements: FR15/FR16/FR19. Trigger: review/reconcile physical stock.

Preconditions: authenticated operator, existing product.

1. Search/filter inventory and review totals.
2. Select a product; fetch its current record.
3. Enter total available quantity, not an increment.
4. Server validates permission and non-negative quantity.
5. Save versioned product update; refresh inventory/catalogue data.

Alternatives: invalid quantity 400; missing product 404; denied permission 401/403; concurrent entity write 409 and retry after refresh; API outage displays retry.

Postcondition: saved stock is visible to customers and checkout validation. The UI does not claim to synchronize with a physical stock system.

## UC04 — Process order

Actors: Staff/Admin. Requirements: FR12–FR14. Trigger: incoming order or fulfillment update.

Preconditions: authenticated operator, existing order.

1. Find orders by status/customer ID and inspect line items.
2. Select one of the allowed next statuses.
3. Server locks the order and validates the transition.
4. For pre-shipping cancellation, restore each product's stock in the same transaction.
5. Save status and refresh lists; customer sees current status in order history.

Alternatives: invalid/backward/skipped transition 409; missing order 404; no permission 401/403. Repeated same status is a no-op, so repeated cancellation does not restock twice.

Postcondition: forward status or one cancellation persists atomically. SHIPPED cannot be cancelled; DELIVERED/CANCELLED are final. Returns/refunds after shipping require a separate approved workflow.

The transition/cancellation policy was chosen for development and has not been independently approved by the client.

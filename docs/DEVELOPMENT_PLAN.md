# Personal fork development plan

## Context and scope

Reviewed on 2 October 2026 against OOAD_SE2012_Project_Context.html supplied by the user. The reference describes the SE2012 Raja Mustafa Shop project, presented as Mustafa Hardware: a hardware shop expanding into electronics/components for students and general customers.

The college project divided full-stack ownership into products/categories (Member 1), cart/checkout/orders (Member 2), and authentication/users/roles/inventory (Member 3). In this private fork, the user personally develops all three domains. Historical ownership remains useful for learning, but does not limit this fork's work.

This checkout is the implementation baseline. Development uses ECOM on localhost:3306, backend port 8081 and frontend port 5173. The college database is separate. The original HTML is reference material; its historical paths, source hashes and implementation claims are not current verification of this fork.

Keep the current layered design: React -> Axios -> Spring MVC controllers -> services -> JPA repositories -> MySQL. Reuse Product and User across modules. Inventory is Product.quantity; roles are an enum on User. Do not import the separate SE2032 draft schema or invent User subclasses or an Inventory entity.

## Intended roles

- Customer: browse/filter/details, registration/login, cart, checkout and own orders.
- Staff (pending): incoming orders, processing/status updates and stock operations.
- Admin: catalogue, inventory, orders and account/role administration.

Registration currently creates CUSTOMER only. ADMIN exists, including a local demo initializer. STAFF is not implemented. Admin catalogue routes have frontend guards, but product/category write APIs still lack server authorization.

## Current implementation and evidence

| Requirement | Current fork |
| --- | --- |
| FR01–02 registration/login | Customer/Admin API and UI; BCrypt and sessions; Staff pending |
| FR03–07 catalogue | CRUD, details, browser search/category/price/sort and stock details; URL-backed availability filtering and catalogue stock indicators added in the first increment |
| FR08–11 cart/order journey | Cart operations, stock checks, transactional checkout, order history/items |
| FR12–16 Staff operations | Admin can inspect/process orders and update stock; Staff role/access pending |
| FR17–18 catalogue management | Admin UI present; server write permissions pending |
| FR19 inventory management | Dedicated admin stock dashboard and editor now present |
| FR20–22 account/staff/roles | Management APIs and UI pending |

Verified in this session: frontend build/lint; backend compilation; Spring Boot startup connected to ECOM; all seven tables created; admin login and catalogue/inventory API reads succeeded. Those checks do not establish a complete cart/checkout acceptance test or browser QA. No deployment has been verified.

## Small implementation increments

1. Catalogue availability: URL-backed All/In stock/Out of stock filter, combined with current filters, and visible stock indicators (FR05/FR07).
2. Catalogue API permissions: public reads; authenticated ADMIN writes; tests for guest/customer/admin POST, PUT and DELETE (FR17/FR18/NFR03).
3. Referenced deletion errors: friendly conflict responses for products/categories still in use (NFR04/NFR09).
4. Staff access: STAFF enum, shared server permission checks and operational routes; keep catalogue/account management restricted to ADMIN (FR12–16).
5. Account management: safe user DTOs, admin staff creation and role management, validation and protections against removing the last admin (FR20–22).
6. Order processing rules: document permitted transitions and cancellation policy, implement and test together (FR13/FR14/NFR09).
7. Checkout integrity: locking/optimistic concurrency, duplicate submission handling, transactional cart updates and meaningful tests (FR08–10/NFR09).
8. Documentation and release evidence: code-aligned UML/workflows, reproducible tests and deployment configuration.

Each increment should solve one concrete problem, include appropriate verification, and end in a descriptive local commit. New unrelated features wait for the next increment. Pushes and deployment are separate actions.

## Business decisions still open

Delivery versus collection, payment handling, refunds, cancellation stock restoration, stock reservation, cart repricing and hosting budget need explicit decisions. Current checkout uses stored cart prices, deducts stock only at checkout and creates PENDING orders. Status changes currently accept any enum; cancellation does not restore stock. Do not silently change these rules.

The reference excludes a real payment gateway, GPS tracking, AI recommendations, multi-vendor marketplace and live customer chat. These are not backlog omissions for this fork unless the user changes scope.

## College context retained for learning

The document reports a three-member team against a brief requiring four main functions/scenarios/activity diagrams. Lecturer approval of an exception is not established. Suggested workflows are Manage Catalogue, Place Order, Manage Inventory and Process Order. Use actual client evidence and code-aligned UML; an ER diagram is not a UML class diagram.

Report/viva dates in the supplied context are 7 and 21 October 2026; later course announcements and submission completion were not checked. The document's cited sources and chats were not independently re-audited here. This personal fork's commits are learning evidence, not proof of contributions or submission in the assigned college repository.

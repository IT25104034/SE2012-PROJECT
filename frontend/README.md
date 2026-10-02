# Mustafa Hardware frontend

Run npm ci, then npm run dev -- --port 5173 --strictPort. Backend runs on 8081. Copy .env.example to .env if an API override is needed. Axios sends session cookies.

Verify with npm run build and npm run lint.

Customer catalogue/cart/order routes share the storefront. Admin routes manage catalogue, orders, inventory and accounts. Staff routes manage orders and inventory. Server checks enforce permissions regardless of route guards.

See the repository README and docs/ for requirements, test evidence, UML and deployment. The Docker build uses the same-origin /api proxy; an empty VITE_API_BASE_URL intentionally enables that behavior.

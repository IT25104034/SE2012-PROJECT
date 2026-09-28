import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import CategoryList from "./components/CategoryList.jsx";
import AddCategoryForm from "./components/AddCategoryForm.jsx";
import ProductBrowser from "./components/ProductBrowser.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import Cart from "./components/Cart.jsx";
import OrderList from "./components/OrderList.jsx";

import { getCategories } from "./services/categoryService.js";

function Brand() {
  return (
      <Link
          to="/"
          className="text-lg font-extrabold tracking-tight"
      >
        MUSTAFA{" "}
        <span className="text-orange-600">HARDWARE</span>
      </Link>
  );
}

function Storefront() {
  return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
            <Brand />

            <nav
                aria-label="Main navigation"
                className="flex items-center gap-5 text-sm font-semibold"
            >
              <NavLink
                  to="/products"
                  className={({ isActive }) =>
                      isActive
                          ? "text-orange-700"
                          : "text-slate-600"
                  }
              >
                Products
              </NavLink>

              <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                      isActive
                          ? "text-orange-700"
                          : "text-slate-600"
                  }
              >
                Cart
              </NavLink>

              <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                      isActive
                          ? "text-orange-700"
                          : "text-slate-600"
                  }
              >
                Orders
              </NavLink>

              <Link
                  to="/admin/products"
                  className="btn-outline"
              >
                Management
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10">
          <Outlet />
        </main>

        <footer className="mt-10 bg-slate-900 px-5 py-10 text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-5">
            <div>
              <p className="font-bold">MUSTAFA HARDWARE</p>

              <p className="mt-2 text-sm text-slate-400">
                Tools, electronics and supplies for your next project.
              </p>
            </div>

            <Link
                to="/products"
                className="text-sm text-slate-300 hover:text-white"
            >
              Explore our catalogue →
            </Link>
          </div>
        </footer>
      </div>
  );
}

function Home() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
      <>
        <section className="rounded-xl bg-slate-900 px-6 py-16 text-center text-white sm:px-12">
          <p className="eyebrow text-orange-400">
            Welcome to Mustafa Hardware
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Build Better.{" "}
            <span className="text-orange-500">
            Build Smarter.
          </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Explore hardware and electronics for repairs,
            study and everyday projects.
          </p>

          <Link
              to="/products"
              className="btn-primary mt-8 inline-block"
          >
            Shop Products
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            Shop by category
          </h2>

          <p className="mt-2 text-slate-500">
            Find what you need in our catalogue.
          </p>

          {categories.isPending ? (
              <p className="mt-6" role="status">
                Loading categories…
              </p>
          ) : categories.isError ? (
              <p
                  className="mt-6 text-red-700"
                  role="alert"
              >
                Unable to load categories.{" "}
                <button
                    className="underline"
                    onClick={() => categories.refetch()}
                >
                  Retry
                </button>
              </p>
          ) : categories.data.length === 0 ? (
              <p className="mt-6 text-slate-500">
                Categories will appear here when added.
              </p>
          ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {categories.data.map((category) => (
                    <Link
                        key={category.categoryId}
                        to={`/products?categoryId=${category.categoryId}`}
                        className="panel p-6 transition-shadow hover:shadow-md"
                    >
                <span
                    aria-hidden="true"
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700"
                >
                  {category.name.charAt(0)}
                </span>

                      <h3 className="font-bold">
                        {category.name}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        {category.description || "Browse products"}
                      </p>
                    </Link>
                ))}
              </div>
          )}
        </section>
      </>
  );
}

function Management() {
  return (
      <div className="min-h-screen bg-slate-100 md:flex">
        <aside className="bg-slate-900 p-5 text-white md:w-60 md:shrink-0">
          <Brand />

          <p className="mt-2 text-xs text-slate-400">
            Store Management Portal
          </p>

          <nav
              aria-label="Management navigation"
              className="mt-6 flex gap-2 md:flex-col"
          >
            {[
              ["/admin/products", "Products"],
              ["/admin/categories", "Categories"],
            ].map(([to, label]) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `rounded-md px-4 py-3 text-sm font-semibold ${
                            isActive
                                ? "bg-orange-600 text-white"
                                : "text-slate-300 hover:bg-slate-800"
                        }`
                    }
                >
                  {label}
                </NavLink>
            ))}
          </nav>

          <Link
              to="/products"
              className="mt-6 inline-block text-sm text-slate-300 hover:text-white"
          >
            ← Customer Site
          </Link>
        </aside>

        <main className="min-w-0 flex-1 p-5 md:p-10">
          <Outlet />
        </main>
      </div>
  );
}

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route element={<Storefront />}>
            <Route index element={<Home />} />

            <Route
                path="products"
                element={<ProductBrowser key="catalogue" />}
            />

            <Route
                path="products/:productId"
                element={<ProductDetails />}
            />

            <Route
                path="cart"
                element={<Cart />}
            />

            <Route
                path="orders"
                element={<OrderList />}
            />

            <Route
                path="*"
                element={
                  <div className="panel p-10">
                    <h1 className="mb-5 text-3xl font-bold">
                      Page not found
                    </h1>

                    <Link
                        to="/"
                        className="btn-primary"
                    >
                      Return Home
                    </Link>
                  </div>
                }
            />
          </Route>

          <Route
              path="admin"
              element={<Management />}
          >
            <Route
                index
                element={
                  <Navigate
                      to="products"
                      replace
                  />
                }
            />

            <Route
                path="products"
                element={
                  <ProductBrowser
                      key="management"
                      management
                  />
                }
            />

            <Route
                path="categories"
                element={
                  <>
                    <p className="eyebrow">
                      Store management
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold">
                      Category Management
                    </h1>

                    <p className="mt-2 text-slate-500">
                      Organize your catalogue with product categories.
                    </p>

                    <AddCategoryForm />

                    <CategoryList />
                  </>
                }
            />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}
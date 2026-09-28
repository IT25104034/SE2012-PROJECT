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
import mustafaLogo from "./assets/mustafa-hardware-logo.png";
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
            className="flex shrink-0 items-center"
            aria-label="Mustafa Hardware home"
        >
            <img
                src={mustafaLogo}
                alt="Mustafa Hardware"
                className="h-11 w-auto object-contain sm:h-12"
            />
        </Link>
    );
}

function Storefront() {
    return (
        <div className="site-shell flex min-h-screen flex-col">

            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111111]/95 text-white backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-5 px-5 py-4 lg:px-8">

                    <Brand />

                    <nav
                        aria-label="Main navigation"
                        className="flex flex-wrap items-center justify-end gap-x-7 gap-y-4"
                    >
                        <NavLink
                            to="/products"
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-link !text-white"
                                    : "nav-link"
                            }
                        >
                            Products
                        </NavLink>

                        <NavLink
                            to="/cart"
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-link !text-white"
                                    : "nav-link"
                            }
                        >
                            Cart
                        </NavLink>

                        <NavLink
                            to="/orders"
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-link !text-white"
                                    : "nav-link"
                            }
                        >
                            Orders
                        </NavLink>

                        <Link
                            to="/admin/products"
                            className="btn-primary"
                        >
                            Management
                        </Link>
                    </nav>

                </div>
            </header>

            <main className="w-full flex-1">
                <Outlet />
            </main>

            <footer className="industrial-dark border-t border-white/10 px-5 py-12">
                <div className="mx-auto grid w-full max-w-[1400px] gap-10 md:grid-cols-2 lg:px-3">

                    <div>
                        <Brand />

                        <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                            Professional tools, electronics and building supplies
                            for people who take their work seriously.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 md:items-end">
                        <p className="section-kicker">
                            Built for real work
                        </p>

                        <Link
                            to="/products"
                            className="text-sm font-bold text-white/75 transition hover:text-white"
                        >
                            Explore the catalogue →
                        </Link>

                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">
                            Mustafa Hardware
                        </p>
                    </div>

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
            {/* HERO */}
            <section className="industrial-dark industrial-grid relative min-h-[78vh] overflow-hidden">
                <div className="absolute -right-32 top-20 h-[420px] w-[420px] rounded-full bg-orange-500/20 blur-[120px]" />
                <div className="absolute -left-40 bottom-0 h-[360px] w-[360px] rounded-full bg-white/5 blur-[100px]" />

                <div className="relative mx-auto flex min-h-[78vh] w-full max-w-[1400px] items-center px-5 py-20 lg:px-8">
                    <div className="max-w-5xl animate-fade-up">

                        <p className="section-kicker">
                            Professional Hardware • Sri Lanka
                        </p>

                        <h1 className="display-title mt-7 max-w-5xl text-6xl text-white sm:text-7xl lg:text-[110px]">
                            BUILT FOR
                            <span className="block text-orange-500">
                REAL WORK.
              </span>
                        </h1>

                        <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                            Reliable tools, electronics and building supplies
                            for professionals, creators and everyday projects.
                            Everything you need to build with confidence.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Link
                                to="/products"
                                className="btn-primary"
                            >
                                Explore Products →
                            </Link>

                            <a
                                href="#categories"
                                className="hero-button-secondary"
                            >
                                Browse Categories
                            </a>
                        </div>

                        <div className="mt-16 grid max-w-3xl grid-cols-3 gap-5 border-t border-white/10 pt-8">
                            <div>
                                <p className="text-3xl font-black text-white">
                                    100%
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/40">
                                    Quality Focus
                                </p>
                            </div>

                            <div>
                                <p className="text-3xl font-black text-white">
                                    Pro
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/40">
                                    Grade Tools
                                </p>
                            </div>

                            <div>
                                <p className="text-3xl font-black text-orange-500">
                                    MH
                                </p>
                                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/40">
                                    Trusted Hardware
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="absolute bottom-8 right-8 hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35 lg:flex">
                    Scroll to explore
                    <span className="text-orange-500">↓</span>
                </div>
            </section>


            {/* BRAND STATEMENT */}
            <section className="bg-[#f3f1eb] px-5 py-20 lg:px-8 lg:py-28">
                <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">

                    <div>
                        <p className="section-kicker">
                            Mustafa Hardware
                        </p>

                        <h2 className="section-title mt-4 text-4xl sm:text-5xl">
                            Tools should work
                            <span className="block">
                as hard as you do.
              </span>
                        </h2>
                    </div>

                    <div>
                        <p className="max-w-2xl text-lg leading-8 text-black/55">
                            From a quick home repair to a serious build,
                            the right equipment changes everything.
                            We bring essential hardware, electronics and supplies
                            together in one dependable catalogue.
                        </p>
                    </div>

                </div>
            </section>


            {/* DARK FEATURE STRIP */}
            <section className="bg-[#151515] px-5 py-6 text-white lg:px-8">
                <div className="mx-auto grid max-w-[1400px] gap-6 sm:grid-cols-3">

                    {[
                        ["01", "Reliable Equipment"],
                        ["02", "Essential Supplies"],
                        ["03", "Built for Every Project"],
                    ].map(([number, title]) => (
                        <div
                            key={number}
                            className="flex items-center gap-5 border-white/10 py-4 sm:border-r sm:last:border-r-0"
                        >
              <span className="text-xs font-black tracking-[0.2em] text-orange-500">
                {number}
              </span>

                            <span className="text-sm font-bold uppercase tracking-[0.08em]">
                {title}
              </span>
                        </div>
                    ))}

                </div>
            </section>


            {/* CATEGORIES */}
            <section
                id="categories"
                className="bg-white px-5 py-20 lg:px-8 lg:py-28"
            >
                <div className="mx-auto max-w-[1400px]">

                    <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
                        <div>
                            <p className="section-kicker">
                                Explore the range
                            </p>

                            <h2 className="section-title mt-4 text-4xl sm:text-6xl">
                                SHOP BY
                                <span className="block text-orange-500">
                  CATEGORY.
                </span>
                            </h2>
                        </div>

                        <p className="max-w-md text-sm leading-7 text-black/50">
                            Find the right products faster.
                            Browse our catalogue by category and get straight
                            to the tools and supplies your project needs.
                        </p>
                    </div>


                    {categories.isPending ? (
                        <div className="mt-12 panel p-10">
                            <p className="font-semibold text-black/50">
                                Loading categories...
                            </p>
                        </div>

                    ) : categories.isError ? (
                        <div className="mt-12 rounded-xl border border-orange-200 bg-orange-50 p-8">
                            <p className="font-bold text-orange-900">
                                Categories are currently unavailable.
                            </p>

                            <p className="mt-2 text-sm text-orange-800/70">
                                Start the backend server and retry the connection.
                            </p>

                            <button
                                className="btn-primary mt-5"
                                onClick={() => categories.refetch()}
                            >
                                Retry
                            </button>
                        </div>

                    ) : categories.data.length === 0 ? (
                        <div className="mt-12 panel p-10">
                            <p className="text-black/50">
                                Categories will appear here when added.
                            </p>
                        </div>

                    ) : (
                        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {categories.data.map((category, index) => (
                                <Link
                                    key={category.categoryId}
                                    to={`/products?categoryId=${category.categoryId}`}
                                    className="group relative min-h-[300px] overflow-hidden rounded-xl bg-[#171717] p-7 text-white transition duration-500 hover:-translate-y-2"
                                >
                                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-[55px] transition duration-500 group-hover:bg-orange-500/25" />

                                    <p className="text-xs font-black tracking-[0.2em] text-orange-500">
                                        0{index + 1}
                                    </p>

                                    <div className="absolute bottom-7 left-7 right-7">
                                        <div className="mb-6 h-px w-full bg-white/10" />

                                        <h3 className="text-2xl font-black uppercase tracking-tight">
                                            {category.name}
                                        </h3>

                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/45">
                                            {category.description || "Explore products in this category."}
                                        </p>

                                        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                                            Explore →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>
            </section>


            {/* FINAL CTA */}
            <section className="bg-orange-500 px-5 py-20 lg:px-8">
                <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-10 lg:flex-row lg:items-end">

                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-black/55">
                            Ready to get started?
                        </p>

                        <h2 className="display-title mt-5 max-w-4xl text-5xl text-black sm:text-7xl">
                            FIND THE RIGHT TOOL.
                            <span className="block text-white">
                GET THE JOB DONE.
              </span>
                        </h2>
                    </div>

                    <Link
                        to="/products"
                        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-black px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:-translate-y-1"
                    >
                        Shop all products →
                    </Link>

                </div>
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
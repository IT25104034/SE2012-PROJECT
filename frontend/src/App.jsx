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

import UserManagement from "./components/UserManagement.jsx";
import AdminOrders from "./components/AdminOrders.jsx";
import Inventory from "./components/Inventory.jsx";

import CategoryList from "./components/CategoryList.jsx";
import AddCategoryForm from "./components/AddCategoryForm.jsx";
import ProductBrowser from "./components/ProductBrowser.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import Cart from "./components/Cart.jsx";
import OrderList from "./components/OrderList.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { useAuth } from "./auth/authContext.js";

import Icon from "./components/Icon.jsx";
import { getProducts } from "./services/productService.js";
import { getCategories } from "./services/categoryService.js";

function Brand() {
  return <Link to="/" className="brand" aria-label="Mustafa Hardware home">
    <span className="brand-mark"><Icon name="tools" /></span>
    <span><span className="brand-name">MUSTAFA<span> HARDWARE</span></span><span className="brand-caption">For every project.</span></span>
  </Link>;
}

function Storefront() {
  const { user, logout } = useAuth();
  return <div className="storefront flex min-h-screen flex-col">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="utility-bar"><div className="site-width"><span>Hardware. Electronics. Possibilities.</span><span className="hidden sm:inline">Your next project starts here.</span></div></div>
    <header className="store-header">
      <div className="site-width header-inner">
        <Brand />
        <nav aria-label="Main navigation" className="store-nav">
          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}>Products</NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}><Icon name="cart" />Cart</NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}>Orders</NavLink>
          {["ADMIN", "STAFF"].includes(user?.role) && <Link to={user.role === "ADMIN" ? "/admin/products" : "/staff/orders"} className="nav-item">Management</Link>}
        </nav>
        <div className="account-nav">
          {user ? <><span className="hidden text-sm text-slate-500 sm:inline">Hi, {user.name}</span><button type="button" className="btn-outline" onClick={logout}>Sign Out</button></>
            : <><Link to="/login" className="nav-item">Sign In</Link><Link to="/register" className="btn-primary">Register <Icon name="arrow" /></Link></>}
        </div>
      </div>
    </header>
    <main id="main-content" className="site-width store-main flex-1" tabIndex={-1}><Outlet /></main>
    <footer className="store-footer">
      <div className="site-width footer-top"><div><Brand /><p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">From everyday repairs to your next big idea. Find the tools, components and supplies to make it happen.</p></div>
        <div><p className="eyebrow text-orange-400">Explore the store</p><div className="mt-4 flex flex-col gap-3 text-sm text-slate-300"><Link to="/products">All products</Link><Link to="/cart">Your cart</Link><Link to="/orders">Your orders</Link></div></div>
        <div className="footer-cta"><p className="text-2xl font-bold tracking-tight">Let's build something.</p><Link to="/products" className="btn-primary mt-5">Explore the catalogue <Icon name="arrow" /></Link></div>
      </div>
      <div className="site-width footer-bottom"><span>Mustafa Hardware</span><span>Tools for the work. Supplies for the idea.</span></div>
    </footer>
  </div>;
}

function Home() {
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const products = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const categoryIcon = (name) => /paint/i.test(name) ? "paint" : /electronic/i.test(name) ? "chip" : /electrical|power/i.test(name) ? "bolt" : /sealant|plumb|fastener/i.test(name) ? "box" : "tools";
  return <>
    <section className="home-hero">
      <div className="hero-copy"><p className="eyebrow"><span className="small-dot" /> Made for the way you build</p><h1>Good tools.<br />Great <span>projects.</span></h1>
        <p className="hero-description">A quick repair. A weekend build. Your next bright idea. Find the hardware and electronics to get it done.</p>
        <div className="hero-actions"><Link to="/products" className="btn-primary">Explore products <Icon name="arrow" /></Link><a href="#shop-categories" className="hero-secondary">Shop by category</a></div>
        <div className="hero-facts"><span><strong>{products.isSuccess ? products.data.length : "—"}</strong> products to explore</span><span><strong>{categories.isSuccess ? categories.data.length : "—"}</strong> useful categories</span></div>
      </div>
      <div className="hero-display"><div className="display-topline"><span>THE PROJECT ESSENTIALS</span><Icon name="tools" /></div>
        <div className="hero-tool-photo"><img src="/images/products/cordless-drill-18v.jpg" alt="Cordless drill from the sample catalogue" /><span className="tool-note">POWER YOUR NEXT IDEA</span></div>
        <div className="hero-display-bottom"><div><span className="eyebrow text-orange-300">Ready, set, create.</span><p>Small fixes.<br />Big possibilities.</p></div><Link to="/products" aria-label="Browse project essentials" className="hero-round-link"><Icon name="arrow" /></Link></div>
      </div>
    </section>
    <section id="shop-categories" className="category-section">
      <div className="section-heading"><div><p className="eyebrow">Find your starting point</p><h2>Every project has a category.</h2></div><Link to="/products" className="text-link">View all products <Icon name="arrow" /></Link></div>
      {categories.isPending ? <p className="panel p-8 mt-6" role="status">Loading categories…</p> : categories.isError ? <p className="panel p-8 mt-6 text-red-700" role="alert">Unable to load categories. <button className="underline" onClick={() => categories.refetch()}>Retry</button></p> : categories.data.length === 0 ? <p className="panel p-8 mt-6 text-slate-500">Categories will appear here when added.</p> :
        <div className="category-grid">{categories.data.map((category, index) => <Link key={category.categoryId} to={`/products?categoryId=${category.categoryId}`} className="category-card">
          <div className="category-card-top"><span className="category-icon"><Icon name={categoryIcon(category.name)} /></span><span className="category-number">{String(index + 1).padStart(2, "0")}</span></div>
          <h3>{category.name}</h3><div className="category-card-bottom"><span>{products.isSuccess ? `${products.data.filter(p => p.category?.categoryId === category.categoryId).length} products` : "Explore category"}</span><Icon name="arrow" /></div>
        </Link>)}</div>}
    </section>
    <section className="project-banner"><Icon name="tools" /><div><p className="eyebrow">From workbench to workspace</p><h2>A little curiosity goes a long way.</h2><p>Tools, electronics and everyday essentials, all in one place.</p></div><Link to="/products" className="btn-outline">Find your next essential <Icon name="arrow" /></Link></section>
  </>;
}

function Management() {
  const { user } = useAuth();
  const staff = user?.role === "STAFF";
  return (
      <div className="management-layout min-h-screen md:flex">
        <aside className="management-sidebar p-5 text-white md:w-64 md:shrink-0">
          <Brand />

          <p className="mt-2 text-xs text-slate-400">
            Store Management Portal
          </p>

          <nav
              aria-label="Management navigation"
              className="mt-6 flex flex-wrap gap-2 md:flex-col"
          >
            {(staff ? [["/staff/orders", "Orders"], ["/staff/inventory", "Inventory"]] : [
              ["/admin/products", "Products"],
              ["/admin/categories", "Categories"],
              ["/admin/inventory", "Inventory"],
              ["/admin/orders", "Orders"],
              ["/admin/users", "Users"],
            ]).map(([to, label]) => (
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

        <main className="management-main min-w-0 flex-1 p-5 md:p-10">
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
                element={<ProtectedRoute><Cart /></ProtectedRoute>}
            />

            <Route
                path="orders"
                element={<ProtectedRoute><OrderList /></ProtectedRoute>}
            />

            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

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

          <Route path="staff" element={<ProtectedRoute role={["STAFF", "ADMIN"]}><Management /></ProtectedRoute>}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>

          <Route
              path="admin"
              element={<ProtectedRoute role="ADMIN"><Management /></ProtectedRoute>}
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

            <Route path="users" element={<UserManagement />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<AdminOrders />} />

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

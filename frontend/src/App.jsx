import { BrowserRouter, Routes, Route, NavLink, Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import CategoryList from "./components/CategoryList.jsx";
import AddCategoryForm from "./components/AddCategoryForm.jsx";
import ProductBrowser from "./components/ProductBrowser.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import ProductImage from "./components/ProductImage.jsx";
import Cart from "./components/Cart.jsx";
import OrderList from "./components/OrderList.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import InventoryManagement from "./components/InventoryManagement.jsx";
import UserManagement from "./components/UserManagement.jsx";
import StaffOrders from "./components/StaffOrders.jsx";
import Icon from "./components/Icon.jsx";
import StoreFooter from "./components/StoreFooter.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import { useAuth } from "./auth/authContext.js";
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
  const navigate = useNavigate();
  const departments = useQuery({ queryKey: ["categories", "catalogue"], queryFn: () => getCategories() });
  const customer = !user || user.role === "CUSTOMER";
  function searchStore(event) {
    event.preventDefault();
    const search = String(new FormData(event.currentTarget).get("search") ?? "").trim();
    navigate(search ? `/products?${new URLSearchParams({ search })}` : "/products");
  }
  return <div className="storefront flex min-h-screen flex-col">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="utility-bar"><div className="site-width"><span>Tools, hardware & electronics</span><span className="hidden sm:inline">Mustafa Hardware online store</span></div></div>
    <header className="store-header">
      <div className="site-width header-inner">
        <Brand />
        <form className="store-search" role="search" onSubmit={searchStore}>
          <label htmlFor="store-search" className="sr-only">Search the store</label>
          <input id="store-search" name="search" type="search" placeholder="Search tools, hardware and electronics" />
          <button type="submit" aria-label="Search products"><Icon name="search" /></button>
        </form>
        <div className="account-nav">
          {user ? <><span className="account-greeting">Hi, {user.name}</span><button type="button" className="btn-outline" onClick={logout}>Sign Out</button></>
            : <><Link to="/login" className="nav-item">Sign In</Link><Link to="/register" className="btn-primary">Register <Icon name="arrow" /></Link></>}
        </div>
      </div>
      <div className="store-navigation"><div className="site-width navigation-inner">
        <nav aria-label="Main navigation" className="store-nav">
          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}>Products</NavLink>
          {customer && <><NavLink to="/cart" className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}><Icon name="cart" />Cart</NavLink><NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}>Orders</NavLink></>}
          {["ADMIN", "STAFF"].includes(user?.role) && <Link to={user.role === "ADMIN" ? "/admin/products" : "/staff/orders"} className="nav-item">{user.role === "ADMIN" ? "Management" : "Staff Portal"}</Link>}
        </nav>
        <nav aria-label="Departments" className="department-nav">{(departments.data ?? []).map(category => <Link key={category.categoryId} to={`/products?categoryId=${category.categoryId}`}>{category.name}</Link>)}</nav>
      </div></div>
    </header>
    <main id="main-content" className="site-width store-main flex-1" tabIndex={-1}><Outlet /></main>
    <StoreFooter brand={<Brand />} categories={departments.data ?? []} user={user} />
  </div>;
}

function Home() {
  const { user } = useAuth();
  const categories = useQuery({ queryKey: ["categories", "catalogue"], queryFn: () => getCategories() });
  const products = useQuery({ queryKey: ["products", "catalogue"], queryFn: () => getProducts() });
  const items = products.data ?? [];
  const highlights = items.filter(product => Number(product.quantity) > 0).slice(0, 4);
  return <>
    <section className="retail-banner" aria-labelledby="home-title">
      <div className="retail-banner-copy"><p className="eyebrow">Your hardware store, online</p><h1 id="home-title">Tools and supplies.<br />Ready for the job.</h1><p>Shop hand tools, power tools, electrical components and everyday hardware in one place.</p><Link to="/products" className="btn-primary">Shop all products <Icon name="arrow" /></Link></div>
      <div className="retail-banner-photo"><img src="/images/products/cordless-drill-18v.jpg" alt="Cordless drill illustrating the hardware range" fetchPriority="high" /><div><span>Tools for your next project</span><a href="#shop-categories">Browse departments <Icon name="arrow" /></a></div></div>
    </section>
    <div className="catalogue-strip"><span><Icon name="grid" />{products.isSuccess ? `${items.length} products in the catalogue` : "Browse our catalogue"}</span><span><Icon name="tools" />Hardware & project essentials</span><Link to={user?.role === "ADMIN" ? "/admin/orders" : user?.role === "STAFF" ? "/staff/orders" : "/orders"}>{["ADMIN", "STAFF"].includes(user?.role) ? "Manage orders" : "Track your orders"} <Icon name="arrow" /></Link></div>
    <section id="shop-categories" className="department-section">
      <div className="section-heading"><h2>Shop by department</h2><Link to="/products" className="text-link">View all products <Icon name="arrow" /></Link></div>
      {categories.isPending ? <p className="py-8" role="status">Loading departments…</p> : categories.isError ? <p className="py-8 text-red-700" role="alert">Unable to load departments. <button className="underline" onClick={() => categories.refetch()}>Retry</button></p> : categories.data.length === 0 ? <p className="py-8">Departments will appear here when added.</p> :
        <div className="department-grid">{categories.data.map(category => {
          const departmentItems = items.filter(product => product.category?.categoryId === category.categoryId);
          const image = departmentItems.find(product => product.imageUrl);
          return <Link key={category.categoryId} to={`/products?categoryId=${category.categoryId}`} className="department-tile">
            <div className="department-image">{image ? <ProductImage product={image} className="h-full w-full object-contain" /> : <Icon name="tools" />}</div>
            <div className="department-caption"><h3>{category.name}</h3><Icon name="arrow" /></div><p>{products.isSuccess ? `${departmentItems.length} products` : "Browse products"}</p>
          </Link>;
        })}</div>}
    </section>
    <section className="home-products" aria-labelledby="essentials-heading">
      <div className="section-heading"><h2 id="essentials-heading">Explore our range</h2><Link to="/products?availability=in-stock" className="text-link">Shop in-stock products <Icon name="arrow" /></Link></div>
      {products.isPending ? <p className="py-8" role="status">Loading products…</p> : products.isError ? <p className="py-8 text-red-700" role="alert">Unable to load products. <button className="underline" onClick={() => products.refetch()}>Retry</button></p> : highlights.length === 0 ? <p className="py-8">Available products will appear here when added.</p> :
        <div className="home-product-grid">{highlights.map(product => <article key={product.productId} className="product-card">
          <Link className="product-photo" to={`/products/${product.productId}`} aria-label={`View ${product.name}`}><ProductImage product={product} className="object-contain" /></Link>
          <div className="product-card-body"><p className="eyebrow">{product.category?.name}</p><h3><Link to={`/products/${product.productId}`}>{product.name}</Link></h3><p className="product-price">Rs. {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p><p className="product-stock">In stock · {product.quantity} available</p><Link className="btn-outline" to={`/products/${product.productId}`}>View product <Icon name="arrow" /></Link></div>
        </article>)}</div>}
    </section>
  </>;
}

function Management() {
  const { user, logout } = useAuth();
  const staff = user?.role === "STAFF";
  const navigation = staff ? [["/staff/orders", "Orders"], ["/staff/inventory", "Inventory"]] : [["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/inventory", "Inventory"], ["/admin/orders", "Orders"], ["/admin/users", "Users & Staff"]];
  return <div className="management-layout min-h-screen md:flex">
    <aside className="management-sidebar p-5 text-white md:w-64 md:shrink-0">
      <Brand /><p className="mt-3 text-xs text-slate-400">{staff ? "Staff Operations Portal" : "Store Management Portal"}</p>
      <div className="mt-6 border-y border-white/10 py-4"><p className="font-semibold break-words">{user?.name}</p><p className="mt-1 text-xs font-bold text-orange-300">{user?.role}</p></div>
      <nav aria-label="Management navigation" className="mt-6 flex flex-wrap gap-2 md:flex-col">{navigation.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `management-link ${isActive ? "is-active" : ""}`}>{label}</NavLink>)}</nav>
      <Link to="/products" className="mt-8 block text-sm text-slate-300 hover:text-white">← Customer Site</Link>
      <button type="button" onClick={logout} className="mt-5 text-sm text-slate-400 hover:text-orange-300">Sign Out</button>
    </aside>
    <main className="management-main min-w-0 flex-1 p-5 md:p-10"><Outlet /></main>
  </div>;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route element={<Storefront />}>
      <Route index element={<Home />} />
      <Route path="products" element={<ProductBrowser key="catalogue" />} />
      <Route path="products/:productId" element={<ProductDetails />} />
      <Route path="cart" element={<ProtectedRoute role="CUSTOMER"><Cart /></ProtectedRoute>} />
      <Route path="orders" element={<ProtectedRoute role="CUSTOMER"><OrderList /></ProtectedRoute>} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="*" element={<section className="panel p-10"><h1 className="mb-5 text-3xl font-bold">Page not found</h1><Link to="/" className="btn-primary">Return Home</Link></section>} />
    </Route>
    <Route path="admin" element={<ProtectedRoute role="ADMIN"><Management /></ProtectedRoute>}>
      <Route index element={<Navigate to="products" replace />} />
      <Route path="products" element={<ProductBrowser key="management" management />} />
      <Route path="categories" element={<section className="space-y-6"><div className="catalogue-heading"><p className="eyebrow">Store management</p><h1 className="mt-2 text-3xl font-bold">Category Management</h1><p className="mt-2 text-slate-500">Organize your catalogue with product categories.</p></div><AddCategoryForm /><CategoryList /></section>} />
      <Route path="inventory" element={<InventoryManagement />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="orders" element={<StaffOrders />} />
    </Route>
    <Route path="staff" element={<ProtectedRoute role="STAFF"><Management /></ProtectedRoute>}>
      <Route index element={<Navigate to="orders" replace />} />
      <Route path="orders" element={<StaffOrders />} />
      <Route path="inventory" element={<InventoryManagement />} />
    </Route>
  </Routes></BrowserRouter>;
}

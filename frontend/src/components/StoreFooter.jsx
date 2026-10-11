import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function StoreFooter({ brand, categories = [], user }) {
  const customer = !user || user.role === "CUSTOMER";
  const workspace = user?.role === "ADMIN" ? "/admin/orders" : "/staff/orders";
  return <footer className="store-footer">
    <div className="site-width footer-top">
      <section className="footer-contact" aria-labelledby="footer-contact-title">
        {brand}
        <div className="footer-phone"><Icon name="tools" /><div><p>Hardware, electronics and project essentials</p><span>For every project.</span></div></div>
        <h2 id="footer-contact-title">Mustafa Hardware</h2>
        <p className="mt-2 text-sm text-slate-500">Explore our range, check availability and find the supplies you need.</p>
      </section>
      <nav className="footer-links" aria-labelledby="footer-navigation-title"><h2 id="footer-navigation-title">Quick navigation</h2><Link to="/">Home</Link><Link to="/products">Shop all products</Link>{customer && <Link to="/cart">Shopping cart</Link>}</nav>
      <nav className="footer-links" aria-labelledby="footer-account-title"><h2 id="footer-account-title">{customer ? "Customer care" : "Your workspace"}</h2>{user ? <Link to={customer ? "/orders" : workspace}>{customer ? "Track your orders" : "Manage orders"}</Link> : <><Link to="/login">Sign in</Link><Link to="/register">Create an account</Link><Link to="/orders">Track your orders</Link></>}</nav>
      <nav className="footer-links" aria-labelledby="footer-departments-title"><h2 id="footer-departments-title">Shop departments</h2>{categories.map(category => <Link key={category.categoryId} to={`/products?categoryId=${category.categoryId}`}>{category.name}</Link>)}{categories.length === 0 && <Link to="/products">Browse products</Link>}</nav>
    </div>
    <div className="footer-copyright"><div className="site-width"><span>© {new Date().getFullYear()} <strong>Mustafa Hardware</strong> — All rights reserved.</span><span>Tools, hardware & electronics</span></div></div>
  </footer>;
}

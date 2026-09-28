import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService.js";
import { getCategories } from "../services/categoryService.js";
import ProductImage from "./ProductImage.jsx";
import ProductForm from "./ProductForm.jsx";

export default function ProductBrowser({ management = false }) {
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [editor, setEditor] = useState(null);
  const [message, setMessage] = useState("");
  const products = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const categories = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const remove = useMutation({ mutationFn: deleteProduct, onSuccess: async () => {
    setMessage("Product deleted successfully.");
    await client.invalidateQueries({ queryKey: ["products"] });
  }});
  const search = params.get("search") ?? "";
  const category = params.get("categoryId") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const sort = params.get("sort") ?? "name";
  const invalidRange = min !== "" && max !== "" && Number(min) > Number(max);
  function filter(name, value) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value); else next.delete(name);
      return next;
    }, { replace: true });
  }
  const visible = (products.data ?? []).filter((product) =>
    `${product.name} ${product.description ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!category || String(product.category?.categoryId) === category) &&
    (min === "" || product.price >= Number(min)) && (max === "" || product.price <= Number(max))
  ).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : a.name.localeCompare(b.name));

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="eyebrow">{management ? "Store management" : "Explore the catalogue"}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{management ? "Product Management" : "Our Products"}</h1>
        <p className="mt-2 text-slate-500">{management ? "Create and maintain your product catalogue." : "Find tools, electronics and supplies for your next project."}</p></div>
      <div className="flex gap-2"><button className="btn-outline" disabled={products.isFetching} onClick={() => products.refetch()}>{products.isFetching ? "Loading…" : "Refresh"}</button>
        {management && <button className="btn-primary" disabled={editor !== null || remove.isPending} onClick={() => { setMessage(""); remove.reset(); setEditor({}); }}>+ Add Product</button>}</div>
    </div>
    {message && <p role="status" className="rounded bg-green-50 p-3 text-green-700">{message}</p>}
    {remove.isError && <p role="alert" className="rounded bg-red-50 p-3 text-red-700">{remove.error.response?.data?.message || "Unable to delete the product. It may be referenced by a cart or order."}</p>}
    {editor && <ProductForm key={editor.productId ?? "new"} product={editor.productId ? editor : null} onClose={() => setEditor(null)} onSaved={setMessage} />}
    <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Filters</h2>
        <label className="field-label" htmlFor="product-search">Search products</label>
        <input id="product-search" className="field-input" value={search} onChange={(e) => filter("search", e.target.value)} placeholder="Name or description" />
        <label className="field-label mt-4" htmlFor="category-filter">Category</label>
        <select id="category-filter" className="field-input" value={category} onChange={(e) => filter("categoryId", e.target.value)}>
          <option value="">All categories</option>
          {(categories.data ?? []).map((item) => <option key={item.categoryId} value={item.categoryId}>{item.name}</option>)}
        </select>
        {categories.isError && <p className="field-error">Categories unavailable. <button onClick={() => categories.refetch()} className="underline">Retry</button></p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div><label className="field-label" htmlFor="min-price">Min price</label><input id="min-price" className="field-input" type="number" min="0" value={min} onChange={(e) => filter("min", e.target.value)} /></div>
          <div><label className="field-label" htmlFor="max-price">Max price</label><input id="max-price" className="field-input" type="number" min="0" value={max} onChange={(e) => filter("max", e.target.value)} /></div>
        </div>
        {invalidRange && <p role="alert" className="field-error">Minimum price must not exceed maximum.</p>}
        <button className="mt-5 text-sm font-semibold text-orange-700 hover:underline" onClick={() => setParams({})}>Clear filters</button>
      </aside>
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <span>{products.isSuccess ? `${visible.length} products` : "Catalogue"}</span>
          <label className="flex items-center gap-2">Sort by<select className="rounded border border-slate-200 bg-white p-2" value={sort} onChange={(e) => filter("sort", e.target.value)}><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        </div>
        {products.isPending ? <p role="status" className="panel p-8">Loading products…</p> : products.isError ? <div role="alert" className="panel p-8 text-red-700">Unable to load products. Check that Spring Boot is running, then use Refresh.</div> : visible.length === 0 ? <div className="panel p-12 text-center"><h2 className="font-bold">No products found</h2><p className="mt-2 text-sm text-slate-500">{products.data.length ? "Try changing your filters." : "Products will appear here after they are added."}</p></div> : management ? (
          <div className="panel overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-slate-500"><tr>{["Product", "Category", "Price", "Actions"].map((title) => <th key={title} scope="col" className="p-4">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">
            {visible.map((product) => <tr key={product.productId} className="hover:bg-slate-50"><td className="p-4"><Link className="font-bold hover:text-orange-700" to={`/products/${product.productId}`}>{product.name}</Link><p className="mt-1 max-w-xs truncate text-slate-500">{product.description || "—"}</p></td><td className="p-4">{product.category?.name}</td><td className="whitespace-nowrap p-4">Rs. {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td><td className="p-4"><div className="flex gap-2"><button className="btn-outline" disabled={editor !== null || remove.isPending} onClick={() => { setMessage(""); remove.reset(); setEditor(product); }}>Edit</button><button className="btn-danger" disabled={editor !== null || remove.isPending} onClick={() => { if (window.confirm(`Permanently delete "${product.name}"?`)) { setMessage(""); remove.mutate(product.productId); } }}>{remove.isPending && remove.variables === product.productId ? "Deleting…" : "Delete"}</button></div></td></tr>)}
          </tbody></table></div>
        ) : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visible.map((product) => <article key={product.productId} className="panel overflow-hidden transition-shadow hover:shadow-md"><Link to={`/products/${product.productId}`}><ProductImage product={product} className="h-48 w-full p-5" /></Link><div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-orange-700">{product.category?.name}</p><h2 className="mt-2 text-lg font-bold"><Link to={`/products/${product.productId}`}>{product.name}</Link></h2><p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description || "View product details."}</p><p className="mt-4 text-lg font-extrabold">Rs. {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p><Link className="btn-primary mt-4 block text-center" to={`/products/${product.productId}`}>View Details</Link></div></article>)}</div>}
      </div>
    </div>
  </div>;
}

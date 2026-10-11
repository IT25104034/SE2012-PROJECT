import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInventory, updateStock } from "../services/inventoryService.js";

function StockEditor({ item, onClose, onSaved }) {
  const client = useQueryClient();
  const [quantity, setQuantity] = useState(String(item.quantityOnHand ?? 0));
  const valid = quantity !== "" && Number.isSafeInteger(Number(quantity)) && Number(quantity) >= 0 && Number(quantity) <= 2147483647;
  const update = useMutation({
    mutationFn: updateStock,
    onSuccess: async () => {
      await Promise.all([client.invalidateQueries({ queryKey: ["inventory"] }), client.invalidateQueries({ queryKey: ["products"] })]);
      onSaved(`Stock updated for ${item.product?.name || "the product"}.`);
      onClose();
    },
  });
  return <section className="panel p-5" aria-labelledby="stock-title">
    <h2 id="stock-title" className="text-xl font-bold">Update stock</h2>
    <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); if (valid && !update.isPending) update.mutate({ productId: item.product.productId, quantity: Number(quantity) }); }}>
      <p className="font-semibold">{item.product?.name} <span className="font-normal text-slate-500">· Current stock: {item.quantityOnHand}</span></p>
      <p className="text-sm text-slate-500">Enter the total available quantity after this update.</p>
      <div className="max-w-xs"><label className="field-label" htmlFor="stock-quantity">Stock quantity</label><input id="stock-quantity" className="field-input" type="number" min="0" max="2147483647" step="1" required value={quantity} disabled={update.isPending} onChange={event => setQuantity(event.target.value)} />{!valid && <p className="field-error">Enter a whole number between 0 and 2147483647.</p>}</div>
      {update.isError && <p role="alert" className="field-error">{update.error.response?.data?.message || "Unable to update stock. Please try again."}</p>}
      <div className="flex gap-3"><button className="btn-primary" disabled={!valid || update.isPending}>{update.isPending ? "Saving…" : "Save stock"}</button><button type="button" className="btn-outline" disabled={update.isPending} onClick={onClose}>Cancel</button></div>
    </form>
  </section>;
}

export default function InventoryManagement() {
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const inventory = useQuery({ queryKey: ["inventory"], queryFn: getInventory });
  const items = inventory.data ?? [];
  const visible = items.filter(item => `${item.product?.name ?? ""} ${item.product?.category?.name ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()) && (availability === "all" || (availability === "out" ? item.quantityOnHand === 0 : availability === "low" ? item.quantityOnHand <= item.reorderLevel : item.quantityOnHand > 0)));
  return <section className="space-y-6">
    <div className="catalogue-heading flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Stock management</p><h1 className="mt-2 text-3xl font-bold">Inventory Management</h1><p className="mt-2 text-slate-500">Monitor availability, reorder levels and product stock.</p></div><button className="btn-outline" disabled={inventory.isFetching} onClick={() => inventory.refetch()}>{inventory.isFetching ? "Loading…" : "Refresh"}</button></div>
    {message && <p role="status" className="rounded bg-green-50 p-3 text-green-700">{message}</p>}
    {selected && <StockEditor key={selected.inventoryId} item={selected} onClose={() => setSelected(null)} onSaved={setMessage} />}
    {inventory.isSuccess && <div className="grid gap-4 sm:grid-cols-3">{[["Products", items.length], ["Units available", items.reduce((sum, item) => sum + Number(item.quantityOnHand ?? 0), 0)], ["At or below reorder level", items.filter(item => item.quantityOnHand <= item.reorderLevel).length]].map(([label, value]) => <div key={label} className="panel p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>}
    <div className="panel flex flex-wrap gap-4 p-5"><div className="min-w-0 flex-1"><label className="field-label" htmlFor="inventory-search">Search products or categories</label><input id="inventory-search" className="field-input" value={search} onChange={event => setSearch(event.target.value)} /></div><div><label className="field-label" htmlFor="inventory-availability">Availability</label><select id="inventory-availability" className="field-input" value={availability} onChange={event => setAvailability(event.target.value)}><option value="all">All products</option><option value="in">In stock</option><option value="out">Out of stock</option><option value="low">Low stock</option></select></div></div>
    {inventory.isPending ? <p role="status" className="panel p-8">Loading inventory…</p> : inventory.isError ? <p role="alert" className="panel p-8 text-red-700">Unable to load inventory. <button className="underline" onClick={() => inventory.refetch()}>Retry</button></p> : visible.length === 0 ? <p className="panel p-8">{items.length ? "No products match these filters." : "No inventory records found."}</p> : <div className="panel overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr>{["Product", "Category", "Stock", "Reorder level", "Availability", "Actions"].map(title => <th key={title} scope="col" className="p-4">{title}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map(item => <tr key={item.inventoryId}><td className="p-4"><p className="font-bold">{item.product?.name || `Product #${item.product?.productId}`}</p>{item.product && (!item.product.active || !item.product.category?.active) && <p className="text-xs text-slate-500">Archived from catalogue</p>}</td><td className="p-4">{item.product?.category?.name || "—"}</td><td className="p-4 font-semibold">{item.quantityOnHand}</td><td className="p-4">{item.reorderLevel}</td><td className={`p-4 ${item.quantityOnHand === 0 ? "text-red-700" : item.quantityOnHand <= item.reorderLevel ? "text-amber-700" : "text-green-700"}`}>{item.quantityOnHand === 0 ? "Out of stock" : item.quantityOnHand <= item.reorderLevel ? "Low stock" : "In stock"}</td><td className="p-4"><button className="btn-outline whitespace-nowrap" disabled={selected !== null || !item.product?.productId} onClick={() => { setSelected(item); setMessage(""); }}>Update stock</button></td></tr>)}</tbody></table></div>}
  </section>;
}

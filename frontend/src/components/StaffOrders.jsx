import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrderItems, getOrdersByStatus, updateOrderStatus, cancelOrder } from "../services/orderService.js";

const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
const statuses = Object.keys(transitions);
const messageFor = (error) => error?.response?.data?.message || "Unable to complete the request. Please try again.";

async function loadOrders() {
  const groups = await Promise.all(statuses.map(status => getOrdersByStatus(status)));
  return groups.flat().sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
}

function OrderCard({ order, onSaved }) {
  const client = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const next = transitions[order.status] ?? [];
  const items = useQuery({ queryKey: ["staff-order-items", order.orderId], queryFn: () => getOrderItems(order.orderId), enabled: expanded });
  const update = useMutation({
    mutationFn: (details) => details.status === "CANCELLED" ? cancelOrder(details.orderId) : updateOrderStatus(details),
    onSuccess: async () => {
      onSaved(`Order #${order.orderId} updated to ${status}.`);
      await Promise.all([client.invalidateQueries({ queryKey: ["staff-orders"] }), client.invalidateQueries({ queryKey: ["products"] }), client.invalidateQueries({ queryKey: ["inventory"] })]);
    },
  });
  function submit(event) {
    event.preventDefault();
    if (status === order.status || update.isPending) return;
    if (status === "CANCELLED" && !window.confirm("Cancel this order and restore its stock?")) return;
    update.mutate({ orderId: order.orderId, status });
  }
  return <article className="panel order-card p-5">
    <div className="flex flex-wrap justify-between gap-4">
      <div><h2 className="text-lg font-bold">Order #{order.orderId}</h2><p className="mt-1 text-sm text-slate-500">{order.customerName || `Customer #${order.customerId}`}</p>{order.customerEmail && <p className="text-sm break-all text-slate-500">{order.customerEmail}</p>}<p className="mt-1 text-xs text-slate-500">Customer #{order.customerId}</p><p className="mt-2 text-xs text-slate-500">{order.orderDate ? new Date(order.orderDate).toLocaleString() : "Date unavailable"}</p></div>
      <div><p className="font-bold">Rs. {Number(order.totalAmount ?? 0).toFixed(2)}</p><span className={`order-status mt-2 is-${order.status.toLowerCase()}`}>{order.status}</span></div>
    </div>
    <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={submit}>
      <div><label className="field-label" htmlFor={`status-${order.orderId}`}>Order status</label><select id={`status-${order.orderId}`} className="field-input" value={status} disabled={update.isPending || next.length === 0} onChange={event => { setStatus(event.target.value); update.reset(); }}>{[order.status, ...next].map(value => <option key={value}>{value}</option>)}</select></div>
      <button className="btn-primary" disabled={update.isPending || status === order.status}>{update.isPending ? "Saving…" : "Update status"}</button>
      <button type="button" className="btn-outline" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Hide items" : "View items"}</button>
    </form>
    {next.length === 0 && <p className="mt-3 text-sm text-slate-500">This order is final; its status cannot be changed.</p>}
    {update.isError && <p role="alert" className="field-error">{messageFor(update.error)}</p>}
    {expanded && <div className="mt-5 border-t border-slate-200 pt-4">
      {items.isPending ? <p role="status">Loading items…</p> : items.isError ? <p role="alert" className="text-red-700">{messageFor(items.error)} <button className="underline" onClick={() => items.refetch()}>Retry</button></p> : items.data.length === 0 ? <p>No order items found.</p> : <ul className="divide-y divide-slate-100">{items.data.map(item => <li key={item.orderItemId} className="flex flex-wrap justify-between gap-4 py-3 text-sm"><div><p>{item.productName} × {item.quantity}</p><p className="mt-1 text-xs text-slate-500">Product #{item.productId} · Rs. {Number(item.unitPrice).toFixed(2)} each</p></div><span className="font-semibold">Rs. {(Number(item.unitPrice) * item.quantity).toFixed(2)}</span></li>)}</ul>}
    </div>}
  </article>;
}

export default function StaffOrders() {
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");
  const orders = useQuery({ queryKey: ["staff-orders"], queryFn: loadOrders });
  const visible = (orders.data ?? []).filter(order => !filter || order.status === filter);
  return <section className="space-y-6">
    <div className="catalogue-heading flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Store operations</p><h1 className="mt-2 text-3xl font-bold">Order Management</h1><p className="mt-2 text-slate-500">Review customer purchases and manage their status.</p></div><button className="btn-outline" disabled={orders.isFetching} onClick={() => orders.refetch()}>{orders.isFetching ? "Loading…" : "Refresh"}</button></div>
    {message && <p role="status" className="rounded bg-green-50 p-3 text-green-700">{message}</p>}
    <div className="panel p-5"><label className="field-label" htmlFor="order-filter">Filter by status</label><select id="order-filter" className="field-input max-w-xs" value={filter} onChange={event => setFilter(event.target.value)}><option value="">All orders</option>{statuses.map(value => <option key={value}>{value}</option>)}</select></div>
    {orders.isPending ? <p role="status" className="panel p-8">Loading orders…</p> : orders.isError ? <p role="alert" className="panel p-8 text-red-700">{messageFor(orders.error)} <button className="underline" onClick={() => orders.refetch()}>Retry</button></p> : visible.length === 0 ? <p className="panel p-8">No orders found{filter ? " for this status" : ""}.</p> : <div className="space-y-4">{visible.map(order => <OrderCard key={`${order.orderId}-${order.status}`} order={order} onSaved={setMessage} />)}</div>}
  </section>;
}

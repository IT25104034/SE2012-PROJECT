import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getOrderItems,
    getOrdersByStatus,
    updateOrderStatus,
} from "../services/orderService.js";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

async function loadAllOrders() {
    const groups = await Promise.all(
        ORDER_STATUSES.map((status) =>
            getOrdersByStatus(status)
        )
    );

    return groups
        .flat()
        .sort(
            (first, second) =>
                new Date(second.orderDate) -
                new Date(first.orderDate)
        );
}

function OrderItems({ orderId }) {
    const itemsQuery = useQuery({
        queryKey: ["staff-order-items", orderId],
        queryFn: () => getOrderItems(orderId),
    });

    if (itemsQuery.isLoading) {
        return (
            <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                Loading order items...
            </div>
        );
    }

    if (itemsQuery.isError) {
        return (
            <div className="mt-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">
                Unable to load order items.
            </div>
        );
    }

    const items = itemsQuery.data ?? [];

    if (items.length === 0) {
        return (
            <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                No items found for this order.
            </div>
        );
    }

    return (
        <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                <span>Product</span>
                <span>Quantity</span>
                <span>Unit Price</span>
                <span>Line Total</span>
            </div>

            {items.map((item) => (
                <div
                    key={item.orderItemId}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-t border-slate-200 px-4 py-4 text-sm"
                >
                    <div>
                        <p className="font-bold text-slate-900">
                            {item.productName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Product #{item.productId}
                        </p>
                    </div>

                    <span>
                        {item.quantity}
                    </span>

                    <span>
                        Rs.{" "}
                        {Number(
                            item.unitPrice ?? 0
                        ).toFixed(2)}
                    </span>

                    <span className="font-semibold">
                        Rs.{" "}
                        {(
                            Number(
                                item.unitPrice ?? 0
                            ) *
                            Number(
                                item.quantity ?? 0
                            )
                        ).toFixed(2)}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function StaffOrders() {
    const queryClient = useQueryClient();

    const ordersQuery = useQuery({
        queryKey: ["staff-orders"],
        queryFn: loadAllOrders,
    });

    const statusMutation = useMutation({
        mutationFn: updateOrderStatus,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["staff-orders"],
            });
        },
    });

    if (ordersQuery.isLoading) {
        return (
            <div className="panel p-8">
                Loading orders...
            </div>
        );
    }

    if (ordersQuery.isError) {
        return (
            <div className="panel p-8 text-red-700">
                Unable to load customer orders.
            </div>
        );
    }

    const orders = ordersQuery.data ?? [];

    return (
        <section>
            <p className="eyebrow">
                Staff Operations
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
                Customer Orders
            </h1>

            <p className="mt-2 text-slate-500">
                View incoming orders, customer details,
                order items and update order status.
            </p>

            {statusMutation.isError && (
                <div className="mt-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {statusMutation.error?.response?.data
                            ?.message ||
                        "Unable to update order status."}
                </div>
            )}

            <div className="mt-8 space-y-4">
                {orders.map((order) => (
                    <article
                        key={order.orderId}
                        className="panel p-6"
                    >
                        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                            <div>
                                <p className="text-sm font-bold text-orange-700">
                                    Order #{order.orderId}
                                </p>

                                <h2 className="mt-1 text-xl font-extrabold">
                                    {order.customerName ||
                                        `Customer #${order.customerId}`}
                                </h2>

                                {order.customerEmail && (
                                    <p className="mt-1 text-sm text-slate-500">
                                        {order.customerEmail}
                                    </p>
                                )}

                                <p className="mt-1 text-xs text-slate-400">
                                    Customer #{order.customerId}
                                </p>

                                <p className="mt-3 text-sm text-slate-500">
                                    {order.orderDate
                                        ? new Date(
                                            order.orderDate
                                        ).toLocaleString()
                                        : "Date unavailable"}
                                </p>

                                <p className="mt-3 text-lg font-bold">
                                    Rs.{" "}
                                    {Number(
                                        order.totalAmount ?? 0
                                    ).toFixed(2)}
                                </p>
                            </div>

                            <div className="w-full sm:w-56">
                                <label className="field-label">
                                    Order Status
                                </label>

                                <select
                                    className="field-input"
                                    value={order.status}
                                    disabled={
                                        statusMutation.isPending
                                    }
                                    onChange={(event) =>
                                        statusMutation.mutate({
                                            orderId:
                                            order.orderId,
                                            status:
                                            event.target.value,
                                        })
                                    }
                                >
                                    {ORDER_STATUSES.map(
                                        (status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <details className="mt-6">
                            <summary className="cursor-pointer text-sm font-bold text-orange-700">
                                View order details
                            </summary>

                            <OrderItems
                                orderId={order.orderId}
                            />
                        </details>
                    </article>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="panel mt-8 p-8 text-slate-500">
                    No customer orders found.
                </div>
            )}
        </section>
    );
}
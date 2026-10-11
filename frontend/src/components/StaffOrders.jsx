import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
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
                View incoming orders, process them and
                update order status.
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
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-sm font-bold text-orange-700">
                                    Order #{order.orderId}
                                </p>

                                <h2 className="mt-1 text-xl font-extrabold">
                                    Customer #{order.customerId}
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
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
import { useEffect, useState } from "react";

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8081/api/orders/customer/1"
            );

            if (!response.ok) {
                throw new Error("Failed to load orders");
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message || "Unable to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Date unavailable";
        }

        return new Date(dateValue).toLocaleString();
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-100 text-amber-700";
            case "CONFIRMED":
                return "bg-blue-100 text-blue-700";
            case "PROCESSING":
                return "bg-indigo-100 text-indigo-700";
            case "SHIPPED":
                return "bg-purple-100 text-purple-700";
            case "DELIVERED":
                return "bg-green-100 text-green-700";
            case "CANCELLED":
                return "bg-red-100 text-red-700";
            default:
                return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <section
            id="orders"
            className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
                        Member 2
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                        My Orders
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        View your previous orders and their current status.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchOrders}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                    Refresh Orders
                </button>
            </div>

            {loading && (
                <div className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Loading orders...
                </div>
            )}

            {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && orders.length === 0 && (
                <div className="mt-6 rounded-lg bg-slate-50 p-8 text-center">
                    <p className="font-semibold text-slate-700">
                        You have no orders yet.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Orders will appear here after you complete checkout.
                    </p>
                </div>
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="mt-6 space-y-4">
                    {orders.map((order) => (
                        <article
                            key={order.orderId}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Order #{order.orderId}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(order.orderDate)}
                                    </p>
                                </div>

                                <span
                                    className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${getStatusClasses(
                                        order.status
                                    )}`}
                                >
                  {order.status}
                </span>
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-semibold text-slate-600">
                  Total
                </span>

                                <span className="text-lg font-extrabold text-slate-900">
                  Rs. {Number(order.totalAmount || 0).toFixed(2)}
                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default OrderList;
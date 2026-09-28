import { useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getInventory,
    updateProductStock,
} from "../services/inventoryService.js";

import { useAuth } from "../context/AuthContext.jsx";


export default function InventoryDashboard() {

    const queryClient = useQueryClient();

    const {
        user,
        isAdmin,
    } = useAuth();

    const [stockValues, setStockValues] =
        useState({});

    const [message, setMessage] =
        useState("");


    const inventory = useQuery({
        queryKey: ["inventory"],
        queryFn: getInventory,
    });


    const stockMutation = useMutation({

        mutationFn: updateProductStock,

        onSuccess: async (updatedProduct) => {

            setMessage(
                `${updatedProduct.name} stock updated successfully.`
            );

            setStockValues((previous) => {

                const next = {
                    ...previous,
                };

                delete next[
                    updatedProduct.productId
                    ];

                return next;
            });


            await queryClient.invalidateQueries({
                queryKey: ["inventory"],
            });


            await queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });


    const products =
        inventory.data ?? [];


    const totalProducts =
        products.length;


    const totalUnits =
        products.reduce(
            (total, product) =>
                total +
                Number(product.quantity ?? 0),
            0
        );


    const lowStock =
        products.filter((product) => {

            const quantity =
                Number(product.quantity ?? 0);

            return (
                quantity > 0 &&
                quantity <= 5
            );
        }).length;


    const outOfStock =
        products.filter(
            (product) =>
                Number(product.quantity ?? 0) === 0
        ).length;


    function getDraftQuantity(product) {

        if (
            stockValues[product.productId] !==
            undefined
        ) {
            return stockValues[
                product.productId
                ];
        }

        return product.quantity ?? 0;
    }


    function changeQuantity(
        productId,
        value
    ) {

        setMessage("");

        setStockValues((previous) => ({
            ...previous,
            [productId]: value,
        }));
    }


    function saveStock(product) {

        const quantity =
            Number(
                getDraftQuantity(product)
            );


        if (
            Number.isNaN(quantity) ||
            quantity < 0
        ) {
            return;
        }


        setMessage("");

        stockMutation.mutate({
            productId:
            product.productId,

            quantity,
        });
    }


    if (!isAdmin) {

        return (
            <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-8">

                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
                    Restricted Area
                </p>

                <h1 className="mt-3 text-3xl font-black text-black">
                    Admin access required.
                </h1>

                <p className="mt-3 text-sm leading-7 text-black/50">
                    Inventory stock management is
                    available only to administrator
                    accounts.
                </p>

            </div>
        );
    }


    return (
        <div className="space-y-8">

            {/* PAGE HEADER */}

            <section className="overflow-hidden rounded-xl bg-[#171717] p-7 text-white sm:p-9">

                <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

                    <div>

                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                             Inventory Management
                        </p>

                        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                            Inventory
                            <span className="block text-orange-500">
                Control.
              </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
                            Monitor current product stock and
                            update inventory quantities from
                            one management dashboard.
                        </p>

                    </div>


                    <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">

                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                            Signed in as
                        </p>

                        <p className="mt-1 font-black">
                            {user?.name}
                        </p>

                        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-orange-500">
                            {user?.role}
                        </p>

                    </div>

                </div>

            </section>


            {/* SUMMARY CARDS */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="stat-card">

                    <p className="text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Products
                    </p>

                    <p className="mt-3 text-4xl font-black">
                        {totalProducts}
                    </p>

                    <p className="mt-2 text-xs text-black/40">
                        Catalogue items
                    </p>

                </div>


                <div className="stat-card">

                    <p className="text-xs font-black uppercase tracking-[0.14em] text-black/40">
                        Total Stock
                    </p>

                    <p className="mt-3 text-4xl font-black">
                        {totalUnits}
                    </p>

                    <p className="mt-2 text-xs text-black/40">
                        Units available
                    </p>

                </div>


                <div className="stat-card">

                    <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                        Low Stock
                    </p>

                    <p className="mt-3 text-4xl font-black text-orange-600">
                        {lowStock}
                    </p>

                    <p className="mt-2 text-xs text-black/40">
                        5 units or less
                    </p>

                </div>


                <div className="stat-card">

                    <p className="text-xs font-black uppercase tracking-[0.14em] text-red-600">
                        Out of Stock
                    </p>

                    <p className="mt-3 text-4xl font-black text-red-600">
                        {outOfStock}
                    </p>

                    <p className="mt-2 text-xs text-black/40">
                        Requires attention
                    </p>

                </div>

            </section>


            {/* SUCCESS */}

            {message && (

                <div
                    role="status"
                    className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-800"
                >
                    {message}
                </div>

            )}


            {/* UPDATE ERROR */}

            {stockMutation.isError && (

                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"
                >
                    {stockMutation.error.response?.data
                            ?.message ||
                        "Unable to update stock."}
                </div>

            )}


            {/* INVENTORY TABLE */}

            <section className="overflow-hidden rounded-xl border border-black/10 bg-white">

                <div className="flex flex-col justify-between gap-5 border-b border-black/10 bg-[#f8f6f1] p-6 sm:flex-row sm:items-center">

                    <div>

                        <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                            Live Inventory
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                            Stock Levels
                        </h2>

                        <p className="mt-2 text-sm text-black/40">
                            Update product quantities directly
                            from this dashboard.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn-outline self-start sm:self-auto"
                        disabled={
                            inventory.isFetching
                        }
                        onClick={() =>
                            inventory.refetch()
                        }
                    >
                        {inventory.isFetching
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>


                {inventory.isPending ? (

                    <div className="p-8">

                        <p className="font-bold text-black/45">
                            Loading inventory...
                        </p>

                    </div>

                ) : inventory.isError ? (

                    <div className="m-6 rounded-xl border border-orange-200 bg-orange-50 p-6">

                        <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                            Connection Error
                        </p>

                        <h3 className="mt-3 text-xl font-black">
                            Inventory could not be loaded.
                        </h3>

                        <p className="mt-2 text-sm text-black/50">
                            Check that the backend server is
                            running.
                        </p>

                        <button
                            className="btn-primary mt-5"
                            onClick={() =>
                                inventory.refetch()
                            }
                        >
                            Retry
                        </button>

                    </div>

                ) : products.length === 0 ? (

                    <div className="p-10 text-center">

                        <h3 className="text-2xl font-black">
                            No inventory records.
                        </h3>

                        <p className="mt-2 text-sm text-black/45">
                            Products will appear here after
                            they are added.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px] text-left text-sm">

                            <thead className="bg-[#171717] text-white">

                            <tr>

                                {[
                                    "Product",
                                    "Category",
                                    "Price",
                                    "Status",
                                    "Current Stock",
                                    "Update Stock",
                                ].map((heading) => (

                                    <th
                                        key={heading}
                                        scope="col"
                                        className="px-5 py-4 text-xs font-black uppercase tracking-[0.11em]"
                                    >
                                        {heading}
                                    </th>

                                ))}

                            </tr>

                            </thead>


                            <tbody className="divide-y divide-black/5">

                            {products.map((product) => {

                                const quantity =
                                    Number(
                                        product.quantity ?? 0
                                    );

                                const updating =
                                    stockMutation.isPending &&
                                    stockMutation.variables
                                        ?.productId ===
                                    product.productId;


                                return (

                                    <tr
                                        key={
                                            product.productId
                                        }
                                        className="transition hover:bg-[#faf8f4]"
                                    >

                                        {/* PRODUCT */}
                                        <td className="px-5 py-5">

                                            <p className="font-black text-black">
                                                {product.name}
                                            </p>

                                            <p className="mt-1 text-xs text-black/35">
                                                Product ID:{" "}
                                                {product.productId}
                                            </p>

                                        </td>


                                        {/* CATEGORY */}
                                        <td className="px-5 py-5 font-semibold text-black/55">

                                            {product.category?.name ||
                                                "Uncategorized"}

                                        </td>


                                        {/* PRICE */}
                                        <td className="whitespace-nowrap px-5 py-5 font-black">

                                            Rs.{" "}
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-LK",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}

                                        </td>


                                        {/* STATUS */}
                                        <td className="px-5 py-5">

                                            {quantity === 0 ? (

                                                <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">
                            Out of stock
                          </span>

                                            ) : quantity <= 5 ? (

                                                <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black text-orange-700">
                            Low stock
                          </span>

                                            ) : (

                                                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-700">
                            In stock
                          </span>

                                            )}

                                        </td>


                                        {/* CURRENT STOCK */}
                                        <td className="px-5 py-5">

                        <span className="text-2xl font-black">
                          {quantity}
                        </span>

                                            <span className="ml-2 text-xs text-black/35">
                          units
                        </span>

                                        </td>


                                        {/* UPDATE */}
                                        <td className="px-5 py-5">

                                            <div className="flex items-center gap-2">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        getDraftQuantity(
                                                            product
                                                        )
                                                    }
                                                    disabled={updating}
                                                    onChange={(event) =>
                                                        changeQuantity(
                                                            product.productId,
                                                            event.target.value
                                                        )
                                                    }
                                                    className="w-24 rounded-lg border border-black/10 bg-[#f8f6f1] px-3 py-2.5 text-sm font-bold text-black outline-none focus:border-orange-500"
                                                />


                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    disabled={
                                                        updating
                                                    }
                                                    onClick={() =>
                                                        saveStock(product)
                                                    }
                                                >
                                                    {updating
                                                        ? "Saving..."
                                                        : "Update"}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                );
                            })}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}
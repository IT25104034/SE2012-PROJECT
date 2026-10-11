import { useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getInventory,
    updateStock,
} from "../services/inventoryService.js";

export default function InventoryManagement() {
    const queryClient = useQueryClient();

    const [editedQuantities, setEditedQuantities] =
        useState({});

    const [message, setMessage] = useState("");

    const inventoryQuery = useQuery({
        queryKey: ["inventory"],
        queryFn: getInventory,
    });

    const stockMutation = useMutation({
        mutationFn: updateStock,

        onSuccess: async () => {
            setMessage("Stock updated successfully.");

            await queryClient.invalidateQueries({
                queryKey: ["inventory"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["products"],
            });
        },
    });

    function currentQuantity(item) {
        const productId = item.product?.productId;

        if (
            editedQuantities[productId] !== undefined
        ) {
            return editedQuantities[productId];
        }

        return item.quantityOnHand ?? 0;
    }

    function changeQuantity(productId, value) {
        setMessage("");

        setEditedQuantities((current) => ({
            ...current,
            [productId]: value,
        }));
    }

    function saveStock(item) {
        const productId = item.product?.productId;
        const quantity = Number(
            currentQuantity(item)
        );

        if (!productId) {
            setMessage("Product information is missing.");
            return;
        }

        if (
            Number.isNaN(quantity) ||
            quantity < 0
        ) {
            setMessage(
                "Quantity must be 0 or greater."
            );
            return;
        }

        stockMutation.mutate({
            productId,
            quantity,
        });
    }

    if (inventoryQuery.isLoading) {
        return (
            <div className="panel p-8">
                Loading inventory...
            </div>
        );
    }

    if (inventoryQuery.isError) {
        return (
            <div className="panel p-8 text-red-700">
                Unable to load inventory.
            </div>
        );
    }

    const inventory =
        inventoryQuery.data ?? [];

    return (
        <section>
            <p className="eyebrow">
                Stock Management
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
                Inventory Management
            </h1>

            <p className="mt-2 text-slate-500">
                View product availability and update stock
                quantities.
            </p>

            {message && (
                <div className="mt-6 rounded-md bg-green-50 p-4 text-sm font-semibold text-green-700">
                    {message}
                </div>
            )}

            {stockMutation.isError && (
                <div className="mt-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">
                    {stockMutation.error?.response?.data
                            ?.message ||
                        "Unable to update stock."}
                </div>
            )}

            <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-slate-900 text-white">
                    <tr>
                        <th className="px-5 py-4">
                            Product
                        </th>

                        <th className="px-5 py-4">
                            Current Stock
                        </th>

                        <th className="px-5 py-4">
                            Reorder Level
                        </th>

                        <th className="px-5 py-4">
                            Update
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                    {inventory.map((item) => {
                        const productId =
                            item.product?.productId;

                        return (
                            <tr key={item.inventoryId}>
                                <td className="px-5 py-4 font-semibold">
                                    {item.product?.name ||
                                        `Product #${productId}`}
                                </td>

                                <td className="px-5 py-4">
                                    {item.quantityOnHand}
                                </td>

                                <td className="px-5 py-4">
                                    {item.reorderLevel}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="field-input w-28"
                                            value={currentQuantity(
                                                item
                                            )}
                                            onChange={(event) =>
                                                changeQuantity(
                                                    productId,
                                                    event.target.value
                                                )
                                            }
                                        />

                                        <button
                                            type="button"
                                            className="btn-primary"
                                            disabled={
                                                stockMutation.isPending
                                            }
                                            onClick={() =>
                                                saveStock(item)
                                            }
                                        >
                                            {stockMutation.isPending
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

            {inventory.length === 0 && (
                <div className="panel mt-6 p-8 text-slate-500">
                    No inventory records found.
                </div>
            )}
        </section>
    );
}
import apiClient from "./apiClient";

export async function getInventory() {
    return (await apiClient.get("/api/inventory")).data;
}

export async function updateStock({ productId, quantity }) {
    return (
        await apiClient.put(`/api/inventory/${productId}/stock`, {
            quantity: Number(quantity),
        })
    ).data;
}
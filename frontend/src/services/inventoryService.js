import apiClient from "./apiClient.js";


export async function getInventory() {
    const response = await apiClient.get(
        "/api/inventory"
    );

    return response.data;
}


export async function getInventoryProduct(productId) {
    const response = await apiClient.get(
        `/api/inventory/${productId}`
    );

    return response.data;
}


export async function updateProductStock({
                                             productId,
                                             quantity,
                                         }) {
    const response = await apiClient.put(
        `/api/inventory/${productId}/stock`,
        {
            quantity: Number(quantity),
        }
    );

    return response.data;
}
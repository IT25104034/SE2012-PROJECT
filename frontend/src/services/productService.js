import apiClient from "./apiClient";

export async function getProducts({ includeInactive = false } = {}) {
  return (await apiClient.get("/api/products", { params: { includeInactive } })).data;
}

export async function getProduct(productId) {
  return (await apiClient.get(`/api/products/${productId}`)).data;
}

export async function saveProduct({ productId, product }) {
  const response = productId
    ? await apiClient.put(`/api/products/${productId}`, product)
    : await apiClient.post("/api/products", product);
  return response.data;
}

export async function deleteProduct(productId) {
  await apiClient.delete(`/api/products/${productId}`);
}

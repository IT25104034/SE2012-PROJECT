import apiClient from "./apiClient";

export async function getCategories({ includeInactive = false } = {}) {
  const response = await apiClient.get("/api/categories", { params: { includeInactive } });
  return response.data;
}

export async function createCategory(category) {
  const response = await apiClient.post("/api/categories", category);
  return response.data;
}

export async function updateCategory({ categoryId, category }) {
  const response = await apiClient.put(
    `/api/categories/${categoryId}`,
    category
  );

  return response.data;
}

export async function deleteCategory(categoryId) {
  await apiClient.delete(`/api/categories/${categoryId}`);
}
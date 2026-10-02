import apiClient from "./apiClient";
export async function getUsers() { return (await apiClient.get("/api/admin/users")).data; }
export async function createUser(user) { return (await apiClient.post("/api/admin/users", user)).data; }

export async function updateUserRole({ userId, role }) { return (await apiClient.put(`/api/admin/users/${userId}/role`, { role })).data; }

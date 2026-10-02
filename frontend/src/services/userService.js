import apiClient from "./apiClient";
export async function getUsers() { return (await apiClient.get("/api/admin/users")).data; }
export async function createUser(user) { return (await apiClient.post("/api/admin/users", user)).data; }

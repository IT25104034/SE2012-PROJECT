import apiClient from "./apiClient.js";

export async function getUsers() {
    const response = await apiClient.get("/api/users");
    return response.data;
}

export async function updateUserRole({ userId, role }) {
    const response = await apiClient.put(
        `/api/users/${userId}/role`,
        { role }
    );

    return response.data;
}
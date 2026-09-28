import apiClient from "./apiClient.js";

export async function loginUser(credentials) {
    const response = await apiClient.post(
        "/api/auth/login",
        credentials
    );

    return response.data;
}

export async function registerUser(details) {
    const response = await apiClient.post(
        "/api/auth/register",
        details
    );

    return response.data;
}

export async function getCurrentUser() {
    const response = await apiClient.get(
        "/api/auth/me"
    );

    return response.data;
}

export async function logoutUser() {
    const response = await apiClient.post(
        "/api/auth/logout"
    );

    return response.data;
}
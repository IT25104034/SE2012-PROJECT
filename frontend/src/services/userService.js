import apiClient from "./apiClient";

export async function getUsers() {
    return (await apiClient.get("/api/users")).data;
}

export async function updateUserRole({ userId, role }) {
    return (
        await apiClient.put(`/api/users/${userId}/role`, null, {
            params: { role },
        })
    ).data;
}

export async function updateUserActiveStatus({ userId, active }) {
    return (
        await apiClient.put(`/api/users/${userId}/active`, null, {
            params: { active },
        })
    ).data;
}
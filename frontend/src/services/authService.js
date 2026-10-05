import apiClient from "./apiClient";

export async function login(credentials) {
  return (await apiClient.post("/api/auth/login", credentials)).data;
}

export async function register(details) {
  return (await apiClient.post("/api/auth/register", details)).data;
}

export async function getCurrentUser() {
  return (await apiClient.get("/api/auth/me")).data;
}

export async function logout() {
  await apiClient.post("/api/auth/logout");
}

export async function verifyRegistration(details) {
  return (await apiClient.post("/api/auth/register/verify", details)).data;
}

export async function resendRegistration(registrationId) {
  return (await apiClient.post("/api/auth/register/resend", { registrationId })).data;
}

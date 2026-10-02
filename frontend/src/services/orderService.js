import apiClient from "./apiClient";

export async function getCustomerOrders(userId) {
  return (await apiClient.get(`/api/orders/customer/${userId}`)).data;
}

export async function getOrderItems(orderId) {
  return (await apiClient.get(`/api/orders/${orderId}/items`)).data;
}

export async function updateOrderStatus({ orderId, status }) {
  return (
    await apiClient.put(`/api/orders/${orderId}/status`, null, {
      params: { status },
    })
  ).data;
}

export async function getOrdersByStatus(status) {
  return (await apiClient.get(`/api/orders/status/${status}`)).data;
}

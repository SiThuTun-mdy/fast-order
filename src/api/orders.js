import { request } from './client';

export async function getMenuItems(category) {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  return request(`/menu${query}`);
}

export async function getCategories() {
  return request('/categories');
}

export async function createOrder(orderData) {
  return request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
}

export async function getOrder(id) {
  return request(`/orders/${id}`);
}

export async function getOrders() {
  return request('/orders');
}

export async function updateOrderStatus(id, status) {
  return request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

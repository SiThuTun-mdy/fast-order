const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Request failed');
  return body;
}

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

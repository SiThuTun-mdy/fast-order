import { request } from './client';

// Admin-only, tenant-scoped menu CRUD — separate from the public
// getMenuItems(category) in api/orders.js used by the customer-facing menu.
export async function getMenuItems(restaurantId) {
  return request(`/menu?restaurantId=${encodeURIComponent(restaurantId)}`);
}

export async function createMenuItem(item) {
  return request('/menu', { method: 'POST', body: JSON.stringify(item) });
}

export async function updateMenuItem(id, patch) {
  return request(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function deleteMenuItem(id) {
  return request(`/menu/${id}`, { method: 'DELETE' });
}

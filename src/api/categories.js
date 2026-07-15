import { request } from './client';

// Admin-only, tenant-scoped category CRUD — separate from the public
// getCategories() in api/orders.js used by the customer-facing menu filter.
export async function getCategories(restaurantId) {
  return request(`/categories?restaurantId=${encodeURIComponent(restaurantId)}`);
}

export async function createCategory(category) {
  return request('/categories', { method: 'POST', body: JSON.stringify(category) });
}

export async function updateCategory(id, patch) {
  return request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function deleteCategory(id) {
  return request(`/categories/${id}`, { method: 'DELETE' });
}

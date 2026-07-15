import { request } from './client';

export async function getTenants() {
  return request('/tenants');
}

export async function getTenant(id) {
  return request(`/tenants/${id}`);
}

export async function createTenant(tenant) {
  return request('/tenants', { method: 'POST', body: JSON.stringify(tenant) });
}

export async function updateTenant(id, patch) {
  return request(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function deleteTenant(id) {
  return request(`/tenants/${id}`, { method: 'DELETE' });
}

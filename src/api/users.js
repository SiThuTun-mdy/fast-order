import { request } from './client';

export async function getUsers(restaurantId) {
  const query = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
  return request(`/users${query}`);
}

export async function checkUsernameAvailable(username) {
  const { available } = await request(`/users/check-username?username=${encodeURIComponent(username)}`);
  return available;
}

export async function createUser({ username, password, restaurantId, roleNames }) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, restaurantId, roleNames }),
  });
}

export async function updateUser(id, patch) {
  return request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' });
}

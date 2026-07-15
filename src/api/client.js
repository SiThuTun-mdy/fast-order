const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Token is read directly from localStorage (not React context) so this stays
// a plain module usable by any api/*.js file without a React dependency.
export async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? 'Request failed');
  return body;
}

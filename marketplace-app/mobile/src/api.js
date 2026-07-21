import { API_URL } from './config';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(data?.error || 'Error de red');
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  listProducts: (search) => request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload, token) => request('/products', { method: 'POST', body: payload, token }),
  createOffer: (payload, token) => request('/offers', { method: 'POST', body: payload, token }),
  listOffers: (token) => request('/offers', { token }),
  respondOffer: (id, payload, token) => request(`/offers/${id}`, { method: 'PUT', body: payload, token }),
  createReservation: (payload, token) => request('/reservations', { method: 'POST', body: payload, token }),
  createOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  listOrders: (token) => request('/orders', { token }),
  updateOrderStatus: (id, status, token) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: { status }, token }),
  listNotifications: (token) => request('/notifications', { token }),
};

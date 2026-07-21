const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${getToken()}`;

  const res = await fetch(`${BASE}${path}`, {
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
  createProduct: (payload) => request('/products', { method: 'POST', body: payload, auth: true }),
  createOffer: (payload) => request('/offers', { method: 'POST', body: payload, auth: true }),
  listOffers: () => request('/offers', { auth: true }),
  respondOffer: (id, payload) => request(`/offers/${id}`, { method: 'PUT', body: payload, auth: true }),
  createReservation: (payload) => request('/reservations', { method: 'POST', body: payload, auth: true }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload, auth: true }),
  listOrders: () => request('/orders', { auth: true }),
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: { status }, auth: true }),
  listNotifications: () => request('/notifications', { auth: true }),
};

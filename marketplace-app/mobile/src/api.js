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

function buildQuery(params) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return query ? `?${query}` : '';
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  listProducts: ({ search, category, mode } = {}, token) =>
    request(`/products${buildQuery({ search, category, mode })}`, { token }),
  listRecommended: (token) => request('/products/recommended', { token }),
  getProduct: (id, token) => request(`/products/${id}`, { token }),
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
  listReviews: (productId) => request(`/reviews/product/${productId}`),
  createReview: (payload, token) => request('/reviews', { method: 'POST', body: payload, token }),
};

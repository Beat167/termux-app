const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
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
  listProducts: ({ search, category, mode } = {}) =>
    request(`/products${buildQuery({ search, category, mode })}`),
  listRecommended: () => request('/products/recommended'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload }),
  createOffer: (payload) => request('/offers', { method: 'POST', body: payload }),
  listOffers: () => request('/offers'),
  respondOffer: (id, payload) => request(`/offers/${id}`, { method: 'PUT', body: payload }),
  createReservation: (payload) => request('/reservations', { method: 'POST', body: payload }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  listOrders: () => request('/orders'),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
  listNotifications: () => request('/notifications'),
  listReviews: (productId) => request(`/reviews/product/${productId}`),
  createReview: (payload) => request('/reviews', { method: 'POST', body: payload }),
};

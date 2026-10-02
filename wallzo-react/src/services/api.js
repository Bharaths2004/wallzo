// Central API configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth header
const authHeader = () => {
  const token = localStorage.getItem('wallzo_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Base fetch wrapper
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData (let browser set it with boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

// === Auth API ===
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  getMe: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  toggleWishlist: (productId) =>
    request(`/auth/wishlist/${productId}`, { method: 'POST' }),
};

// === Products API ===
export const productsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },

  getBySlug: (slug) => request(`/products/slug/${slug}`),

  getById: (id) => request(`/products/id/${id}`),

  getAllAdmin: () => request('/products/admin/all'),

  create: (formData) =>
    request('/products', {
      method: 'POST',
      body: formData,
      headers: {} // let fetch handle multipart
    }),

  update: (id, formData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {}
    }),

  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  updateStock: (id, sku, stock) =>
    request(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ sku, stock })
    }),
};

// === Orders API ===
export const ordersAPI = {
  create: (orderData) =>
    request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),

  confirmPayment: (orderId, paymentId) =>
    request(`/orders/${orderId}/pay`, { method: 'POST', body: JSON.stringify({ paymentId }) }),

  getMyOrders: () => request('/orders/my'),

  getAllAdmin: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders${qs ? '?' + qs : ''}`);
  },

  updateStatus: (orderId, status, note, trackingNumber) =>
    request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note, trackingNumber })
    }),

  getStats: () => request('/orders/stats'),
};

// === Admin API ===
export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getAnalytics: () => request('/admin/analytics'),

  getUsers: () => request('/admin/users'),
  updateUserRole: (userId, role) =>
    request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  toggleUserStatus: (userId) =>
    request(`/admin/users/${userId}/toggle`, { method: 'PUT' }),

  getPendingActions: () => request('/admin/pending'),
  approveAction: (actionId, note) =>
    request(`/admin/pending/${actionId}/approve`, { method: 'POST', body: JSON.stringify({ note }) }),
  rejectAction: (actionId, note) =>
    request(`/admin/pending/${actionId}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
};

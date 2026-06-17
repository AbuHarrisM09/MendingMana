import api from './api';

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const method = (options.method || 'GET').toUpperCase();
  const config = {
    method,
    url,
    headers: options.headers || {},
  };

  if (options.body) {
    config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
  }

  return api(config);
}

export async function getUserProfile() {
  return api.get('/api/user/profile');
}

export async function getUserWishlist() {
  return api.get('/api/user/wishlist');
}

export async function getUserReviews() {
  return api.get('/api/user/reviews');
}

export async function updateUserProfile(payload) {
  return api.put('/api/user/profile', payload);
}

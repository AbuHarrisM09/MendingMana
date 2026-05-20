export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // Bisa tambahkan event bus/location.reload atau redirect ke /login
    }
    throw new Error(data.message || 'Error fetch data');
  }

  return data;
}

export async function getUserProfile() {
  return fetchWithAuth('/api/user/profile');
}

export async function getUserWishlist() {
  return fetchWithAuth('/api/user/wishlist');
}

export async function getUserReviews() {
  return fetchWithAuth('/api/user/reviews');
}

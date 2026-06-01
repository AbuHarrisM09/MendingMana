import { fetchWithAuth } from './userService';

export async function getReviewsByGadget(gadgetId) {
  const cleanId = String(gadgetId).replace('g-', '');
  
  // If the user has a token, we pass it so they can see "myVote" status
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api/reviews/gadget/${cleanId}`, { headers });
  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat ulasan.');
  }
  return data;
}

export async function createReview(gadgetId, { rating, title, reviewText }) {
  const cleanId = String(gadgetId).replace('g-', '');
  return fetchWithAuth(`/api/reviews/gadget/${cleanId}`, {
    method: 'POST',
    body: JSON.stringify({
      rating: Number(rating),
      title: title || '',
      review_text: reviewText,
    }),
  });
}

export async function updateReview(reviewId, { rating, title, reviewText }) {
  return fetchWithAuth(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify({
      rating: Number(rating),
      title: title || '',
      review_text: reviewText,
    }),
  });
}

export async function deleteReview(reviewId) {
  return fetchWithAuth(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

export async function voteReview(reviewId, voteType) {
  // voteType can be 1 (upvote) or -1 (downvote)
  return fetchWithAuth(`/api/reviews/${reviewId}/vote`, {
    method: 'POST',
    body: JSON.stringify({
      vote_type: voteType,
    }),
  });
}

import api from './api';

export async function getReviewsByGadget(gadgetId) {
  const cleanId = String(gadgetId).replace('g-', '');
  return api.get(`/api/reviews/gadget/${cleanId}`);
}

export async function createReview(gadgetId, { rating, title, reviewText }) {
  const cleanId = String(gadgetId).replace('g-', '');
  return api.post(`/api/reviews/gadget/${cleanId}`, {
    rating: Number(rating),
    title: title || '',
    review_text: reviewText,
  });
}

export async function updateReview(reviewId, { rating, title, reviewText }) {
  return api.put(`/api/reviews/${reviewId}`, {
    rating: Number(rating),
    title: title || '',
    review_text: reviewText,
  });
}

export async function deleteReview(reviewId) {
  return api.delete(`/api/reviews/${reviewId}`);
}

export async function voteReview(reviewId, voteType) {
  // voteType can be 1 (upvote) or -1 (downvote)
  return api.post(`/api/reviews/${reviewId}/vote`, {
    vote_type: voteType,
  });
}

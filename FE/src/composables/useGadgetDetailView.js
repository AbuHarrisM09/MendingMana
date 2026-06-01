import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import logo from '../assets/logo.jpeg';
import { getGadgetById } from '../services/gadgetService';
import { formatPrice } from '../data/mockData.js';
import { wishlistIds, toggleWishlist, checkWishlist } from '../services/wishlistService';
import { getReviewsByGadget, createReview, voteReview, deleteReview } from '../services/reviewService';

export function useGadgetDetailView() {
  const route = useRoute();
  const router = useRouter();
  const loading = ref(true);
  const error = ref('');
  const gadget = ref(null);
  const activeImageIndex = ref(0);

  // Reviews states
  const reviews = ref([]);
  const loadingReviews = ref(false);
  const submittingReview = ref(false);
  const reviewError = ref('');
  const reviewSuccess = ref('');
  const reviewForm = ref({
    rating: 5,
    title: '',
    reviewText: ''
  });

  const cleanId = computed(() => {
    return String(route.params.id).replace('g-', '');
  });

  const isWishlisted = computed(() => {
    return wishlistIds.value.has(cleanId.value);
  });

  const token = computed(() => localStorage.getItem('token'));
  const isAuthenticated = computed(() => Boolean(token.value));
  const userFullName = computed(() => localStorage.getItem('userFullName') || 'Member');
  const userRole = computed(() => localStorage.getItem('role') || 'member');
  const userEmail = computed(() => localStorage.getItem('userEmail') || '');

  const activeImage = computed(() => {
    if (gadget.value?.images?.length > 0) {
      return gadget.value.images[activeImageIndex.value];
    }
    return '';
  });

  function prevImage() {
    if (gadget.value?.images?.length > 0) {
      activeImageIndex.value = (activeImageIndex.value - 1 + gadget.value.images.length) % gadget.value.images.length;
    }
  }

  function nextImage() {
    if (gadget.value?.images?.length > 0) {
      activeImageIndex.value = (activeImageIndex.value + 1) % gadget.value.images.length;
    }
  }

  const ratingDistribution = computed(() => {
    const dist = [
      { star: 5, count: 0 },
      { star: 4, count: 0 },
      { star: 3, count: 0 },
      { star: 2, count: 0 },
      { star: 1, count: 0 },
    ];
    if (!reviews.value || reviews.value.length === 0) return dist;
    reviews.value.forEach(r => {
      const starObj = dist.find(d => d.star === r.rating);
      if (starObj) {
        starObj.count++;
      }
    });
    return dist;
  });

  function getRatingCount(star) {
    const found = ratingDistribution.value.find(d => d.star === star);
    return found ? found.count : 0;
  }

  function getRatingPercent(star) {
    const total = reviews.value.length;
    if (total === 0) return 0;
    const count = getRatingCount(star);
    return (count / total) * 100;
  }

  async function handleWishlistToggle() {
    if (!isAuthenticated.value) {
      router.push('/login');
      return;
    }
    try {
      await toggleWishlist(route.params.id);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  }

  async function fetchReviews() {
    loadingReviews.value = true;
    try {
      reviews.value = await getReviewsByGadget(route.params.id);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      loadingReviews.value = false;
    }
  }

  async function submitReview() {
    if (!isAuthenticated.value) {
      router.push('/login');
      return;
    }
    if (!reviewForm.value.reviewText || reviewForm.value.reviewText.trim().length < 10) {
      reviewError.value = 'Teks ulasan minimal 10 karakter.';
      return;
    }

    submittingReview.value = true;
    reviewError.value = '';
    reviewSuccess.value = '';

    try {
      await createReview(route.params.id, {
        rating: reviewForm.value.rating,
        title: reviewForm.value.title,
        reviewText: reviewForm.value.reviewText
      });
      
      reviewSuccess.value = 'Ulasan berhasil disimpan!';
      reviewForm.value = { rating: 5, title: '', reviewText: '' };
      
      // Refresh gadget details and reviews to update average rating dynamically
      await fetchGadgetSilently();
      await fetchReviews();
    } catch (err) {
      reviewError.value = err.message || 'Gagal menyimpan ulasan.';
    } finally {
      submittingReview.value = false;
    }
  }

  async function handleVote(reviewId, voteType) {
    if (!isAuthenticated.value) {
      router.push('/login');
      return;
    }
    try {
      const res = await voteReview(reviewId, voteType);
      
      // Update local review state reactively
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) {
        review.upvotes = res.upvotes;
        review.downvotes = res.downvotes;
        review.myVote = res.action === 'removed' ? null : voteType;
      }
    } catch (err) {
      alert(err.message || 'Gagal memproses vote.');
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return;
    try {
      await deleteReview(reviewId);
      await fetchGadgetSilently();
      await fetchReviews();
    } catch (err) {
      alert(err.message || 'Gagal menghapus ulasan.');
    }
  }

  async function fetchGadgetSilently() {
    try {
      const data = await getGadgetById(route.params.id);
      gadget.value = data;
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchGadget() {
    loading.value = true;
    error.value = '';
    try {
      const data = await getGadgetById(route.params.id);
      gadget.value = data;
      activeImageIndex.value = 0;
      
      // Load check in background if authenticated
      if (isAuthenticated.value) {
        checkWishlist(route.params.id).catch(() => {});
      }

      await fetchReviews();
    } catch (err) {
      error.value = err.message || 'Gagal memuat detail gadget.';
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetchGadget();
  });

  return {
    logo,
    loading,
    error,
    gadget,
    activeImageIndex,
    activeImage,
    prevImage,
    nextImage,
    getRatingCount,
    getRatingPercent,
    fetchGadget,
    formatPrice,
    isWishlisted,
    handleWishlistToggle,
    isAuthenticated,
    reviews,
    loadingReviews,
    submittingReview,
    reviewError,
    reviewSuccess,
    reviewForm,
    submitReview,
    handleVote,
    handleDeleteReview,
    userFullName,
    userRole,
    userEmail,
    currentUserId: computed(() => {
      if (!token.value) return null;
      try {
        const parts = token.value.split('.');
        const payload = JSON.parse(atob(parts[1]));
        return payload.sub;
      } catch (e) {
        return null;
      }
    })
  };
}

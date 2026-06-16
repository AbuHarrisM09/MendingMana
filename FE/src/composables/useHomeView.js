import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import logo from '../assets/logo.jpeg';
import { getGadgets } from '../services/gadgetService.js';
import {
  SlidersHorizontal, Smartphone, Monitor, Tablet, Headphones, Watch
} from 'lucide-vue-next';
import { loadWishlist } from '../services/wishlistService';
import { useToast } from './useToast';

export function useHomeView() {
  const router = useRouter();

  const gadgets = ref([]);
  const loading = ref(true);

  const token = ref(localStorage.getItem('token') || '');
  const role = ref(localStorage.getItem('role') || '');
  const userName = ref(localStorage.getItem('userFullName') || '');
  const userEmail = ref(localStorage.getItem('userEmail') || 'user@email.com');
  const userAvatar = ref(localStorage.getItem('userAvatar') || '');
  const isAuthenticated = computed(() => Boolean(token.value));
  const profileOpen = ref(false);

  // Close profile dropdown when clicking outside
  const closeDropdown = (e) => {
    if (profileOpen.value && !e.target.closest('[data-profile-dropdown]')) {
      profileOpen.value = false;
    }
  };

  onMounted(async () => {
    document.addEventListener('click', closeDropdown);
    
    // Load wishlist in background if authenticated
    if (isAuthenticated.value) {
      loadWishlist().catch(() => {});
    }

    try {
      const data = await getGadgets();
      gadgets.value = data;
    } catch (error) {
      console.error('Failed to load gadgets:', error);
    } finally {
      loading.value = false;
    }
  });

  onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
  });

  function goLogin() { router.push('/login'); }
  function goAdmin() { router.push('/admin'); }
  function goDashboard() { router.push('/dashboard'); }
  function goDashboardWishlist() { router.push('/dashboard'); }
  function toggleProfile() { profileOpen.value = !profileOpen.value; }
  function closeProfile() { profileOpen.value = false; }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    
    token.value = '';
    role.value = '';
    userName.value = '';
    
    const { showToast } = useToast();
    showToast('Anda berhasil keluar dari akun.', 'success');
    
    if (router.currentRoute.value.path !== '/') {
      router.push('/');
    }
  }

  const searchQuery = ref('');
  const activeCategory = ref('all');
  const sortBy = ref('newest');

  const categories = [
    { label: "Semua", value: "all", icon: SlidersHorizontal },
    { label: "Smartphone", value: "Smartphone", icon: Smartphone },
    { label: "Laptop", value: "Laptop", icon: Monitor },
    { label: "Tablet", value: "Tablet", icon: Tablet },
    { label: "Aksesori", value: "Aksesori", icon: Headphones },
    { label: "Smartwatch", value: "Smartwatch", icon: Watch },
  ];

  const sortOptions = [
    { label: "Terbaru", value: "newest" },
    { label: "Rating Tertinggi", value: "rating" },
    { label: "Ulasan Terbanyak", value: "reviews" },
    { label: "Harga Terendah", value: "price_asc" },
    { label: "Harga Tertinggi", value: "price_desc" },
  ];

  const selectStyle = {
    backgroundImage: "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27currentColor%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px'
  };

  const trendingGadgets = computed(() => gadgets.value.filter(g => g.isTrending).slice(0, 3));
  const heroGadget = computed(() => trendingGadgets.value[0] || gadgets.value[0]);

  const filteredGadgets = computed(() => {
    return gadgets.value
      .filter(g => {
        const matchCat = activeCategory.value === 'all' || g.category === activeCategory.value;
        const matchSearch = !searchQuery.value ||
          (g.name && g.name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (g.brand && g.brand.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (g.category && g.category.toLowerCase().includes(searchQuery.value.toLowerCase()));
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        switch (sortBy.value) {
          case 'rating': return b.averageRating - a.averageRating;
          case 'reviews': return b.totalReviews - a.totalReviews;
          case 'price_asc': return a.price - b.price;
          case 'price_desc': return b.price - a.price;
          default: return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }
      });
  });

  const handleCategoryClick = (catValue) => {
    activeCategory.value = catValue;
  };

  const handleSearch = () => {
    // Triggers computed filter reactively
  };

  return {
    logo,
    gadgets,
    loading,
    token,
    role,
    userName,
    userEmail,
    userAvatar,
    isAuthenticated,
    profileOpen,
    searchQuery,
    activeCategory,
    sortBy,
    categories,
    sortOptions,
    selectStyle,
    heroGadget,
    filteredGadgets,
    goLogin,
    goAdmin,
    goDashboard,
    goDashboardWishlist,
    toggleProfile,
    closeProfile,
    logout,
    handleCategoryClick,
    handleSearch
  };
}

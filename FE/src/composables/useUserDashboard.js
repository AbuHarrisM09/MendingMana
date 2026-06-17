import { ref, reactive, onMounted, computed } from 'vue';
import logo from '../assets/logo.jpeg';
import { useRouter } from 'vue-router';
import { getUserProfile, getUserWishlist, getUserReviews, updateUserProfile } from '../services/userService';
import { LayoutDashboard, MessageSquare, Heart } from 'lucide-vue-next';
import { removeFromWishlist } from '../services/wishlistService';
import { useToast } from './useToast';

export function useUserDashboard() {
  const router = useRouter();

  const loading = ref(true);
  const error = ref('');
  const activeTab = ref('overview');

  const profile = ref(null);
  const wishlist = ref([]);
  const reviews = ref([]);

  const joinDate = computed(() => {
    if (!profile.value?.user?.createdAt) return 'Baru saja';
    const dateOptions = { year: 'numeric', month: 'long' };
    return new Date(profile.value.user.createdAt).toLocaleDateString('id-ID', dateOptions);
  });

  const profileStats = computed(() => [
    { label: 'Total Ulasan', value: profile.value?.stats?.totalReviews || 0 },
    { label: 'Rata-rata Rating', value: (profile.value?.stats?.averageRating || 5.0).toFixed(1) },
    { label: 'Wishlist', value: profile.value?.stats?.totalWishlist || 0 },
  ]);

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'reviews', label: `Ulasan`, icon: MessageSquare },
    { id: 'wishlist', label: `Wishlist`, icon: Heart },
  ];

  function formatPrice(price) {
    if (!price) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    const { showToast } = useToast();
    showToast('Anda berhasil keluar dari akun.', 'success');
    router.push('/login');
  }

  async function loadData() {
    loading.value = true;
    error.value = '';
    try {
      const [profData, wishData, revData] = await Promise.all([
        getUserProfile(),
        getUserWishlist(),
        getUserReviews()
      ]);
      
      profile.value = profData;
      wishlist.value = wishData || [];
      reviews.value = revData || [];
    } catch (err) {
      if (err.message.includes('401') || err.message.toLowerCase().includes('token')) {
        error.value = 'Sesi telah berakhir, silakan login kembali.';
        setTimeout(() => router.push('/login'), 2000);
      } else {
        error.value = err.message || 'Gagal mengambil data dari server.';
      }
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadData();
  });

  async function handleRemoveWishlist(gadgetId) {
    try {
      await removeFromWishlist(gadgetId);
      // Remove from reactive list
      wishlist.value = wishlist.value.filter(
        item => item.id !== gadgetId && item.id !== `g-${gadgetId}`
      );
      if (profile.value?.stats) {
        profile.value.stats.totalWishlist = Math.max(0, Number(profile.value.stats.totalWishlist) - 1);
      }
    } catch (err) {
      console.error('Gagal menghapus dari wishlist:', err);
    }
  }

  // ─── EDIT PROFILE ───
  const showEditModal = ref(false);
  const editLoading = ref(false);
  const editForm = reactive({
    fullName: '',
    bio: '',
  });
  const editErrors = reactive({
    fullName: '',
  });

  function openEditModal() {
    editForm.fullName = profile.value?.user?.fullName || '';
    editForm.bio = profile.value?.user?.bio || '';
    editErrors.fullName = '';
    showEditModal.value = true;
  }

  async function submitEdit() {
    if (!editForm.fullName || editForm.fullName.trim().length < 3) {
      editErrors.fullName = 'Nama lengkap minimal 3 karakter.';
      return;
    }

    editLoading.value = true;
    try {
      const res = await updateUserProfile({
        fullName: editForm.fullName,
        bio: editForm.bio,
      });

      // Update state local
      if (profile.value) {
        profile.value.user.fullName = res.user.fullName;
        profile.value.user.bio = res.user.bio;
        // Simpan nama baru ke cache localStorage
        localStorage.setItem("userFullName", res.user.fullName);
      }

      showEditModal.value = false;
      const { showToast } = useToast();
      showToast('Profil Anda berhasil diperbarui.', 'success');
    } catch (err) {
      const { showToast } = useToast();
      showToast(err.message || 'Gagal memperbarui profil.', 'error');
    } finally {
      editLoading.value = false;
    }
  }

  return {
    logo,
    loading,
    error,
    activeTab,
    profile,
    wishlist,
    reviews,
    joinDate,
    profileStats,
    tabs,
    formatPrice,
    logout,
    loadData,
    handleRemoveWishlist,
    showEditModal,
    editLoading,
    editForm,
    editErrors,
    openEditModal,
    submitEdit
  };
}

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import logo from '../assets/logo.jpeg';
import { useRouter, useRoute } from 'vue-router';
import { getGadgets } from '../services/gadgetService';
import {
  compareGadgets,
  getCompareSessions,
  createCompareSession,
  updateCompareSession,
  deleteCompareSession
} from '../services/compareService';
import { formatPrice } from '../data/mockData.js';
import { useToast } from './useToast';

export function useCompareView() {
  const router = useRouter();
  const route = useRoute();

  // Authenticated user parameters
  const token = ref(localStorage.getItem('token') || '');
  const role = ref(localStorage.getItem('role') || '');
  const userName = ref(localStorage.getItem('userFullName') || '');
  const userEmail = ref(localStorage.getItem('userEmail') || 'user@email.com');
  const userAvatar = ref(localStorage.getItem('userAvatar') || '');
  const isAuthenticated = computed(() => Boolean(token.value));
  const isMember = computed(() => isAuthenticated.value && role.value === 'member');

  const profileOpen = ref(false);

  // Closing standard dropdown and suggestions
  const closeDropdown = (e) => {
    if (profileOpen.value && !e.target.closest('[data-profile-dropdown]')) {
      profileOpen.value = false;
    }
    if (searchFocused.value && !e.target.closest('.relative.max-w-2xl')) {
      searchFocused.value = false;
    }
  };

  // Comparison workspace state
  const allGadgets = ref([]);
  const comparedGadgetIds = ref([]);
  const comparedGadgetsData = ref(null);
  const loadingCompare = ref(false);

  // Active Session tracking
  const activeSessionId = ref(null);
  const activeSessionTitle = ref('');

  // Search states
  const searchQuery = ref('');
  const searchFocused = ref(false);
  const searchInputRef = ref(null);

  // Member sessions states
  const sessionsList = ref([]);
  const loadingSessions = ref(false);

  // Save session modal states
  const saveModalOpen = ref(false);

  // Default placeholder for session title based on compared gadgets
  const defaultSessionTitle = computed(() => {
    if (!comparedGadgetsData.value || !comparedGadgetsData.value.gadgets) return 'Komparasi Baru';
    const names = comparedGadgetsData.value.gadgets.map(g => g.name);
    return `Komparasi: ${names.join(' vs ')}`;
  });

  // Search matches computed
  const searchResults = computed(() => {
    const isSearchEmpty = !searchQuery.value.trim();
    let list = allGadgets.value;
    
    if (!isSearchEmpty) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(g => 
        g.name.toLowerCase().includes(q) ||
        g.brand.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }
    
    const filtered = list.filter(g => {
      // Normalize IDs to make sure comparison matches e.g. "g-1" vs "g-1" or "1"
      const isAdded = comparedGadgetIds.value.some(addedId => {
        const addedNum = String(addedId).replace('g-', '');
        const gNum = String(g.id).replace('g-', '');
        return addedNum === gNum;
      });
      return !isAdded;
    });

    // If query is empty, show the first 10 available gadgets for quick selection
    return isSearchEmpty ? filtered.slice(0, 10) : filtered;
  });

  onMounted(async () => {
    document.addEventListener('click', closeDropdown);
    
    // 1. Fetch all gadgets for fast memory searching
    try {
      const list = await getGadgets();
      allGadgets.value = list.map(item => ({
        ...item,
        id: String(item.id).startsWith('g-') ? item.id : `g-${item.id}`
      }));
    } catch (err) {
      console.error('Failed to load gadgets list:', err);
    }

    // 2. Fetch user saved sessions list if logged in
    if (isMember.value) {
      fetchSessions();
    }

    // 3. Look for query parameter list
    const idsQuery = route.query.ids || route.query.gadgetIds;
    if (idsQuery) {
      const list = String(idsQuery).split(',').map(s => s.trim()).filter(Boolean);
      comparedGadgetIds.value = list.map(item => String(item).startsWith('g-') ? item : `g-${item}`);
    }
  });

  onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
  });

  // Watcher to trigger specs matrix calculation
  watch(comparedGadgetIds, () => {
    triggerComparison();
  }, { deep: true });

  const triggerComparison = async () => {
    if (comparedGadgetIds.value.length === 0) {
      comparedGadgetsData.value = null;
      return;
    }
    loadingCompare.value = true;
    try {
      const rawIds = comparedGadgetIds.value.map(id => String(id).replace('g-', ''));
      const data = await compareGadgets(rawIds);
      comparedGadgetsData.value = data;
    } catch (err) {
      console.error('Error fetching comparison matrix:', err);
    } finally {
      loadingCompare.value = false;
    }
  };

  // Adding / Removing items from active workspace
  const addGadgetToCompare = (id) => {
    if (comparedGadgetIds.value.length >= 4) return;
    
    const normId = String(id).startsWith('g-') ? id : `g-${id}`;
    if (!comparedGadgetIds.value.includes(normId)) {
      comparedGadgetIds.value.push(normId);
    }
    
    searchQuery.value = '';
    searchFocused.value = false;
  };

  const removeGadgetFromCompare = (id) => {
    const normId = String(id).startsWith('g-') ? id : `g-${id}`;
    comparedGadgetIds.value = comparedGadgetIds.value.filter(itemId => itemId !== normId);
  };

  const clearAllCompared = () => {
    comparedGadgetIds.value = [];
    clearActiveSessionState();
  };

  // saved session lists helpers
  const fetchSessions = async () => {
    loadingSessions.value = true;
    try {
      const data = await getCompareSessions();
      sessionsList.value = data;
    } catch (err) {
      console.error('Gagal mengambil sesi komparasi:', err);
    } finally {
      loadingSessions.value = false;
    }
  };

  const loadSavedSession = (session) => {
    activeSessionId.value = session.id;
    activeSessionTitle.value = session.title;
    comparedGadgetIds.value = session.gadgets.map(g => String(g.id).startsWith('g-') ? g.id : `g-${g.id}`);
  };

  const confirmDeleteSession = async (session) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sesi komparasi "${session.title}"?`)) return;
    try {
      await deleteCompareSession(session.id);
      if (activeSessionId.value === session.id) {
        clearActiveSessionState();
      }
      await fetchSessions();
    } catch (err) {
      alert(err.message || 'Gagal menghapus sesi komparasi.');
    }
  };

  const clearActiveSessionState = () => {
    activeSessionId.value = null;
    activeSessionTitle.value = '';
  };

  // Modal and Saving actions
  const openSaveModal = () => {
    saveModalOpen.value = true;
  };

  const handleSaveSession = async (titleInput, forceSaveAsNew = false) => {
    const title = titleInput.trim() || defaultSessionTitle.value;
    
    try {
      if (activeSessionId.value && !forceSaveAsNew) {
        await updateCompareSession(activeSessionId.value, title, comparedGadgetIds.value);
        activeSessionTitle.value = title;
      } else {
        const res = await createCompareSession(title, comparedGadgetIds.value);
        if (res && res.session) {
          activeSessionId.value = res.session.id;
          activeSessionTitle.value = res.session.title;
        }
      }
      
      saveModalOpen.value = false;
      await fetchSessions();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan sesi komparasi.');
    }
  };

  // Standard helper utilities
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date) + ' WIB';
  };

  function goLogin() { router.push('/login'); }
  function goAdmin() { router.push('/admin'); }
  function goDashboard() { router.push('/dashboard'); }
  function toggleProfile() { profileOpen.value = !profileOpen.value; }
  function closeProfile() { profileOpen.value = false; }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('user');
    localStorage.removeItem('loginMethod');
    
    token.value = '';
    role.value = '';
    userName.value = '';
    
    const { showToast } = useToast();
    if (router.currentRoute.value.path !== '/') {
      showToast('Anda berhasil keluar dari akun.', 'success');
      router.push('/');
    } else {
      localStorage.setItem('logoutToast', 'true');
      location.reload();
    }
  }

  return {
    logo,
    token,
    role,
    userName,
    userEmail,
    userAvatar,
    isAuthenticated,
    isMember,
    profileOpen,
    comparedGadgetIds,
    comparedGadgetsData,
    loadingCompare,
    activeSessionId,
    activeSessionTitle,
    searchQuery,
    searchFocused,
    searchInputRef,
    sessionsList,
    loadingSessions,
    saveModalOpen,
    defaultSessionTitle,
    searchResults,
    formatPrice,
    addGadgetToCompare,
    removeGadgetFromCompare,
    clearAllCompared,
    loadSavedSession,
    confirmDeleteSession,
    clearActiveSessionState,
    openSaveModal,
    handleSaveSession,
    formatDate,
    goLogin,
    goAdmin,
    goDashboard,
    toggleProfile,
    closeProfile,
    logout
  };
}

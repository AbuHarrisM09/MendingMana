import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import logo from '../assets/logo.jpeg';
import { getGadgetById } from '../services/gadgetService';
import { formatPrice } from '../data/mockData.js';

export function useGadgetDetailView() {
  const route = useRoute();
  const loading = ref(true);
  const error = ref('');
  const gadget = ref(null);
  const activeImageIndex = ref(0);

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

  function getRatingCount(star) {
    if (!gadget.value?.ratingDistribution) return 0;
    const found = gadget.value.ratingDistribution.find(d => d.star === star);
    return found ? found.count : 0;
  }

  function getRatingPercent(star) {
    if (!gadget.value?.ratingDistribution) return 0;
    const total = gadget.value.ratingDistribution.reduce((s, d) => s + d.count, 0);
    if (total === 0) return 0;
    const count = getRatingCount(star);
    return (count / total) * 100;
  }

  async function fetchGadget() {
    loading.value = true;
    error.value = '';
    try {
      const data = await getGadgetById(route.params.id);
      gadget.value = data;
      activeImageIndex.value = 0;
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
    formatPrice
  };
}

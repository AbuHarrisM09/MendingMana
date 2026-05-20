<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500 font-medium">Memuat data gadget...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
        <p class="font-semibold mb-4">{{ error }}</p>
        <button @click="fetchGadget" class="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
          Coba Lagi
        </button>
      </div>

      <!-- Gadget Detail -->
      <div v-else-if="gadget" class="space-y-8">
        <!-- Breadcrumb & Actions -->
        <div class="flex items-center justify-between">
          <button @click="$router.push('/')" class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
            &larr; Kembali ke Beranda
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="grid lg:grid-cols-2 gap-0">
            <!-- Image Gallery -->
            <div class="p-8 bg-slate-100/50 flex flex-col items-center justify-center">
              <div class="w-full aspect-square relative rounded-2xl overflow-hidden mb-4 bg-white border border-slate-200 flex items-center justify-center">
                <img 
                  v-if="gadget.images && gadget.images.length > 0" 
                  :src="activeImage || gadget.images[0]" 
                  :alt="gadget.name"
                  class="w-full h-full object-contain p-4 transition-all"
                />
                <div v-else class="text-slate-400 flex flex-col items-center">
                  <span class="text-sm">Tidak ada gambar</span>
                </div>
              </div>
              <!-- Thumbnails -->
              <div v-if="gadget.images && gadget.images.length > 1" class="flex items-center gap-3 overflow-x-auto w-full pb-2">
                <button 
                  v-for="(img, idx) in gadget.images" 
                  :key="idx"
                  @click="activeImage = img"
                  class="w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 bg-white flex items-center justify-center"
                  :class="activeImage === img ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-blue-400'"
                >
                  <img :src="img" :alt="gadget.name" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            <!-- Basic Info -->
            <div class="p-8 lg:p-10 flex flex-col justify-center">
              <div class="flex items-center gap-2 mb-4">
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ gadget.category || 'Uncategorized' }}
                </span>
                <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ gadget.brand || 'No Brand' }}
                </span>
              </div>
              
              <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">{{ gadget.name }}</h1>
              
              <div class="flex items-center gap-4 mb-6">
                <div class="flex items-center text-amber-500">
                  <span class="font-bold text-lg mr-1">{{ gadget.averageRating ? gadget.averageRating.toFixed(1) : '0.0' }}</span>
                  <span class="text-slate-400 text-sm font-medium">/ 5 ({{ gadget.totalReviews || 0 }} Ulasan)</span>
                </div>
              </div>

              <div class="text-3xl font-extrabold text-blue-600 mb-6">
                {{ formatPrice(gadget.price) }}
              </div>

              <p class="text-slate-600 leading-relaxed mb-8">
                {{ gadget.summary || gadget.description || 'Tidak ada deskripsi tersedia.' }}
              </p>

              <!-- Actions -->
              <div class="flex flex-col sm:flex-row gap-4">
                <button class="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
                  Bandingkan
                </button>
                <button class="py-4 px-6 bg-pink-50 text-pink-600 rounded-2xl font-bold text-lg hover:bg-pink-100 transition flex justify-center items-center gap-2">
                  &#9829; Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Description & Specs -->
        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Description Full -->
          <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Deskripsi Produk</h2>
            <div class="prose prose-slate max-w-none">
              <p class="whitespace-pre-wrap text-slate-600 leading-relaxed">{{ gadget.description }}</p>
            </div>
          </div>

          <!-- Specs Table -->
          <div class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-fit">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Spesifikasi Utama</h2>
            <div v-if="gadget.specs && gadget.specs.length > 0" class="divide-y divide-slate-100">
              <div v-for="(spec, idx) in gadget.specs" :key="idx" class="py-3 flex justify-between gap-4">
                <span class="text-slate-500 font-medium">{{ spec.spec_key }}</span>
                <span class="text-slate-900 font-semibold text-right">{{ spec.spec_value }}</span>
              </div>
            </div>
            <div v-else class="text-slate-500 italic text-sm">
              Belum ada data spesifikasi.
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getGadgetById } from '../services/gadgetService';
import { formatPrice } from '../data/mockData.js'; // Reuse the price formatter if suitable

const route = useRoute();
const loading = ref(true);
const error = ref('');
const gadget = ref(null);
const activeImage = ref('');

async function fetchGadget() {
  loading.value = true;
  error.value = '';
  
  try {
    const data = await getGadgetById(route.params.id);
    gadget.value = data;
    if (data.images && data.images.length > 0) {
      activeImage.value = data.images[0];
    }
  } catch (err) {
    error.value = err.message || 'Gagal memuat detail gadget.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchGadget();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <header class="mb-4 flex items-center justify-between">
        <button @click="$router.push('/')" class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm">
          &larr; Kembali
        </button>
      </header>

      <div v-if="loading" class="flex justify-center py-20">
        <Loader2 class="w-10 h-10 animate-spin text-blue-600" />
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center"
      >
        {{ error }}
      </div>

      <div v-else-if="data" class="space-y-6">
        <!-- Banner Admin -->
        <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {{ userName ? userName.charAt(0).toUpperCase() : 'A' }}
            </div>
            <div class="flex-1">
              <h1 class="text-white text-xl font-bold">{{ userName || 'Administrator' }}</h1>
              <p class="text-slate-300 text-sm mb-1">{{ userEmail }}</p>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">Administrator</span>
                <span class="text-slate-400 text-xs">Pusat Kendali Sistem</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div class="text-center">
              <p class="text-white text-2xl font-extrabold">{{ data.overview.totalUsers }}</p>
              <p class="text-slate-400 text-xs font-medium mt-1">PenggunaAktif</p>
            </div>
            <div class="text-center border-l border-white/10">
              <p class="text-white text-2xl font-extrabold">{{ data.overview.totalGadgets }}</p>
              <p class="text-slate-400 text-xs font-medium mt-1">Total Gadget</p>
            </div>
            <div class="text-center border-l border-white/10">
              <p class="text-white text-2xl font-extrabold">{{ data.overview.totalReviews }}</p>
              <p class="text-slate-400 text-xs font-medium mt-1">Total Ulasan</p>
            </div>
            <div class="text-center border-l border-white/10">
              <p class="text-red-400 text-2xl font-extrabold">{{ data.overview.pendingModeration }}</p>
              <p class="text-slate-400 text-xs font-medium mt-1">Perlu Moderasi</p>
            </div>
          </div>
        </div>

        <!-- Dashboard Widgets -->
        <div class="grid lg:grid-cols-3 gap-6">
          
          <!-- Sentiment Progress Bars -->
          <div class="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div class="mb-6">
              <h3 class="text-slate-800 font-bold">Sentimen Ulasan Global</h3>
              <p class="text-slate-500 text-xs mt-1">Distribusi rating positif vs negatif</p>
            </div>

            <div class="space-y-5">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span class="flex items-center gap-2"><Star class="w-4 h-4 fill-green-500 text-green-500" /> Positif (4-5)</span>
                  <span>{{ data.sentiment.positive }}</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: data.sentiment.positivePercent + '%' }"></div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span class="flex items-center gap-2"><Star class="w-4 h-4 fill-yellow-500 text-yellow-500" /> Netral (3)</span>
                  <span>{{ data.sentiment.neutral }}</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-500 rounded-full" :style="{ width: data.sentiment.neutralPercent + '%' }"></div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span class="flex items-center gap-2"><Star class="w-4 h-4 fill-red-500 text-red-500" /> Negatif (1-2)</span>
                  <span>{{ data.sentiment.negative }}</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500 rounded-full" :style="{ width: data.sentiment.negativePercent + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Reviews List -->
          <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h3 class="text-slate-800 font-bold">Ulasan Terbaru Masuk</h3>
                <p class="text-slate-500 text-xs mt-1">Aktivitas ulasan terakhir dari member</p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto pr-2" style="scrollbar-width: thin;">
              <div v-if="!data.recentReviews.length" class="text-slate-400 text-sm py-4 text-center">
                Belum ada ulasan yang masuk.
              </div>
              <div class="space-y-4">
                <div v-for="review in data.recentReviews" :key="review.id" class="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-500 text-sm">
                    U
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                      <p class="text-sm font-bold text-slate-900 truncate">{{ review.gadget_name || "Gadget" }}</p>
                      <div class="flex items-center gap-1 text-amber-400 shrink-0 bg-white px-2 py-0.5 border border-slate-200 rounded-md">
                        <Star class="w-3 h-3 fill-current" />
                        <span class="text-xs font-bold text-slate-700">{{ review.rating }}</span>
                      </div>
                    </div>
                    <p class="text-sm text-slate-600 line-clamp-2 leading-relaxed">"{{ review.content_preview }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Users,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-vue-next";
import axios from "axios";

const router = useRouter();

const userName = ref(localStorage.getItem("userFullName") || "");
const userEmail = ref(localStorage.getItem("userEmail") || "");

const data = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Sesuaikan url dengan pengaturan proxy atau base url
    const response = await axios.get("/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = response.data?.data ?? response.data;
    if (payload?.overview && payload?.sentiment) {
      data.value = payload;
    } else {
      error.value = response.data?.message || "Gagal memuat data dashboard.";
    }
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    } else {
      error.value =
        err.response?.data?.message ||
        "Terjadi kesalahan server saat mengambil data.";
    }
  } finally {
    loading.value = false;
  }
});

// Persentase sentimen sudah dihitung di backend (positivePercent, dst.)

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/");
}
</script>

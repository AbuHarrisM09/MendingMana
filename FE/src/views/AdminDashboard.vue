<template>
  <div class="min-h-screen bg-slate-50 p-6 md:p-10">
    <header
      class="mb-8 flex flex-col md:flex-row md:items-center justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
        <p class="text-sm text-slate-500">
          Ringkasan statistik aplikasi MendingMana.
        </p>
      </div>
      <button
        @click="logout"
        class="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition"
      >
        Logout
      </button>
    </header>

    <div v-if="loading" class="text-slate-500 flex items-center gap-2">
      <Loader2 class="w-5 h-5 animate-spin" />
      Memuat data...
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl"
    >
      {{ error }}
    </div>

    <div v-else-if="data">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <!-- Pengguna -->
        <div
          class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center"
            >
              <Users class="w-6 h-6 text-white" />
            </div>
            <ArrowRight class="w-4 h-4 text-slate-300" />
          </div>
          <p class="text-slate-800 text-3xl font-extrabold">
            {{ data.overview.totalUsers }}
          </p>
          <p class="text-slate-600 text-sm font-semibold">Total Pengguna</p>
          <p class="text-slate-400 text-xs mt-0.5">
            {{ data.overview.bannedUsers }} dibekukan
          </p>
        </div>

        <!-- Gadgets -->
        <div
          class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center"
            >
              <Smartphone class="w-6 h-6 text-white" />
            </div>
            <ArrowRight class="w-4 h-4 text-slate-300" />
          </div>
          <p class="text-slate-800 text-3xl font-extrabold">
            {{ data.overview.totalGadgets }}
          </p>
          <p class="text-slate-600 text-sm font-semibold">Total Gadget</p>
          <p class="text-slate-400 text-xs mt-0.5">Tersedia di katalog</p>
        </div>

        <!-- Ulasan -->
        <div
          class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center"
            >
              <MessageSquare class="w-6 h-6 text-white" />
            </div>
            <ArrowRight class="w-4 h-4 text-slate-300" />
          </div>
          <p class="text-slate-800 text-3xl font-extrabold">
            {{ data.overview.totalReviews }}
          </p>
          <p class="text-slate-600 text-sm font-semibold">Total Ulasan</p>
          <p class="text-slate-400 text-xs mt-0.5">Total ulasan terverifikasi</p>
        </div>

        <!-- Perlu Moderasi -->
        <div
          class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              class="w-11 h-11 bg-red-500 rounded-xl flex items-center justify-center"
            >
              <AlertTriangle class="w-6 h-6 text-white" />
            </div>
            <ArrowRight class="w-4 h-4 text-slate-300" />
          </div>
          <p class="text-slate-800 text-3xl font-extrabold">
            {{ data.overview.pendingModeration }}
          </p>
          <p class="text-slate-600 text-sm font-semibold">Perlu Moderasi</p>
          <p class="text-slate-400 text-xs mt-0.5">
            Ulasan menunggu divalidasi
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <!-- Sentiment Progress Bars (Alternative to PieChart without complex setup) -->
        <div
          class="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5"
        >
          <div class="mb-4">
            <h3 class="text-slate-800 font-bold">Sentimen Ulasan</h3>
            <p class="text-slate-400 text-xs mt-1">
              Distribusi positif vs negatif
            </p>
          </div>

          <div class="space-y-4 mt-6">
            <div class="flex flex-col gap-1">
              <div
                class="flex items-center justify-between text-xs font-semibold text-slate-600"
              >
                <span>Positif (4-5 Bintang)</span>
                <span>{{ data.sentiment.positive }}</span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500"
                  :style="{
                    width: data.sentiment.positivePercent + '%',
                  }"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div
                class="flex items-center justify-between text-xs font-semibold text-slate-600"
              >
                <span>Netral (3 Bintang)</span>
                <span>{{ data.sentiment.neutral }}</span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-yellow-500"
                  :style="{
                    width: data.sentiment.neutralPercent + '%',
                  }"
                ></div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div
                class="flex items-center justify-between text-xs font-semibold text-slate-600"
              >
                <span>Negatif (1-2 Bintang)</span>
                <span>{{ data.sentiment.negative }}</span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-red-500"
                  :style="{
                    width: data.sentiment.negativePercent + '%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Reviews List -->
        <div
          class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden flex flex-col"
        >
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-slate-800 font-bold">Ulasan Terbaru</h3>
              <p class="text-slate-400 text-xs mt-1">
                Aktivitas ulasan yang masuk akhir-akhir ini
              </p>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto">
            <div
              v-if="!data.recentReviews.length"
              class="text-slate-400 text-sm py-4 text-center"
            >
              Belum ada ulasan
            </div>
            <div class="space-y-3">
              <div
                v-for="review in data.recentReviews"
                :key="review.id"
                class="p-3 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-800">
                      {{ review.gadget_name || "Gadget" }}
                    </p>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                      {{ review.content_preview }}
                    </p>
                  </div>
                  <div
                    class="flex items-center bg-white px-2 py-1 border border-slate-200 rounded-lg shadow-xs"
                  >
                    <Star class="w-3 h-3 text-yellow-400 mr-1" />
                    <span class="text-xs font-bold text-slate-700">{{
                      review.rating
                    }}</span>
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

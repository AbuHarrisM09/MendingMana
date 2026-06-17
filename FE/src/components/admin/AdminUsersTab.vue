<template>
  <div class="max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl">
      <div>
        <h3 class="text-xl font-extrabold text-slate-900">Manajemen Pengguna</h3>
        <p class="text-slate-500 text-sm font-medium">Lihat daftar member, kelola status akun, dan pantau aktivitas pengguna.</p>
      </div>
      <div class="flex items-center gap-3 text-sm font-bold">
        <div class="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3.5 py-2 rounded-xl border border-emerald-100">
          <UserCheck class="w-4 h-4" />
          {{ activeCount }} Aktif
        </div>
        <div class="flex items-center gap-2 bg-red-50 text-red-600 px-3.5 py-2 rounded-xl border border-red-100">
          <ShieldBan class="w-4 h-4" />
          {{ bannedCount }} Banned
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-lg flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="search"
          type="text"
          placeholder="Cari nama atau email..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
      <div class="flex gap-2">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="statusFilter = filter.value"
          :class="[
            'px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
            statusFilter === filter.value
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-[2rem] border border-slate-100 p-16 flex justify-center items-center shadow-xl">
      <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 text-center shadow-lg">
      <p class="font-bold text-lg mb-2">Gagal Memuat Data</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="fetchUsers" class="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-500 transition-colors">
        Coba Lagi
      </button>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50">
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pengguna</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ulasan</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Bergabung</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/30 transition-colors group">
              <!-- Avatar + Name -->
              <td class="p-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-md"
                    :class="user.isBanned
                      ? 'bg-gradient-to-br from-red-400 to-red-600'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600'"
                  >
                    <img
                      v-if="user.profileImageUrl"
                      :src="user.profileImageUrl"
                      :alt="user.fullName"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="font-bold text-white text-sm">{{ user.fullName?.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{{ user.fullName }}</p>
                    <p class="text-xs text-slate-400 font-medium truncate">{{ user.username || '-' }}</p>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="p-5">
                <p class="text-sm text-slate-600 truncate max-w-[200px]">{{ user.email }}</p>
              </td>

              <!-- Status -->
              <td class="p-5">
                <span v-if="user.isBanned" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Banned
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Aktif
                </span>
              </td>

              <!-- Reviews -->
              <td class="p-5">
                <div class="flex items-center gap-1.5">
                  <MessageSquare class="w-3.5 h-3.5 text-slate-400" />
                  <span class="text-sm font-bold text-slate-700">{{ user.totalReviews }}</span>
                  <span v-if="user.avgRating > 0" class="text-[10px] text-slate-400">(★ {{ user.avgRating.toFixed(1) }})</span>
                </div>
              </td>

              <!-- Joined -->
              <td class="p-5">
                <p class="text-sm text-slate-500">{{ formatDate(user.createdAt) }}</p>
              </td>

              <!-- Actions -->
              <td class="p-5 text-right">
                <button
                  v-if="!user.isBanned"
                  @click="openBanModal(user)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors"
                >
                  <ShieldBan class="w-3.5 h-3.5" />
                  Ban
                </button>
                <button
                  v-else
                  @click="handleUnban(user)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg transition-colors"
                >
                  <ShieldCheck class="w-3.5 h-3.5" />
                  Unban
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="users.length === 0">
              <td colspan="6" class="p-16 text-center">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Users class="w-8 h-8 text-slate-300" />
                  </div>
                  <p class="text-slate-400 font-semibold">Tidak ada pengguna ditemukan.</p>
                  <p class="text-slate-400 text-sm mt-1">Coba ubah kata kunci pencarian atau filter.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
        <p class="text-sm text-slate-500 font-medium">
          Menampilkan <span class="font-bold text-slate-700">{{ users.length }}</span> dari <span class="font-bold text-slate-700">{{ total }}</span> pengguna
        </p>
        <div class="flex gap-1.5">
          <button
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
            class="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="p in paginationRange"
            :key="p"
            @click="goToPage(p)"
            :class="[
              'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
              p === currentPage
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            ]"
          >
            {{ p }}
          </button>
          <button
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
            class="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Ban Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBanModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showBanModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in z-10">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <ShieldBan class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 class="text-lg font-extrabold text-slate-900">Ban Pengguna</h4>
                <p class="text-sm text-slate-500">{{ banTarget?.fullName }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Alasan ban</label>
                <textarea
                  v-model="banReason"
                  rows="3"
                  placeholder="Jelaskan alasan pengguna ini di-ban..."
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Durasi ban (opsional)</label>
                <select
                  v-model="banDuration"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="">Permanen</option>
                  <option value="1d">1 Hari</option>
                  <option value="7d">7 Hari</option>
                  <option value="30d">30 Hari</option>
                  <option value="90d">90 Hari</option>
                </select>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                @click="showBanModal = false"
                class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                @click="handleBan"
                :disabled="banLoading"
                class="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-500 transition-colors disabled:opacity-60 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <div v-if="banLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <ShieldBan v-else class="w-4 h-4" />
                Konfirmasi Ban
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Unban Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUnbanModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showUnbanModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in z-10">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <ShieldCheck class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 class="text-lg font-extrabold text-slate-900">Unban Pengguna</h4>
                <p class="text-sm text-slate-500">{{ unbanTarget?.fullName }}</p>
              </div>
            </div>

            <p class="text-sm text-slate-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin membuka blokir akun <strong>{{ unbanTarget?.fullName }}</strong>? Pengguna ini akan dapat mengakses dan menggunakan akunnya kembali.
            </p>

            <div class="flex gap-3">
              <button
                @click="showUnbanModal = false"
                class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                @click="confirmUnban"
                :disabled="unbanLoading"
                class="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-60 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <div v-if="unbanLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                <ShieldCheck v-else class="w-4 h-4" />
                Ya, Unban
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import {
  Users, UserCheck, Search, ShieldBan, ShieldCheck,
  MessageSquare, ChevronLeft, ChevronRight,
} from "lucide-vue-next";
import { useToast } from "../../composables/useToast";

const { showToast } = useToast();

// ─── State ───
const users = ref([]);
const total = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const loading = ref(true);
const error = ref("");

const search = ref("");
const statusFilter = ref("all");

const showBanModal = ref(false);
const banTarget = ref(null);
const banReason = ref("");
const banDuration = ref("");
const banLoading = ref(false);

const showUnbanModal = ref(false);
const unbanTarget = ref(null);
const unbanLoading = ref(false);

const statusFilters = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Banned", value: "banned" },
];

// ─── Computed ───
const activeCount = computed(() => {
  if (statusFilter.value === "all") {
    return users.value.filter(u => !u.isBanned).length;
  }
  return total.value;
});

const bannedCount = computed(() => {
  if (statusFilter.value === "all") {
    return users.value.filter(u => u.isBanned).length;
  }
  return 0;
});

const paginationRange = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// ─── Fetch ───
async function fetchUsers() {
  loading.value = true;
  error.value = "";
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: search.value,
        status: statusFilter.value,
        page: currentPage.value,
        limit: 15,
      },
    });

    const payload = res.data?.data;
    users.value = payload.users || [];
    total.value = payload.total || 0;
    totalPages.value = payload.totalPages || 1;
  } catch (err) {
    error.value = err.response?.data?.message || "Gagal memuat daftar pengguna.";
  } finally {
    loading.value = false;
  }
}

// ─── Ban / Unban ───
function openBanModal(user) {
  banTarget.value = user;
  banReason.value = "";
  banDuration.value = "";
  showBanModal.value = true;
}

function computeBannedUntil(duration) {
  if (!duration) return null;
  const now = new Date();
  const days = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 };
  now.setDate(now.getDate() + (days[duration] || 0));
  return now.toISOString();
}

async function handleBan() {
  if (!banTarget.value) return;
  banLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    await axios.patch(`/api/admin/users/${banTarget.value.id}/ban`, {
      reason: banReason.value || null,
      bannedUntil: computeBannedUntil(banDuration.value),
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showBanModal.value = false;
    showToast(`Pengguna ${banTarget.value.fullName} berhasil di-ban.`, "success");
    await fetchUsers();
  } catch (err) {
    showToast(err.response?.data?.message || "Gagal mem-ban pengguna.", "error");
  } finally {
    banLoading.value = false;
  }
}

function handleUnban(user) {
  unbanTarget.value = user;
  unbanLoading.value = false;
  showUnbanModal.value = true;
}

async function confirmUnban() {
  if (!unbanTarget.value) return;
  unbanLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    await axios.patch(`/api/admin/users/${unbanTarget.value.id}/unban`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showUnbanModal.value = false;
    showToast(`Pengguna ${unbanTarget.value.fullName} berhasil di-unban.`, "success");
    await fetchUsers();
  } catch (err) {
    showToast(err.response?.data?.message || "Gagal meng-unban pengguna.", "error");
  } finally {
    unbanLoading.value = false;
  }
}

// ─── Pagination ───
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

// ─── Utils ───
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Watchers ───
let searchTimeout = null;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchUsers();
  }, 400);
});

watch(statusFilter, () => {
  currentPage.value = 1;
  fetchUsers();
});

watch(currentPage, () => {
  fetchUsers();
});

// ─── Init ───
onMounted(() => {
  fetchUsers();
});
</script>

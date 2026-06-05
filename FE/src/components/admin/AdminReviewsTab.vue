<template>
  <div class="max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl">
      <div>
        <h3 class="text-xl font-extrabold text-slate-900">Moderasi Ulasan</h3>
        <p class="text-slate-500 text-sm font-medium">Tinjau ulasan yang dilaporkan oleh pengguna untuk menjaga kualitas konten platform.</p>
      </div>
      
      <!-- Stats Summary -->
      <div class="flex flex-wrap items-center gap-3 text-sm font-bold">
        <div class="flex items-center gap-2 bg-amber-50 text-amber-600 px-3.5 py-2 rounded-xl border border-amber-100">
          <AlertTriangle class="w-4 h-4" />
          {{ pendingCount }} Pending
        </div>
        <div class="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3.5 py-2 rounded-xl border border-emerald-100">
          <CheckCircle class="w-4 h-4" />
          {{ resolvedCount }} Dihapus
        </div>
        <div class="flex items-center gap-2 bg-slate-50 text-slate-500 px-3.5 py-2 rounded-xl border border-slate-200">
          <XCircle class="w-4 h-4" />
          {{ rejectedCount }} Diabaikan
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-lg flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="search"
          type="text"
          placeholder="Cari kata kunci ulasan, nama penulis, atau pelapor..."
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
      <div class="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="statusFilter = filter.value"
          class="px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
          :class="[
            statusFilter === filter.value
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20'
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-[2rem] border border-slate-100 p-16 flex justify-center items-center shadow-xl">
      <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 text-center shadow-lg">
      <p class="font-bold text-lg mb-2">Gagal Memuat Data Laporan</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="fetchReports" class="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-500 transition-colors">
        Coba Lagi
      </button>
    </div>

    <!-- Reports Table / Grid -->
    <div v-else class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50">
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ulasan</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Gadget</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Pelapor & Alasan</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Laporan</th>
              <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="report in reports" :key="report.report_id" class="hover:bg-slate-50/30 transition-colors group">
              <!-- Review text snippet & author -->
              <td class="p-5 max-w-sm">
                <div class="space-y-1">
                  <div class="flex items-center gap-1">
                    <span class="text-xs font-bold text-amber-500">★ {{ report.review_rating }}</span>
                    <span class="text-xs font-extrabold text-slate-800 truncate" v-if="report.review_title">"{{ report.review_title }}"</span>
                  </div>
                  <p class="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                    "{{ report.review_text }}"
                  </p>
                  <p class="text-[11px] text-slate-400 font-semibold">
                    Oleh: <span class="text-slate-600">{{ report.author_name }}</span>
                    <span v-if="report.review_is_deleted" class="ml-1.5 px-1.5 py-0.2 bg-red-100 text-red-600 rounded text-[9px] font-bold">Dihapus</span>
                  </p>
                </div>
              </td>

              <!-- Gadget Name -->
              <td class="p-5">
                <p class="text-sm font-bold text-slate-800">{{ report.gadget_name }}</p>
                <p class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{{ report.gadget_slug }}</p>
              </td>

              <!-- Reporter & Reason -->
              <td class="p-5">
                <p class="text-sm font-bold text-slate-700">{{ report.reporter_name }}</p>
                <span class="inline-block text-[10px] font-black bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-md mt-0.5 uppercase tracking-wide">
                  {{ report.reason_code }}
                </span>
                <p class="text-xs text-slate-400 truncate max-w-[180px] mt-0.5" :title="report.reason_text">
                  {{ report.reason_text }}
                </p>
              </td>

              <!-- Status badge -->
              <td class="p-5">
                <span v-if="report.report_status === 'pending'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending
                </span>
                <span v-else-if="report.report_status === 'resolved'" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Dihapus
                </span>
                <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Diabaikan
                </span>
              </td>

              <!-- Date -->
              <td class="p-5">
                <p class="text-sm text-slate-500 font-medium">{{ formatDate(report.reported_at) }}</p>
              </td>

              <!-- Actions -->
              <td class="p-5 text-right">
                <button
                  @click="openDetailModal(report)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Tinjau
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="reports.length === 0">
              <td colspan="6" class="p-16 text-center">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare class="w-8 h-8 text-slate-300" />
                  </div>
                  <p class="text-slate-400 font-semibold">Tidak ada laporan ulasan ditemukan.</p>
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
          Menampilkan <span class="font-bold text-slate-700">{{ reports.length }}</span> dari <span class="font-bold text-slate-700">{{ total }}</span> laporan
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

    <!-- Review Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDetailModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDetailModal = false"></div>
          
          <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in z-10 flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <MessageSquare class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 class="text-lg font-extrabold text-slate-900">Rincian Laporan Ulasan</h4>
                  <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Report ID: #{{ activeReport?.report_id }}</p>
                </div>
              </div>
              <button @click="showDetailModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6 overflow-y-auto flex-1">
              <!-- Gadget Info Card -->
              <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Produk Gadget</span>
                  <p class="text-base font-extrabold text-slate-800">{{ activeReport?.gadget_name }}</p>
                </div>
                <div class="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-black">
                  <span>★</span>
                  <span>{{ activeReport?.review_rating }}</span>
                </div>
              </div>

              <!-- Author Info Card -->
              <div class="space-y-2">
                <p class="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Penulis Ulasan</p>
                <div class="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center overflow-hidden shadow">
                      <img v-if="activeReport?.author_avatar" :src="activeReport?.author_avatar" :alt="activeReport?.author_name" class="w-full h-full object-cover" />
                      <span v-else class="text-white font-bold text-sm">{{ activeReport?.author_name?.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-800">{{ activeReport?.author_name }}</p>
                      <p class="text-[11px] text-slate-400 font-semibold">User ID: {{ activeReport?.author_id }}</p>
                    </div>
                  </div>
                  <!-- Quick Ban Link/Button -->
                  <button
                    v-if="activeReport?.report_status === 'pending'"
                    @click="openBanModalFromReport"
                    class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-xs font-extrabold transition-colors flex items-center gap-1"
                  >
                    <ShieldBan class="w-3.5 h-3.5" />
                    Ban Penulis
                  </button>
                </div>
              </div>

              <!-- Review Text Box -->
              <div class="space-y-2">
                <p class="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Isi Ulasan</p>
                <div class="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 relative">
                  <span class="text-4xl text-slate-200 font-serif absolute left-2 top-0 pointer-events-none">“</span>
                  <div class="pl-4 pr-2 py-2">
                    <p class="text-sm font-bold text-slate-800 mb-1" v-if="activeReport?.review_title">"{{ activeReport?.review_title }}"</p>
                    <p class="text-sm text-slate-700 leading-relaxed italic">
                      {{ activeReport?.review_text }}
                    </p>
                  </div>
                  <span class="text-4xl text-slate-200 font-serif absolute right-4 bottom-2 pointer-events-none">”</span>
                </div>
              </div>

              <!-- Report Reason Card -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-red-50/40 border border-red-100 rounded-2xl p-4">
                  <span class="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block mb-1">Pelapor</span>
                  <p class="text-sm font-bold text-slate-800">{{ activeReport?.reporter_name }}</p>
                  <p class="text-[11px] text-slate-400 font-semibold">Dilaporkan pada: {{ formatDate(activeReport?.reported_at) }}</p>
                </div>
                <div class="bg-red-50/40 border border-red-100 rounded-2xl p-4">
                  <span class="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block mb-1">Alasan Pelaporan</span>
                  <span class="inline-block text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase tracking-wide mb-1">
                    {{ activeReport?.reason_code }}
                  </span>
                  <p class="text-xs text-slate-600 leading-relaxed">{{ activeReport?.reason_text }}</p>
                </div>
              </div>

              <!-- Action Status Log (if not pending) -->
              <div v-if="activeReport?.report_status !== 'pending'" class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div class="flex items-center gap-2">
                  <CheckCircle v-if="activeReport?.report_status === 'resolved'" class="w-4 h-4 text-emerald-600" />
                  <XCircle v-else class="w-4 h-4 text-slate-500" />
                  <span class="text-sm font-bold text-slate-800">
                    Laporan telah diproses: {{ activeReport?.report_status === 'resolved' ? 'Ulasan Dihapus' : 'Laporan Diabaikan' }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 pl-6 space-y-1 font-medium">
                  <p>Selesai pada: {{ formatDate(activeReport?.resolved_at) }}</p>
                  <p>Catatan Admin: <span class="italic text-slate-700">"{{ activeReport?.handled_note || 'Tidak ada catatan' }}"</span></p>
                </div>
              </div>

              <!-- Action input form (if pending) -->
              <div v-else class="space-y-3 pt-2">
                <label class="block text-xs text-slate-500 font-extrabold uppercase tracking-widest">Catatan Penanganan Admin</label>
                <textarea
                  v-model="actionNote"
                  rows="3"
                  placeholder="Tulis alasan keputusan penanganan laporan ini..."
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Footer (Action Buttons if Pending) -->
            <div v-if="activeReport?.report_status === 'pending'" class="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                @click="processReportAction('rejected')"
                :disabled="actionLoading"
                class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X class="w-4 h-4" />
                Abaikan Laporan
              </button>
              <button
                @click="processReportAction('resolved')"
                :disabled="actionLoading"
                class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 class="w-4 h-4" />
                Hapus Ulasan
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Ban User Modal (Reused layout for moderation) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBanModal" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showBanModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in z-10">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <ShieldBan class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 class="text-lg font-extrabold text-slate-900">Ban Penulis Ulasan</h4>
                <p class="text-sm text-slate-500">{{ activeReport?.author_name }}</p>
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
                <label class="block text-sm font-bold text-slate-700 mb-1.5">Durasi ban</label>
                <select
                  v-model="banDuration"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer"
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
                @click="submitBanUser"
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import {
  MessageSquare, AlertTriangle, CheckCircle, XCircle, Search,
  ChevronLeft, ChevronRight, Eye, ShieldBan, Trash2, X, ShieldAlert
} from "lucide-vue-next";
import { useToast } from "../../composables/useToast";

const { showToast } = useToast();

// ─── State ───
const reports = ref([]);
const total = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const loading = ref(true);
const error = ref("");

// Counters
const pendingCount = ref(0);
const resolvedCount = ref(0);
const rejectedCount = ref(0);

const search = ref("");
const statusFilter = ref("pending"); // Default to pending reports for quick action

// Detail Modal State
const showDetailModal = ref(false);
const activeReport = ref(null);
const actionNote = ref("");
const actionLoading = ref(false);

// Ban User Modal State
const showBanModal = ref(false);
const banReason = ref("");
const banDuration = ref("");
const banLoading = ref(false);

const statusFilters = [
  { label: "Pending Laporan", value: "pending" },
  { label: "Ulasan Dihapus", value: "resolved" },
  { label: "Laporan Diabaikan", value: "rejected" },
  { label: "Semua", value: "all" },
];

// ─── Computed ───
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

// ─── Fetch Data ───
async function fetchReports() {
  loading.value = true;
  error.value = "";
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/admin/reviews/reports", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: search.value,
        status: statusFilter.value,
        page: currentPage.value,
        limit: 10,
      },
    });

    const payload = res.data?.data;
    reports.value = payload.reports || [];
    total.value = payload.total || 0;
    totalPages.value = payload.totalPages || 1;

    // Fetch stats counters from overall dashboard endpoint to keep them fresh
    await fetchStatsCounters();
  } catch (err) {
    error.value = err.response?.data?.message || "Gagal memuat daftar laporan ulasan.";
  } finally {
    loading.value = false;
  }
}

async function fetchStatsCounters() {
  try {
    const token = localStorage.getItem("token");
    // Fetch count for pending
    const resPending = await axios.get("/api/admin/reviews/reports", {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: "pending", limit: 1 },
    });
    pendingCount.value = resPending.data?.data?.total || 0;

    // Fetch count for resolved
    const resResolved = await axios.get("/api/admin/reviews/reports", {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: "resolved", limit: 1 },
    });
    resolvedCount.value = resResolved.data?.data?.total || 0;

    // Fetch count for rejected
    const resRejected = await axios.get("/api/admin/reviews/reports", {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: "rejected", limit: 1 },
    });
    rejectedCount.value = resRejected.data?.data?.total || 0;
  } catch (err) {
    console.error("Gagal memuat counter statistik:", err);
  }
}

// ─── Moderation Actions ───
function openDetailModal(report) {
  activeReport.value = report;
  actionNote.value = "";
  showDetailModal.value = true;
}

async function processReportAction(actionType) {
  if (!activeReport.value) return;
  
  const confirmMsg = actionType === 'resolved' 
    ? "Yakin ingin menghapus ulasan ini secara permanen?" 
    : "Yakin ingin mengabaikan laporan ini?";

  if (!confirm(confirmMsg)) return;

  actionLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    await axios.patch(`/api/admin/reviews/reports/${activeReport.value.report_id}`, {
      action: actionType,
      note: actionNote.value || null,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showDetailModal.value = false;
    showToast(actionType === 'resolved' ? 'Ulasan berhasil dihapus.' : 'Laporan berhasil diabaikan.', 'success');
    await fetchReports();
  } catch (err) {
    showToast(err.response?.data?.message || "Gagal memproses laporan ulasan.", 'error');
  } finally {
    actionLoading.value = false;
  }
}

// ─── Ban User ───
function openBanModalFromReport() {
  if (!activeReport.value) return;
  banReason.value = `Ulasan ofensif/spam pada gadget: ${activeReport.value.gadget_name}`;
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

async function submitBanUser() {
  if (!activeReport.value) return;
  banLoading.value = true;
  try {
    const token = localStorage.getItem("token");
    
    // 1. Ban the user
    await axios.patch(`/api/admin/users/${activeReport.value.author_id}/ban`, {
      reason: banReason.value || null,
      bannedUntil: computeBannedUntil(banDuration.value),
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Automatically soft-delete the review as well
    await axios.patch(`/api/admin/reviews/reports/${activeReport.value.report_id}`, {
      action: 'resolved',
      note: `Penulis di-ban oleh admin. Alasan ban: ${banReason.value || 'N/A'}`,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showBanModal.value = false;
    showDetailModal.value = false;
    showToast(`Pengguna ${activeReport.value.author_name} berhasil di-ban dan ulasannya telah dihapus.`, 'success');
    await fetchReports();
  } catch (err) {
    showToast(err.response?.data?.message || "Gagal mem-ban pengguna.", 'error');
  } finally {
    banLoading.value = false;
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
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Watchers ───
let searchTimeout = null;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchReports();
  }, 400);
});

watch(statusFilter, () => {
  currentPage.value = 1;
  fetchReports();
});

watch(currentPage, () => {
  fetchReports();
});

// ─── Init ───
onMounted(() => {
  fetchReports();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Modal animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-in-enter-active,
.scale-in-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}
.scale-in-enter-from,
.scale-in-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-5 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 animate-fade-in-up">
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-20 -translate-y-20"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -translate-x-10 translate-y-10"></div>
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 class="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-3">
            Selamat Datang, Admin <ShieldCheck class="w-7 h-7 text-blue-300" />
          </h2>
          <p class="text-slate-300 font-medium max-w-xl">
            Ringkasan aktivitas platform hari ini. Ada <span class="text-white font-bold">{{ data?.overview?.pendingModeration || 0 }}</span> ulasan menunggu moderasi.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button @click="$emit('change-tab', 'reviews')" class="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
            <CheckCircle class="w-4 h-4" /> Moderasi
          </button>
          <button @click="$emit('change-tab', 'gadgets')" class="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold backdrop-blur-sm transition-all flex items-center justify-center gap-2 border border-white/10">
            <Plus class="w-4 h-4" /> Gadget Baru
          </button>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <button
        v-for="(card, i) in statCards"
        :key="card.label"
        @click="$emit('change-tab', card.tabTarget)"
        class="block group text-left animate-fade-in-up"
        :style="{ animationDelay: `${0.1 + i * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }"
      >
        <div :class="['bg-white rounded-[2rem] border border-slate-100 p-4 sm:p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden h-full flex flex-col justify-between', card.shadow]">
          <div :class="['absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full blur-xl transform translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity', card.color]"></div>
          <div class="flex justify-between items-start mb-6">
            <div :class="['w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg', card.color]">
              <component :is="card.icon" class="w-7 h-7" />
            </div>
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
          <div>
            <p class="text-4xl font-black text-slate-800 mb-1 tracking-tight">{{ card.value }}</p>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-wider">{{ card.label }}</p>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-50">
            <p class="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <component :is="card.subIcon" class="w-3.5 h-3.5" /> {{ card.sub }}
            </p>
          </div>
        </div>
      </button>
    </div>

    <!-- Charts Row -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Weekly Reviews Chart -->
      <div class="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 sm:p-6 md:p-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-slate-900 font-extrabold text-xl mb-1">Aktivitas Ulasan</h3>
            <p class="text-slate-500 text-sm font-medium">Tren ulasan 7 hari terakhir</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div class="h-[240px] flex items-end gap-1.5 sm:gap-3 border-b border-slate-100 pb-6">
          <div
            v-for="day in weeklyReviews"
            :key="day.day"
            class="flex-1 flex flex-col items-center gap-1 sm:gap-2"
          >
            <div class="text-[10px] sm:text-xs font-black text-slate-600 mb-1">{{ day.reviews }}</div>
            <div class="w-full max-w-[16px] sm:max-w-[24px] bg-blue-50 rounded-full h-full flex items-end overflow-hidden">
              <div
                class="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                :style="{ height: `${Math.max(8, (day.reviews / weeklyMax) * 100)}%` }"
              ></div>
            </div>
            <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">{{ day.day }}</span>
          </div>
        </div>
      </div>

      <!-- Sentiment -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 sm:p-6 md:p-8 flex flex-col">
        <div class="mb-6">
          <h3 class="text-slate-900 font-extrabold text-xl mb-1">Analisis Sentimen</h3>
          <p class="text-slate-500 text-sm font-medium">Proporsi ulasan</p>
        </div>
        <div class="flex-1 flex flex-col items-center justify-center">
          <div
            class="relative w-40 h-40 rounded-full shadow-inner"
            :style="`background: conic-gradient(#10b981 ${data?.sentiment?.positivePercent || 0}%, #f59e0b ${data?.sentiment?.positivePercent || 0}% ${(data?.sentiment?.positivePercent || 0) + (data?.sentiment?.neutralPercent || 0)}%, #ef4444 ${(data?.sentiment?.positivePercent || 0) + (data?.sentiment?.neutralPercent || 0)}% 100%);`"
          >
            <div class="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center flex-col shadow-sm">
              <span class="text-3xl font-black text-slate-800">{{ data?.overview?.totalReviews || 0 }}</span>
              <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total</span>
            </div>
          </div>

          <div class="w-full space-y-3 mt-6">
            <div v-for="s in sentimentItems" :key="s.name" class="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: s.color }"></div>
                <span class="text-sm font-bold text-slate-700">{{ s.name }}</span>
              </div>
              <span class="text-sm font-black text-slate-900">{{ s.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Top Gadgets -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 sm:p-6 md:p-8">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-slate-900 font-extrabold text-xl">Top Gadget</h3>
          <button @click="$emit('change-tab', 'gadgets')" class="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
            Kelola <ArrowRight class="w-4 h-4" />
          </button>
        </div>
        <div class="space-y-3">
          <div
            v-for="(gadget, idx) in topReviewed"
            :key="gadget.id"
            class="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div :class="['w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg shrink-0', idx === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-slate-400 to-slate-500']">
              {{ idx + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-800 truncate">{{ gadget.name }}</p>
              <p class="text-xs text-slate-500 font-medium">{{ gadget.reviews }} ulasan</p>
            </div>
            <div class="w-16 sm:w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
              <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" :style="{ width: `${(gadget.reviews / topReviewedMax) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Reviews -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 sm:p-6 md:p-8 flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-slate-900 font-extrabold text-xl">Ulasan Masuk</h3>
          <button @click="$emit('change-tab', 'reviews')" class="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
            Semua <ArrowRight class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <div
            v-for="review in data?.recentReviews || []"
            :key="review.id"
            class="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors group"
          >
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
              <span class="font-bold text-blue-600 text-xs sm:text-sm">{{ review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4 mb-1">
                <div>
                  <p class="text-slate-900 text-sm font-bold">{{ review.user_name || 'Pengguna' }}</p>
                  <p class="text-slate-500 text-xs font-medium truncate max-w-[12rem] sm:max-w-xs">{{ review.gadget_name || 'Gadget' }}</p>
                </div>
                <span class="flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold w-fit shrink-0">
                  <Clock class="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Pending
                </span>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex items-center bg-amber-50 px-1.5 py-0.5 rounded text-xs text-amber-600 font-bold">
                  {{ review.rating }} <Star class="w-3 h-3 fill-current ml-0.5" />
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
import { computed } from "vue";
import {
  ShieldCheck, CheckCircle, Plus, ArrowRight, TrendingUp, Clock, Star,
  Users, Smartphone, MessageSquare, AlertTriangle, Activity, Zap
} from "lucide-vue-next";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

defineEmits(["change-tab"]);

const weeklyReviews = computed(() => props.data?.charts?.weeklyReviews || []);
const weeklyMax = computed(() => {
  const values = weeklyReviews.value.map((item) => Number(item.reviews || 0));
  return Math.max(1, ...values);
});

const topReviewed = computed(() => props.data?.charts?.topReviewedGadgets || []);
const topReviewedMax = computed(() => {
  const values = topReviewed.value.map((item) => Number(item.reviews || 0));
  return Math.max(1, ...values);
});

const statCards = computed(() => [
  {
    label: 'Total Pengguna',
    value: props.data?.overview?.totalUsers || 0,
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/10',
    sub: `${props.data?.overview?.bannedUsers || 0} dibekukan`,
    subIcon: Activity,
    tabTarget: 'users',
  },
  {
    label: 'Katalog Gadget',
    value: props.data?.overview?.totalGadgets || 0,
    icon: Smartphone,
    color: 'from-purple-500 to-fuchsia-600',
    shadow: 'shadow-purple-500/10',
    sub: 'Aktif di sistem',
    subIcon: Zap,
    tabTarget: 'gadgets',
  },
  {
    label: 'Total Ulasan',
    value: props.data?.overview?.totalReviews || 0,
    icon: MessageSquare,
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-500/10',
    sub: `${props.data?.sentiment?.positive || 0} disetujui`,
    subIcon: CheckCircle,
    tabTarget: 'reviews',
  },
  {
    label: 'Perlu Moderasi',
    value: props.data?.overview?.pendingModeration || 0,
    icon: AlertTriangle,
    color: 'from-rose-500 to-red-600',
    shadow: 'shadow-rose-500/10',
    sub: 'Menunggu tindakan',
    subIcon: Clock,
    tabTarget: 'reviews',
  },
]);

const sentimentItems = computed(() => [
  { name: 'Positif (4-5★)', value: props.data?.sentiment?.positive || 0, color: '#10b981' },
  { name: 'Netral (3★)', value: props.data?.sentiment?.neutral || 0, color: '#f59e0b' },
  { name: 'Negatif (1-2★)', value: props.data?.sentiment?.negative || 0, color: '#ef4444' },
]);
</script>

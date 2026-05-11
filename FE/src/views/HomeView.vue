<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Cpu class="w-5 h-5 text-white" />
            </div>
            <span class="text-blue-600 tracking-tight font-bold text-lg hidden sm:block">Mending Mana</span>
          </div>

          <!-- Quick search simplified for structure -->
          <div class="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-slate-400" />
            </div>
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="Cari gadget..."
            />
          </div>

          <div class="flex items-center gap-2">
            <template v-if="isAuthenticated">
              <span class="hidden sm:inline text-sm text-slate-600">
                Halo, <span class="font-semibold text-slate-800">{{ userName || 'Member' }}</span>
              </span>
              <button
                v-if="role === 'admin'"
                class="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                @click="goAdmin"
              >
                <Shield class="w-4 h-4" /> <span class="hidden sm:inline">Admin</span>
              </button>
              <button
                v-else
                class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                @click="goDashboard"
              >
                <LayoutDashboard class="w-4 h-4" /> <span class="hidden sm:inline">Dashboard</span>
              </button>
              <button
                class="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
                @click="logout"
              >
                <span class="hidden sm:inline">Logout</span>
                <span class="sm:hidden">Keluar</span>
              </button>
            </template>

            <template v-else>
              <button
                class="px-4 py-1.5 sm:py-2 text-blue-600 border border-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
                @click="goLogin"
              >
                Masuk
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Banner -->
    <section v-if="heroGadget" class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div class="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <TrendingUp class="w-4 h-4 text-orange-400" />
              <span class="text-orange-400 text-sm font-semibold">Trending Sekarang</span>
            </div>
            <h1 class="text-white mb-3 font-extrabold leading-tight text-[clamp(1.8rem,4vw,3rem)]">
              {{ heroGadget.name }}
            </h1>
            <p class="text-slate-400 text-sm leading-relaxed mb-4 max-w-md">
              {{ heroGadget.description.slice(0, 140) }}...
            </p>
            <div class="flex items-center gap-4 mb-6">
              <div class="flex items-center gap-2">
                <StarRating :rating="heroGadget.averageRating" size="md" />
                <span class="text-amber-400 font-bold">{{ heroGadget.averageRating.toFixed(1) }}</span>
                <span class="text-slate-500 text-sm">({{ heroGadget.totalReviews }} ulasan)</span>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-cyan-400 font-bold text-[1.4rem]">
                {{ formatPrice(heroGadget.price) }}
              </span>
            </div>
            <div class="flex gap-3 mt-6">
              <router-link
                :to="'/gadget/' + heroGadget.id"
                class="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                Lihat Detail <ChevronRight class="w-4 h-4" />
              </router-link>
              <router-link
                to="/compare"
                class="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl text-sm font-semibold hover:border-blue-500 hover:text-white transition-colors"
              >
                Bandingkan
              </router-link>
            </div>
          </div>
          <div class="relative flex justify-center lg:justify-end">
            <div class="relative">
              <div class="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl scale-110"></div>
              <img
                :src="heroGadget.images[0]"
                :alt="heroGadget.name"
                class="relative w-64 h-64 lg:w-80 lg:h-80 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <!-- Mobile Search -->
      <div class="md:hidden mb-8 relative">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search class="h-5 w-5 text-slate-400" />
        </div>
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          class="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all"
          placeholder="Cari gadget..."
        />
      </div>

      <!-- Categories -->
      <div class="mb-8 md:mb-12">
        <h2 class="text-xl font-bold text-slate-800 mb-4 sm:mb-6 font-display">Kategori Gadget</h2>
        <div class="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap gap-3 scroll-smooth" style="scrollbar-width: none;">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="handleCategoryClick(cat.value)"
            class="group relative flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl transition-all duration-300 outline-none shrink-0 border"
            :class="[
              activeCategory === cat.value
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 z-10'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm hover:-translate-y-0.5'
            ]"
          >
            <div 
              class="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300"
              :class="[
                activeCategory === cat.value 
                  ? 'bg-white/20 shadow-inner' 
                  : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm'
              ]"
            >
              <component 
                :is="cat.icon" 
                class="w-4 h-4 transition-transform duration-300"
                :class="activeCategory === cat.value ? 'scale-110 drop-shadow-sm text-white' : 'group-hover:scale-110 group-hover:rotate-3'"
              />
            </div>
            
            <span 
              class="font-bold text-sm tracking-wide transition-colors duration-300" 
              :class="activeCategory === cat.value ? 'text-white' : 'group-hover:text-blue-700'"
            >
              {{ cat.label }}
            </span>
            
            <!-- Inactive Hover Accent -->
            <div v-if="activeCategory !== cat.value" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Gadget Grid -->
        <div class="flex-1">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-800 font-display">
              {{ activeCategory === 'all' ? 'Semua Gadget' : activeCategory }}
            </h2>
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <span>Menampilkan {{ filteredGadgets.length }} gadget</span>
            </div>
          </div>

          <div v-if="filteredGadgets.length > 0" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <GadgetCard
              v-for="gadget in filteredGadgets"
              :key="gadget.id"
              :gadget="gadget"
            />
          </div>

          <div v-else class="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Search class="w-8 h-8 text-slate-400" />
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-2">Gadget tidak ditemukan</h3>
            <p class="text-slate-500 text-sm">
              Coba sesuaikan filter atau pencarian Anda.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Dummy -->
    <footer class="bg-white border-t border-slate-200 mt-20 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
        &copy; 2024 MendingMana. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Cpu, Search, SlidersHorizontal, TrendingUp, ChevronRight,
  Smartphone, Monitor, Tablet, Headphones, Watch, LayoutDashboard, Shield
} from 'lucide-vue-next'

import GadgetCard from '../components/gadgets/GadgetCard.vue'
import StarRating from '../components/gadgets/StarRating.vue'
import { mockGadgets, formatPrice } from '../data/mockData.js'

const router = useRouter()

const token = ref(localStorage.getItem('token') || '')
const role = ref(localStorage.getItem('role') || '')
const userName = ref(localStorage.getItem('userFullName') || '')
const isAuthenticated = computed(() => Boolean(token.value))

function goLogin() { router.push('/login') }
function goAdmin() { router.push('/admin') }
function goDashboard() { router.push('/dashboard') }

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('userFullName')
  localStorage.removeItem('userEmail')
  
  token.value = ''
  role.value = ''
  userName.value = ''
  
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

const searchQuery = ref('')
const activeCategory = ref('all')

const categories = [
  { label: "Semua", value: "all", icon: SlidersHorizontal },
  { label: "Smartphone", value: "Smartphone", icon: Smartphone },
  { label: "Laptop", value: "Laptop", icon: Monitor },
  { label: "Tablet", value: "Tablet", icon: Tablet },
  { label: "Aksesori", value: "Aksesori", icon: Headphones },
  { label: "Smartwatch", value: "Smartwatch", icon: Watch },
]

const trendingGadgets = computed(() => mockGadgets.filter(g => g.isTrending).slice(0, 3))
const heroGadget = computed(() => trendingGadgets.value[0] || mockGadgets[0])

const filteredGadgets = computed(() => {
  return mockGadgets.filter(g => {
    const matchCat = activeCategory.value === 'all' || g.category === activeCategory.value
    const matchSearch = !searchQuery.value ||
      g.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      g.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return matchCat && matchSearch
  })
})

const handleCategoryClick = (catValue) => {
  activeCategory.value = catValue
}

const handleSearch = () => {
  // Can be linked to router query logic if needed
}
</script>
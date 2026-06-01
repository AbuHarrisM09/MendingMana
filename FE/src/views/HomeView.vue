<template>
  <div class="min-h-screen bg-white">
    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2.5">
            <img :src="logo" alt="Mending Mana Logo" class="w-9 h-9 object-cover rounded-xl shadow-lg shadow-blue-600/20" />
            <span class="text-slate-900 tracking-tight font-extrabold text-lg hidden sm:block">Mending Mana</span>
          </router-link>

          <!-- Desktop search -->
          <div class="hidden md:flex flex-1 max-w-md mx-8 relative group">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              class="block w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-transparent hover:border-slate-200 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
              placeholder="Cari gadget apa hari ini?"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 p-1 rounded-full transition-colors"
            >
              <X class="w-3 h-3" />
            </button>
          </div>

          <!-- Nav links -->
          <div class="flex items-center gap-3">
            <router-link to="/compare" class="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1">Komparasi</router-link>
            <router-link to="/about" class="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1">About</router-link>

            <template v-if="isAuthenticated">
              <div class="relative ml-2">
                <button
                  @click="profileOpen = !profileOpen"
                  class="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <img
                    :src="userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName || 'Member') + '&background=3b82f6&color=fff&bold=true'"
                    :alt="userName"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span class="text-sm font-bold text-slate-700 hidden sm:inline">{{ userName ? userName.split(' ')[0] : 'Member' }}</span>
                  <ChevronDown class="w-4 h-4 text-slate-400 hidden sm:inline" />
                </button>

                <!-- Dropdown -->
                <Transition name="fade">
                  <div v-show="profileOpen" class="absolute right-0 top-12 w-56 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 py-2 z-50">
                    <div class="px-4 py-3 border-b border-slate-100 mb-1">
                      <p class="text-sm font-bold text-slate-800">{{ userName || 'Member' }}</p>
                      <p class="text-xs text-slate-500">{{ userEmail || 'user@email.com' }}</p>
                    </div>
                    
                    <template v-if="role === 'admin'">
                      <button @click="goAdmin(); profileOpen = false" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full text-left transition-colors">
                        <Shield class="w-4 h-4 text-red-500" /> Dashboard Admin
                      </button>
                    </template>
                    <template v-else>
                      <button @click="goDashboard(); profileOpen = false" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full text-left transition-colors">
                        <LayoutDashboard class="w-4 h-4 text-blue-500" /> Dashboard Saya
                      </button>
                      <button @click="goDashboardWishlist(); profileOpen = false" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 w-full text-left transition-colors">
                        <Heart class="w-4 h-4 text-pink-500" /> Wishlist Saya
                      </button>
                    </template>
                    
                    <hr class="my-1.5 border-slate-100" />
                    <button @click="logout" class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                      <LogOut class="w-4 h-4" /> Keluar
                    </button>
                  </div>
                </Transition>
              </div>
            </template>

            <template v-else>
              <button
                class="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                @click="goLogin"
              >
                Masuk
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Modern Hero Section -->
    <HeroSection :hero-gadget="heroGadget" />


    <!-- Sticky Filter Section -->
    <CategoryFilters
      :categories="categories"
      :active-category="activeCategory"
      v-model:search-query="searchQuery"
      v-model:sort-by="sortBy"
      :sort-options="sortOptions"
      :select-style="selectStyle"
      @category-selected="handleCategoryClick"
      @search="handleSearch"
    />


    <!-- Gadget Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900">
            {{ activeCategory === 'all' ? 'Koleksi Pilihan' : `Kategori: ${activeCategory}` }}
          </h2>
          <p class="text-slate-500 mt-1">{{ filteredGadgets.length }} produk siap diulas</p>
        </div>
      </div>

      <div v-if="filteredGadgets.length === 0" class="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed animate-fade-in">
        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search class="w-10 h-10 text-slate-400" />
        </div>
        <h3 class="text-xl font-extrabold text-slate-800 mb-2">Oops, tidak ditemukan!</h3>
        <p class="text-slate-500 mb-6 max-w-md mx-auto">Kami tidak dapat menemukan gadget yang cocok dengan filter atau kata kunci Anda.</p>
        <button
          @click="searchQuery = ''; activeCategory = 'all'"
          class="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
        >
          Reset Pencarian
        </button>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div
          v-for="(gadget, index) in filteredGadgets"
          :key="gadget.id"
          class="animate-fade-in-up"
          :style="{ opacity: 0, animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }"
        >
          <GadgetCard :gadget="gadget" />
        </div>
      </div>
    </section>




    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-2.5">
            <img :src="logo" alt="Mending Mana Logo" class="w-8 h-8 object-cover rounded-xl shadow-md" />
            <span class="font-extrabold text-slate-900">Mending Mana</span>
          </div>
          <div class="flex items-center gap-6 text-sm text-slate-500">
            <router-link to="/" class="hover:text-slate-800 transition-colors font-medium">Beranda</router-link>
            <router-link to="/compare" class="hover:text-slate-800 transition-colors font-medium">Komparasi</router-link>
            <router-link to="/about" class="hover:text-slate-800 transition-colors font-medium">About</router-link>
          </div>
        </div>
        <div class="text-center text-slate-400 text-sm pt-8 border-t border-slate-100">
          &copy; {{ new Date().getFullYear() }} Mending Mana. Platform Review & Rating Gadget.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  Search, ChevronDown, LogOut, Heart, Shield, LayoutDashboard
} from 'lucide-vue-next'
import GadgetCard from '../components/gadgets/GadgetCard.vue'
import HeroSection from '../components/home/HeroSection.vue'
import CategoryFilters from '../components/home/CategoryFilters.vue'
import { useHomeView } from '../composables/useHomeView'

const {
  logo,
  loading,
  role,
  userName,
  userEmail,
  userAvatar,
  isAuthenticated,
  profileOpen,
  searchQuery,
  activeCategory,
  sortBy,
  categories,
  sortOptions,
  selectStyle,
  heroGadget,
  filteredGadgets,
  goLogin,
  goAdmin,
  goDashboard,
  goDashboardWishlist,
  logout,
  handleCategoryClick,
  handleSearch
} = useHomeView()
</script>
<template>
  <div class="min-h-screen bg-[#F8F9FA] relative overflow-hidden flex flex-col font-sans text-slate-800">
    <!-- Decorative Background -->
    <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/40 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
    <div class="absolute top-40 left-0 w-[500px] h-[500px] bg-slate-200/30 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>

    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2.5">
            <img :src="logo" alt="Mending Mana Logo" class="w-9 h-9 object-cover rounded-xl shadow-lg shadow-slate-600/20" />
            <span class="text-slate-900 tracking-tight font-extrabold text-lg hidden sm:block">Mending Mana</span>
          </router-link>
          <div class="flex items-center gap-2">
            <router-link to="/" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Home class="w-4 h-4" /> Beranda
            </router-link>
            <button @click="logout" class="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-all shadow-sm">
              <LogOut class="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex justify-center items-center py-20">
      <div class="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="flex-1 max-w-lg mx-auto mt-16 bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center shadow-lg">
      {{ error }}
    </div>

    <!-- Dashboard Content -->
    <main v-else class="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
      <!-- Profile Header -->
      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 animate-fade-in-up">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
        
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
          <div class="relative">
            <div class="w-24 h-24 rounded-[1.5rem] bg-white/20 border-4 border-white/30 shadow-xl flex items-center justify-center text-3xl font-black text-white">
              {{ profile?.user?.fullName ? profile.user.fullName.charAt(0).toUpperCase() : 'M' }}
            </div>
            <div class="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-slate-900 shadow-md"></div>
          </div>
          
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-3 mb-1">
              <h1 class="text-white font-extrabold text-2xl md:text-3xl tracking-tight">{{ profile?.user?.fullName || 'Member' }}</h1>
              <button @click="openEditModal" class="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all shadow-inner self-center md:self-auto">
                <Edit class="w-3.5 h-3.5" /> Edit Profil
              </button>
            </div>
            <p class="text-slate-300 text-sm md:text-base mb-2 font-medium">{{ profile?.user?.email }}</p>
            <p v-if="profile?.user?.bio" class="text-slate-200 text-sm mb-3 font-medium leading-relaxed italic max-w-xl">
              "{{ profile.user.bio }}"
            </p>
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span class="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded-full shadow-inner border border-white/10">Member</span>
              <span class="px-3 py-1 bg-black/10 backdrop-blur text-white/90 text-xs font-medium rounded-full shadow-inner">
                Bergabung {{ joinDate }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20 relative z-10">
          <div
            v-for="(stat, i) in profileStats"
            :key="stat.label"
            class="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-colors animate-fade-in-up"
            :style="{ animationDelay: `${0.2 + i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }"
          >
            <p class="text-white font-black text-2xl md:text-3xl mb-1">{{ stat.value }}</p>
            <p class="text-slate-300 text-xs font-bold uppercase tracking-wider">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 bg-white/60 backdrop-blur-xl border border-white shadow-lg rounded-[1.5rem] p-1.5 mb-8 overflow-x-auto custom-scrollbar animate-fade-in-up delay-100" style="opacity:0; animation-fill-mode: forwards;">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all min-w-[120px]',
            activeTab === tab.id
              ? 'bg-slate-800 text-white shadow-md scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <Transition name="slide-fade" mode="out-in">
        <div :key="activeTab">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="grid sm:grid-cols-2 gap-6">
              <!-- Recent Reviews -->
              <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-slate-900 font-extrabold text-lg">Ulasan Terbaru</h3>
                  <button @click="activeTab = 'reviews'" class="text-slate-600 text-sm font-bold flex items-center gap-1 hover:text-slate-800 transition-colors">
                    Lihat semua <ChevronRight class="w-4 h-4" />
                  </button>
                </div>
                <div v-if="reviews.length === 0" class="text-center py-8">
                  <MessageSquare class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p class="text-slate-500 text-sm font-medium">Belum ada ulasan</p>
                </div>
                <div v-else class="space-y-4">
                  <div v-for="rev in reviews.slice(0, 3)" :key="rev.id" class="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1">
                      <img v-if="rev.gadget?.images?.[0]" :src="rev.gadget.images[0]" class="w-full h-full object-contain" />
                      <span v-else class="text-xs text-slate-400">Img</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-900 text-sm font-bold truncate">{{ rev.gadget?.name || rev.gadgetName || 'Gadget' }}</p>
                      <div class="flex items-center text-amber-400 my-1">
                        <Star v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= rev.rating ? 'text-amber-400 fill-current' : 'text-slate-200'" />
                      </div>
                      <p class="text-slate-500 text-xs truncate font-medium">{{ rev.title || rev.text || 'Tidak ada teks' }}</p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-lg">
                      <CheckCircle class="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Wishlist Preview -->
              <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-slate-900 font-extrabold text-lg">Wishlist Saya</h3>
                  <button @click="activeTab = 'wishlist'" class="text-slate-600 text-sm font-bold flex items-center gap-1 hover:text-slate-800 transition-colors">
                    Lihat semua <ChevronRight class="w-4 h-4" />
                  </button>
                </div>
                <div v-if="wishlist.length === 0" class="text-center py-8">
                  <Heart class="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p class="text-slate-500 text-sm font-medium">Belum ada gadget di wishlist</p>
                </div>
                <div v-else class="space-y-4">
                  <router-link v-for="item in wishlist.slice(0, 3)" :key="item.id" :to="`/gadget/${item.id}`" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                    <div class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center p-1">
                      <img v-if="item.coverImage || item.images?.[0]" :src="item.coverImage || item.images[0]" class="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                      <span v-else class="text-xs text-slate-400">Img</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-900 text-sm font-bold truncate">{{ item.name }}</p>
                      <p class="text-slate-800 text-sm font-black mt-0.5">{{ formatPrice(item.price) }}</p>
                    </div>
                    <div class="hidden sm:flex items-center text-amber-400">
                      <Star v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= (item.averageRating || 5) ? 'text-amber-400 fill-current' : 'text-slate-200'" />
                    </div>
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-6">
              <h3 class="text-slate-900 font-extrabold text-lg mb-6">Aksi Cepat</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <router-link to="/" class="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl transition-all shadow-sm hover:shadow-md hover:scale-[1.03] h-full">
                  <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-700">
                    <Package class="w-6 h-6" />
                  </div>
                  <span class="text-slate-800 text-sm font-bold text-center">Jelajahi Gadget</span>
                </router-link>
                <router-link to="/compare" class="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl transition-all shadow-sm hover:shadow-md hover:scale-[1.03] h-full">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Star class="w-6 h-6" />
                  </div>
                  <span class="text-purple-800 text-sm font-bold text-center">Komparasi</span>
                </router-link>
                <button @click="activeTab = 'reviews'" class="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl transition-all shadow-sm hover:shadow-md hover:scale-[1.03] h-full w-full">
                  <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <MessageSquare class="w-6 h-6" />
                  </div>
                  <span class="text-emerald-800 text-sm font-bold text-center">Ulasan Saya</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div v-else-if="activeTab === 'reviews'" class="space-y-6">
            <div v-if="reviews.length === 0" class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-16 text-center">
              <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare class="w-10 h-10 text-slate-400" />
              </div>
              <p class="text-slate-800 font-extrabold text-xl mb-2">Belum ada ulasan</p>
              <p class="text-slate-500 font-medium mb-8">Mulai berikan ulasan untuk gadget yang Anda gunakan.</p>
              <router-link to="/" class="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-slate-500/30 transition-all inline-block">
                Jelajahi Gadget
              </router-link>
            </div>

            <div
              v-else
              v-for="rev in reviews"
              :key="rev.id"
              class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-6 md:p-8 animate-fade-in-up"
            >
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
                <div class="flex items-center gap-4">
                  <router-link :to="`/gadget/${rev.gadgetId}`" class="shrink-0">
                    <div class="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1 hover:scale-105 transition-transform">
                      <img v-if="rev.gadget?.images?.[0]" :src="rev.gadget.images[0]" class="w-full h-full object-contain" />
                      <span v-else class="text-xs text-slate-400">Img</span>
                    </div>
                  </router-link>
                  <div>
                    <router-link :to="`/gadget/${rev.gadgetId}`" class="text-slate-900 font-bold text-base hover:text-slate-600 transition-colors">
                      {{ rev.gadgetName || rev.gadget?.name || 'Gadget' }}
                    </router-link>
                    <div class="flex flex-wrap items-center gap-3 mt-1.5">
                      <div class="flex items-center text-amber-400">
                        <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= rev.rating ? 'text-amber-400 fill-current' : 'text-slate-200'" />
                      </div>
                      <span class="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-green-50 rounded-md text-green-700">
                        <CheckCircle class="w-3 h-3 text-green-500" /> Disetujui
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 class="font-bold text-slate-900 text-base mb-2">{{ rev.title || 'Review' }}</h4>
              <p class="text-slate-600 text-sm leading-relaxed mb-4">{{ rev.text }}</p>
              <div class="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl inline-flex">
                <span>{{ new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
              </div>
            </div>
          </div>

          <!-- Wishlist Tab -->
          <div v-else-if="activeTab === 'wishlist'">
            <div v-if="wishlist.length === 0" class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl p-16 text-center">
              <div class="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart class="w-10 h-10 text-pink-300" />
              </div>
              <p class="text-slate-800 font-extrabold text-xl mb-2">Wishlist masih kosong</p>
              <p class="text-slate-500 font-medium mb-8">Simpan gadget favorit Anda untuk dibandingkan atau dilihat kembali nanti.</p>
              <router-link to="/" class="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-slate-500/30 transition-all inline-block">
                Jelajahi Gadget
              </router-link>
            </div>

            <div v-else class="grid sm:grid-cols-2 gap-6">
              <div
                v-for="(item, i) in wishlist"
                :key="item.id"
                class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-lg p-5 flex flex-col sm:flex-row gap-5 group animate-scale-in"
                :style="{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }"
              >
                <router-link :to="`/gadget/${item.id}`" class="shrink-0 mx-auto sm:mx-0">
                  <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-sm">
                    <img v-if="item.coverImage || item.images?.[0]" :src="item.coverImage || item.images[0]" :alt="item.name" class="w-full h-full object-contain" />
                    <span v-else class="text-xs text-slate-400">No Image</span>
                  </div>
                </router-link>
                <div class="flex-1 min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-md mb-2">{{ item.category || item.brand }}</span>
                  <router-link :to="`/gadget/${item.id}`">
                    <h3 class="text-slate-900 font-bold text-base hover:text-slate-600 transition-colors line-clamp-2">{{ item.name }}</h3>
                  </router-link>
                  <div class="flex items-center gap-1.5 mt-2 mb-3">
                    <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= (item.averageRating || 5) ? 'text-amber-400 fill-current' : 'text-slate-200'" />
                  </div>
                  <div class="mt-auto w-full flex items-center justify-between">
                    <p class="text-slate-800 font-black text-lg tracking-tight">{{ formatPrice(item.price) }}</p>
                    <button @click.prevent="handleRemoveWishlist(item.id)" class="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 flex items-center justify-center transition-colors hover:scale-110" title="Hapus dari wishlist">
                      <Heart class="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 mt-auto pt-8 pb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
        &copy; {{ new Date().getFullYear() }} Mending Mana. Platform Review & Rating Gadget.
      </div>
    </footer>
    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showEditModal = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in z-10">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <User class="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h4 class="text-lg font-extrabold text-slate-900">Edit Profil</h4>
                <p class="text-sm text-slate-500">Perbarui informasi diri Anda</p>
              </div>
            </div>

            <form @submit.prevent="submitEdit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                  <input
                    v-model="editForm.fullName"
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda..."
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition-all placeholder:text-slate-400"
                  />
                  <span v-if="editErrors.fullName" class="text-xs text-red-500 mt-1 block font-semibold">{{ editErrors.fullName }}</span>
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-1.5">Bio Singkat</label>
                  <textarea
                    v-model="editForm.bio"
                    rows="3"
                    placeholder="Tuliskan sedikit tentang diri Anda..."
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 outline-none transition-all placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button
                  type="button"
                  @click="showEditModal = false"
                  class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="editLoading"
                  class="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                >
                  <div v-if="editLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import {
  MessageSquare, Heart, ChevronRight, CheckCircle, Package, Star, Home, LogOut,
  Edit, User
} from 'lucide-vue-next';
import { useUserDashboard } from '../composables/useUserDashboard';

const {
  logo,
  loading,
  error,
  activeTab,
  profile,
  wishlist,
  reviews,
  joinDate,
  profileStats,
  tabs,
  formatPrice,
  logout,
  handleRemoveWishlist,
  showEditModal,
  editLoading,
  editForm,
  editErrors,
  openEditModal,
  submitEdit
} = useUserDashboard();
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Header -->
      <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button @click="$router.push('/')" class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-4 text-sm">
            &larr; Beranda
          </button>
          <h1 class="text-3xl font-bold text-slate-800">Dashboard Member</h1>
          <p class="text-slate-500 mt-1">Kelola profil, riwayat ulasan, dan wishlist Anda di sini.</p>
        </div>
        <button
          @click="logout"
          class="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold transition flex items-center gap-2"
        >
          Logout
        </button>
      </header>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
        {{ error }}
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-8">
        
        <!-- Sidebar / Profile -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
            <div class="w-24 h-24 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              {{ profile?.user?.fullName ? profile.user.fullName.charAt(0).toUpperCase() : 'M' }}
            </div>
            <h2 class="text-xl font-bold text-slate-900">{{ profile?.user?.fullName }}</h2>
            <p class="text-sm text-slate-500 mb-2">{{ profile?.user?.email }}</p>
            <span class="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
              Member
            </span>
            
            <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Reviews</p>
                <p class="text-2xl font-bold text-slate-800">{{ profile?.stats?.totalReviews || 0 }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Wishlist</p>
                <p class="text-2xl font-bold text-slate-800">{{ profile?.stats?.totalWishlist || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content (Tabs) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Custom Tabs -->
          <div class="flex gap-2 overflow-x-auto pb-2 scroll-smooth" style="scrollbar-width: none;">
            <button
              @click="activeTab = 'wishlist'"
              :class="activeTab === 'wishlist' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
              class="px-6 py-3 rounded-2xl font-semibold text-sm transition whitespace-nowrap"
            >
              Wishlist Saya
            </button>
            <button
              @click="activeTab = 'reviews'"
              :class="activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
              class="px-6 py-3 rounded-2xl font-semibold text-sm transition whitespace-nowrap"
            >
              Riwayat Ulasan
            </button>
          </div>

          <!-- Tab Content: Wishlist -->
          <div v-show="activeTab === 'wishlist'" class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Wishlist Gadget Anda</h3>
            
            <div v-if="wishlist.length === 0" class="text-center py-10">
              <p class="text-slate-500">Anda belum menambahkan gadget ke wishlist.</p>
              <button @click="$router.push('/')" class="mt-4 text-blue-600 font-semibold hover:underline">
                Eksplorasi Gadget
              </button>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="item in wishlist" :key="item.id" class="flex flex-col sm:flex-row gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition cursor-pointer" @click="$router.push(`/gadget/${item.id}`)">
                <div class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2">
                  <img v-if="item.coverImage" :src="item.coverImage" :alt="item.name" class="w-full h-full object-contain" />
                  <span v-else class="text-xs text-slate-400">No Image</span>
                </div>
                <div class="flex-1 flex flex-col justify-center">
                  <div class="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">{{ item.brand }}</div>
                  <h4 class="font-bold text-slate-800 text-lg leading-tight mb-1">{{ item.name }}</h4>
                  <div class="text-slate-500 text-sm mb-3">Tersimpan: {{ new Date(item.savedAt).toLocaleDateString('id-ID') }}</div>
                  <div class="font-extrabold text-slate-900 mt-auto">{{ formatPrice(item.price) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content: Reviews -->
          <div v-show="activeTab === 'reviews'" class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h3 class="text-lg font-bold text-slate-800 mb-6">Ulasan yang Anda Berikan</h3>
            
            <div v-if="reviews.length === 0" class="text-center py-10">
              <p class="text-slate-500">Anda belum menulis ulasan apapun.</p>
            </div>
            
            <div v-else class="space-y-6">
              <div v-for="rev in reviews" :key="rev.id" class="p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                <div class="flex justify-between items-start mb-3">
                  <router-link :to="`/gadget/${rev.gadgetId}`" class="text-sm font-bold text-blue-600 hover:underline">
                    {{ rev.gadgetName }}
                  </router-link>
                  <span class="text-xs text-slate-500">{{ new Date(rev.createdAt).toLocaleDateString('id-ID') }}</span>
                </div>
                
                <div class="flex items-center gap-1 mb-2">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= rev.rating ? 'text-amber-500' : 'text-slate-300'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="ml-2 font-bold text-sm text-slate-800">{{ rev.title || 'Review' }}</span>
                </div>
                
                <p class="text-slate-600 text-sm leading-relaxed">{{ rev.text }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, getUserWishlist, getUserReviews } from '../services/userService'

const router = useRouter()

const loading = ref(true)
const error = ref('')
const activeTab = ref('wishlist')

const profile = ref(null)
const wishlist = ref([])
const reviews = ref([])

function formatPrice(price) {
  if (!price) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('userFullName')
  localStorage.removeItem('userEmail')
  router.push('/login')
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [profData, wishData, revData] = await Promise.all([
      getUserProfile(),
      getUserWishlist(),
      getUserReviews()
    ])
    
    profile.value = profData
    wishlist.value = wishData || []
    reviews.value = revData || []
  } catch (err) {
    if (err.message.includes('401') || err.message.toLowerCase().includes('token')) {
      error.value = 'Sesi telah berakhir, silakan login kembali.';
      setTimeout(() => router.push('/login'), 2000);
    } else {
      error.value = err.message || 'Gagal mengambil data dari server.';
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

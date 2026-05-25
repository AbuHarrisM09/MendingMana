<template>
  <div class="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50/30 text-slate-800 antialiased">
    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2.5">
            <img :src="logo" alt="Mending Mana Logo" class="w-9 h-9 object-cover rounded-xl shadow-lg shadow-blue-600/20" />
            <span class="text-slate-900 tracking-tight font-extrabold text-lg hidden sm:block">Mending Mana</span>
          </router-link>

          <!-- Navigation Links -->
          <div class="flex items-center gap-3">
            <router-link to="/" class="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1">Home</router-link>
            <router-link to="/about" class="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1">About</router-link>
            <router-link to="/compare" class="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg transition-all">Komparasi</router-link>

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
                  <div v-show="profileOpen" class="absolute right-0 top-12 w-56 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 py-2 z-50 animate-scale-in">
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

    <!-- Main Comparison Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-4 gap-8">
        
        <!-- Left Panel: Comparison Workspace & Matrix (Span 3 Columns) -->
        <div class="lg:col-span-3 space-y-6">
          
          <!-- Glassmorphic Header & Search Card -->
          <div class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 p-6 rounded-3xl animate-fade-in-up relative z-20">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Fitur Komparasi</span>
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Bandingkan Spek Gadget</h1>
                <p class="text-sm text-slate-500 mt-1">Cari dan pilih hingga 4 gadget untuk dibandingkan spesifikasinya secara berdampingan.</p>
              </div>
              
              <!-- Session Actions (If there are gadgets and logged in) -->
              <div v-if="comparedGadgetIds.length > 0" class="flex items-center gap-2">
                <button 
                  v-if="isMember" 
                  @click="openSaveModal"
                  class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 transition-all"
                >
                  <Save class="w-4 h-4" />
                  {{ activeSessionId ? 'Update Sesi' : 'Simpan Sesi' }}
                </button>
                <button 
                  @click="clearAllCompared"
                  class="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
                >
                  <RefreshCw class="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            <!-- Active Session Alert Badge -->
            <div v-if="activeSessionTitle" class="mb-4 flex items-center justify-between bg-blue-50/50 border border-blue-100 text-blue-800 px-4 py-2.5 rounded-2xl animate-fade-in">
              <div class="flex items-center gap-2 text-sm font-medium">
                <Sparkles class="w-4 h-4 text-blue-600 animate-float" />
                <span>Sesi Aktif: <strong class="font-bold text-blue-900">{{ activeSessionTitle }}</strong></span>
              </div>
              <button @click="clearActiveSessionState" class="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline">
                Keluar dari Sesi
              </button>
            </div>

            <!-- Search Selector Container -->
            <div class="relative max-w-2xl">
              <div class="relative group">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  @focus="searchFocused = true"
                  type="text"
                  class="w-full pl-12 pr-12 py-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-medium text-sm transition-all shadow-inner"
                  placeholder="Ketik nama gadget atau brand (misal: 'iPhone 16', 'Samsung')..."
                  :disabled="comparedGadgetIds.length >= 4"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1 rounded-full transition-colors"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div v-if="comparedGadgetIds.length >= 4" class="text-xs text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Batas maksimal komparasi adalah 4 gadget. Hapus salah satu untuk menambahkan yang lain.</span>
              </div>

              <!-- Search Dropdown Suggestion List -->
              <Transition name="fade">
                <div 
                  v-if="searchFocused && searchQuery.trim().length > 0" 
                  class="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto custom-scrollbar animate-scale-in"
                >
                  <div v-if="searchResults.length === 0" class="px-4 py-6 text-center text-slate-400">
                    <p class="text-sm font-medium">Gadget tidak ditemukan atau sudah ditambahkan</p>
                  </div>
                  <div v-else>
                    <div class="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Pencarian</div>
                    <button
                      v-for="gadget in searchResults"
                      :key="gadget.id"
                      @click="addGadgetToCompare(gadget.id)"
                      class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors group border-b border-slate-50 last:border-0"
                    >
                      <div class="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-100">
                        <img 
                          :src="gadget.images && gadget.images[0] ? gadget.images[0] : 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=80&h=80&fit=crop'" 
                          class="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{{ gadget.name }}</p>
                        <p class="text-xs text-slate-400 font-medium">{{ gadget.brand }} • {{ gadget.category }}</p>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <p class="text-xs font-bold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-full group-hover:bg-blue-100/50 transition-colors">
                          {{ formatPrice(gadget.price) }}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Empty State (If no gadgets are selected) -->
          <div v-if="comparedGadgetIds.length === 0" class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 rounded-3xl p-12 text-center animate-fade-in-up delay-100">
            <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-float">
              <ArrowRightLeft class="w-10 h-10 text-blue-600" />
            </div>
            <h2 class="text-2xl font-extrabold text-slate-800">Mulai Perbandingan Gadget</h2>
            <p class="text-slate-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
              Cari gadget pilihan Anda di kotak pencarian di atas untuk memulai perbandingan spesifikasi secara langsung.
            </p>
          </div>

          <!-- Loading Spinner during AJAX calculation -->
          <div v-else-if="loadingCompare" class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 rounded-3xl p-24 text-center flex flex-col items-center justify-center animate-fade-in">
            <div class="relative w-16 h-16 mb-4">
              <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div class="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <h3 class="text-lg font-bold text-slate-800">Menghubungkan Data Komparasi...</h3>
            <p class="text-slate-500 text-sm mt-1">Menyusun matriks spesifikasi terpadu dari database.</p>
          </div>

          <!-- Comparison Table Render Matrix -->
          <CompareMatrixTable
            v-else-if="comparedGadgetsData"
            :compared-gadgets-data="comparedGadgetsData"
            @remove-gadget="removeGadgetFromCompare"
          />


        </div>

        <!-- Right Panel: Sesi Komparasi Tersimpan Sidebar (Span 1 Column) -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- Member Saved Comparisons List -->
          <SavedSessionsSidebar
            :is-member="isMember"
            :loading-sessions="loadingSessions"
            :sessions-list="sessionsList"
            :active-session-id="activeSessionId"
            :active-session-title="activeSessionTitle"
            :format-date="formatDate"
            @load-session="loadSavedSession"
            @delete-session="confirmDeleteSession"
            @login-redirect="goLogin"
          />

          
        </div>

      </div>
    </main>

    <!-- Modal Dialog: Save Session Confirmation -->
    <SaveSessionModal
      :is-open="saveModalOpen"
      :active-session-id="activeSessionId"
      :active-session-title="activeSessionTitle"
      :default-session-title="defaultSessionTitle"
      @close="saveModalOpen = false"
      @save="handleSaveSession"
    />


    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 pt-16 pb-8 mt-12">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import logo from '../assets/logo.jpeg'
import { useRouter, useRoute } from 'vue-router'
import {
  Cpu, Search, X, Plus, Save, Trash2, ArrowRightLeft, Sparkles, Star,
  LogOut, Shield, LayoutDashboard, Heart, ChevronDown, RefreshCw, AlertTriangle,
  FolderHeart, History, Check
} from 'lucide-vue-next'

import { getGadgets } from '../services/gadgetService'
import {
  compareGadgets,
  getCompareSessions,
  getCompareSessionById,
  createCompareSession,
  updateCompareSession,
  deleteCompareSession
} from '../services/compareService'
import { formatPrice } from '../data/mockData.js'

import CompareMatrixTable from '../components/compare/CompareMatrixTable.vue'
import SavedSessionsSidebar from '../components/compare/SavedSessionsSidebar.vue'
import SaveSessionModal from '../components/compare/SaveSessionModal.vue'


const router = useRouter()
const route = useRoute()

// Authenticated user parameters
const token = ref(localStorage.getItem('token') || '')
const role = ref(localStorage.getItem('role') || '')
const userName = ref(localStorage.getItem('userFullName') || '')
const userEmail = ref(localStorage.getItem('userEmail') || 'user@email.com')
const userAvatar = ref(localStorage.getItem('userAvatar') || '')
const isAuthenticated = computed(() => Boolean(token.value))
const isMember = computed(() => isAuthenticated.value && role.value === 'member')

const profileOpen = ref(false)

// Closing standard navigation dropdown
const closeDropdown = (e) => {
  if (profileOpen.value && !e.target.closest('.relative.ml-2')) {
    profileOpen.value = false
  }
  if (searchFocused.value && !e.target.closest('.relative.max-w-2xl')) {
    searchFocused.value = false
  }
}


// Comparison workspace state
const allGadgets = ref([])
const comparedGadgetIds = ref([])
const comparedGadgetsData = ref(null)
const loadingCompare = ref(false)

// Active Session tracking
const activeSessionId = ref(null)
const activeSessionTitle = ref('')

// Search states
const searchQuery = ref('')
const searchFocused = ref(false)
const searchInputRef = ref(null)

// Member sessions states
const sessionsList = ref([])
const loadingSessions = ref(false)

// Save session modal states
const saveModalOpen = ref(false)


// Default placeholder for session title based on compared gadgets
const defaultSessionTitle = computed(() => {
  if (!comparedGadgetsData.value || !comparedGadgetsData.value.gadgets) return 'Komparasi Baru'
  const names = comparedGadgetsData.value.gadgets.map(g => g.name)
  return `Komparasi: ${names.join(' vs ')}`
})

// Search matches computed
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase()
  return allGadgets.value.filter(g => 
    g.name.toLowerCase().includes(q) ||
    g.brand.toLowerCase().includes(q) ||
    g.category.toLowerCase().includes(q)
  ).filter(g => {
    // Normalize IDs to make sure comparison matches e.g. "g-1" vs "g-1" or "1"
    const isAdded = comparedGadgetIds.value.some(addedId => {
      const addedNum = String(addedId).replace('g-', '')
      const gNum = String(g.id).replace('g-', '')
      return addedNum === gNum
    })
    return !isAdded
  })
})

onMounted(async () => {
  document.addEventListener('click', closeDropdown)
  
  // 1. Fetch all gadgets for fast memory searching
  try {
    const list = await getGadgets()
    // Normalize ids inside allGadgets to match the standard comparison ids "g-id"
    allGadgets.value = list.map(item => ({
      ...item,
      id: String(item.id).startsWith('g-') ? item.id : `g-${item.id}`
    }))
  } catch (err) {
    console.error('Failed to load gadgets list:', err)
  }

  // 2. Fetch user saved sessions list if logged in
  if (isMember.value) {
    fetchSessions()
  }

  // 3. Look for query parameter list: /compare?ids=g-1,g-2
  const idsQuery = route.query.ids || route.query.gadgetIds
  if (idsQuery) {
    const list = String(idsQuery).split(',').map(s => s.trim()).filter(Boolean)
    comparedGadgetIds.value = list.map(item => String(item).startsWith('g-') ? item : `g-${item}`)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// Main trigger calculation algorithm watcher
watch(comparedGadgetIds, () => {
  triggerComparison()
}, { deep: true })

const triggerComparison = async () => {
  if (comparedGadgetIds.value.length === 0) {
    comparedGadgetsData.value = null
    return
  }
  loadingCompare.value = true
  try {
    const rawIds = comparedGadgetIds.value.map(id => String(id).replace('g-', ''))
    const data = await compareGadgets(rawIds)
    comparedGadgetsData.value = data
  } catch (err) {
    console.error('Error fetching comparison matrix:', err)
  } finally {
    loadingCompare.value = false
  }
}

// Adding / Removing items from active workspace
const addGadgetToCompare = (id) => {
  if (comparedGadgetIds.value.length >= 4) return
  
  const normId = String(id).startsWith('g-') ? id : `g-${id}`
  if (!comparedGadgetIds.value.includes(normId)) {
    comparedGadgetIds.value.push(normId)
  }
  
  searchQuery.value = ''
  searchFocused.value = false
}

const removeGadgetFromCompare = (id) => {
  const normId = String(id).startsWith('g-') ? id : `g-${id}`
  comparedGadgetIds.value = comparedGadgetIds.value.filter(itemId => itemId !== normId)
}

const clearAllCompared = () => {
  comparedGadgetIds.value = []
  clearActiveSessionState()
}


// saved session lists helpers
const fetchSessions = async () => {
  loadingSessions.value = true
  try {
    const data = await getCompareSessions()
    sessionsList.value = data
  } catch (err) {
    console.error('Gagal mengambil sesi komparasi:', err)
  } finally {
    loadingSessions.value = false
  }
}

const loadSavedSession = (session) => {
  activeSessionId.value = session.id
  activeSessionTitle.value = session.title
  comparedGadgetIds.value = session.gadgets.map(g => String(g.id).startsWith('g-') ? g.id : `g-${g.id}`)
}

const confirmDeleteSession = async (session) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus sesi komparasi "${session.title}"?`)) return
  try {
    await deleteCompareSession(session.id)
    if (activeSessionId.value === session.id) {
      clearActiveSessionState()
    }
    await fetchSessions()
  } catch (err) {
    alert(err.message || 'Gagal menghapus sesi komparasi.')
  }
}

const clearActiveSessionState = () => {
  activeSessionId.value = null
  activeSessionTitle.value = ''
}

// Modal and Saving actions
const openSaveModal = () => {
  saveModalOpen.value = true
}

const handleSaveSession = async (titleInput, forceSaveAsNew = false) => {
  const title = titleInput.trim() || defaultSessionTitle.value
  
  try {
    if (activeSessionId.value && !forceSaveAsNew) {
      // Overwrite/Update existing session
      await updateCompareSession(activeSessionId.value, title, comparedGadgetIds.value)
      activeSessionTitle.value = title
    } else {
      // Create fresh new session
      const res = await createCompareSession(title, comparedGadgetIds.value)
      if (res && res.session) {
        activeSessionId.value = res.session.id
        activeSessionTitle.value = res.session.title
      }
    }
    
    saveModalOpen.value = false
    await fetchSessions()
  } catch (err) {
    alert(err.message || 'Gagal menyimpan sesi komparasi.')
  }
}


// Standard helper utilities
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date) + ' WIB'
}

// Auth and Navigation redirects
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
  } else {
    location.reload()
  }
}
</script>

<style scoped>
/* Simple CSS transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

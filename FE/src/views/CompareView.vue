<template>
  <div class="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50/30 text-slate-800 antialiased">
    <!-- Navbar -->
    <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <router-link to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Cpu class="w-5 h-5 text-white" />
            </div>
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
          <div class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 p-6 rounded-3xl animate-fade-in-up">
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
              Cari gadget pilihan Anda di kotak pencarian di atas, atau klik salah satu rekomendasi skenario tanding populer berikut.
            </p>
            
            <!-- Quick Match Recommendations -->
            <div class="mt-8">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Tanding Populer Hari Ini</p>
              <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <button
                  v-for="(rec, idx) in matchRecommendations"
                  :key="idx"
                  @click="loadMatchup(rec.ids)"
                  class="p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition-all hover:shadow-lg shadow-sm group hover:-translate-y-1"
                >
                  <div class="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <Sparkles class="w-3 h-3" />
                    <span>{{ rec.tag }}</span>
                  </div>
                  <p class="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug">{{ rec.title }}</p>
                  <p class="text-xs text-slate-400 mt-2 font-medium flex items-center justify-between">
                    <span>Lihat tandingan</span>
                    <Plus class="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </p>
                </button>
              </div>
            </div>
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
          <div v-else-if="comparedGadgetsData" class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 rounded-3xl overflow-hidden animate-fade-in">
            
            <!-- Horizontal Swipe Helper (visible on mobile only) -->
            <div class="md:hidden bg-blue-50/50 text-blue-700 px-4 py-2 border-b border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold">
              <ArrowRightLeft class="w-3.5 h-3.5" />
              <span>Geser tabel ke kanan untuk melihat gadget lain</span>
            </div>

            <!-- Scrollable Table Wrapper -->
            <div class="overflow-x-auto custom-scrollbar">
              <table class="w-full border-collapse text-left table-fixed min-w-[700px]">
                <thead>
                  <!-- Header Row: Brand Image and basic actions -->
                  <tr class="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                    <!-- Column 0: Empty corner -->
                    <th class="w-56 p-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50 border-r border-slate-100">
                      Gadget Info
                    </th>
                    <!-- Columns 1-N: Compared Gadgets -->
                    <th
                      v-for="gadget in comparedGadgetsData.gadgets"
                      :key="gadget.id"
                      class="p-6 relative group border-r border-slate-100 last:border-r-0"
                    >
                      <!-- Delete floating button -->
                      <button
                        @click="removeGadgetFromCompare(gadget.id)"
                        class="absolute top-4 right-4 text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-all hover:scale-110"
                        title="Hapus dari perbandingan"
                      >
                        <X class="w-4 h-4" />
                      </button>

                      <div class="flex flex-col items-center text-center mt-2">
                        <!-- Image representation -->
                        <div class="w-28 h-28 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-100 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                          <img 
                            :src="gadget.images && gadget.images[0] ? gadget.images[0] : 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=150&h=150&fit=crop'" 
                            class="max-w-full max-h-full object-contain" 
                          />
                        </div>

                        <!-- Brand name -->
                        <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-4">{{ gadget.brand }}</span>
                        <!-- Gadget name -->
                        <h3 class="text-sm font-extrabold text-slate-800 line-clamp-2 mt-1 px-2 h-10 leading-snug group-hover:text-blue-700 transition-colors">
                          <router-link :to="'/gadget/' + gadget.id.replace('g-', '')" class="hover:underline">
                            {{ gadget.name }}
                          </router-link>
                        </h3>

                        <!-- Formatted Price -->
                        <p class="text-sm font-extrabold text-slate-900 mt-2">{{ formatPrice(gadget.price) }}</p>

                        <!-- Rating & Reviews snippet -->
                        <div class="flex flex-col items-center gap-1 mt-2">
                          <div class="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                            <Star class="w-3.5 h-3.5 text-amber-500 fill-current" />
                            <span class="text-xs font-bold text-amber-700">{{ gadget.averageRating ? gadget.averageRating.toFixed(1) : '0.0' }}</span>
                          </div>
                          <span class="text-[10px] text-slate-400 font-medium">({{ gadget.totalReviews || 0 }} Ulasan)</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Technical Spec Groups Loop -->
                  <template v-for="group in comparedGadgetsData.specGroups" :key="group.group">
                    <!-- Spec Category Section Header (sticky title or distinct row style) -->
                    <tr class="bg-slate-50/80 backdrop-blur-sm border-y border-slate-100">
                      <td 
                        :colspan="comparedGadgetsData.gadgets.length + 1"
                        class="px-6 py-3 text-xs font-black text-slate-900 uppercase tracking-wider"
                      >
                        {{ group.group }}
                      </td>
                    </tr>
                    
                    <!-- Spec Keys Loop inside the Group -->
                    <tr
                      v-for="spec in group.specs"
                      :key="spec.key"
                      class="border-b border-slate-100 hover:bg-slate-50/30 transition-colors"
                    >
                      <!-- Key Label column -->
                      <td class="p-4 px-6 text-xs font-bold text-slate-500 bg-slate-50/10 border-r border-slate-100 leading-relaxed">
                        {{ spec.key }}
                      </td>
                      
                      <!-- Gadget values side by side -->
                      <td
                        v-for="gadget in comparedGadgetsData.gadgets"
                        :key="gadget.id"
                        class="p-4 text-xs text-slate-700 border-r border-slate-100 last:border-r-0 leading-relaxed font-medium"
                      >
                        <span v-if="spec.values[gadget.id] !== null" class="break-words">
                          {{ spec.values[gadget.id] }}
                        </span>
                        <span v-else class="text-slate-300 font-normal italic">
                          —
                        </span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Right Panel: Sesi Komparasi Tersimpan Sidebar (Span 1 Column) -->
        <div class="lg:col-span-1 space-y-6">
          
          <!-- Member Saved Comparisons List -->
          <div class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 p-6 rounded-3xl sticky top-24 animate-fade-in-up delay-200">
            <div class="flex items-center gap-2 mb-4">
              <History class="w-5 h-5 text-blue-600" />
              <h2 class="text-lg font-extrabold text-slate-900 tracking-tight">Komparasi Saya</h2>
            </div>
            
            <hr class="border-slate-100 mb-4" />

            <!-- Authentication check -->
            <template v-if="isMember">
              <!-- Loading state -->
              <div v-if="loadingSessions" class="py-12 text-center">
                <RefreshCw class="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
                <p class="text-xs font-semibold text-slate-400">Memuat sesi tersimpan...</p>
              </div>

              <!-- Empty state inside sessions -->
              <div v-else-if="sessionsList.length === 0" class="py-12 text-center px-4">
                <FolderHeart class="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 class="text-sm font-bold text-slate-700">Belum ada sesi</h4>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed">Pilih gadget, klik "Simpan Sesi" untuk menyimpan riwayat perbandingan.</p>
              </div>

              <!-- List representation -->
              <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                <div 
                  v-for="session in sessionsList" 
                  :key="session.id"
                  :class="[
                    'p-3.5 rounded-2xl border text-left transition-all relative group flex flex-col gap-2 hover:shadow-md cursor-pointer hover:bg-white',
                    activeSessionId === session.id
                      ? 'border-blue-500 bg-blue-50/20 shadow-blue-500/5'
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                  ]"
                  @click="loadSavedSession(session)"
                >
                  <!-- Delete button for session (Member only) -->
                  <button
                    @click.stop="confirmDeleteSession(session)"
                    class="absolute top-3 right-3 text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Hapus Sesi"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>

                  <div class="pr-6">
                    <h4 class="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {{ session.title }}
                    </h4>
                    <p class="text-[10px] text-slate-400 font-semibold mt-1">
                      {{ formatDate(session.updatedAt) }}
                    </p>
                  </div>

                  <!-- Small thumbnail avatars compared inside session -->
                  <div class="flex items-center gap-1 mt-1 border-t border-slate-100/50 pt-2.5">
                    <div 
                      v-for="gadget in session.gadgets.slice(0, 3)" 
                      :key="gadget.id"
                      class="w-6 h-6 rounded-md bg-white border border-slate-100 p-0.5 overflow-hidden flex items-center justify-center shadow-sm"
                      :title="gadget.name"
                    >
                      <img :src="gadget.image || 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=40&h=40&fit=crop'" class="max-w-full max-h-full object-contain" />
                    </div>
                    <span v-if="session.gadgets.length > 3" class="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      +{{ session.gadgets.length - 3 }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Non-member Guest Banner Prompt -->
            <template v-else>
              <div class="text-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <FolderHeart class="w-10 h-10 text-blue-500/70 mx-auto mb-3" />
                <h4 class="text-sm font-bold text-slate-800">Simpan Hasil Komparasi?</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">
                  Gabung sebagai Member Mending Mana untuk menyimpan komparasi favorit, mengelolanya, dan membagikannya secara mudah!
                </p>
                <button
                  @click="goLogin"
                  class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-colors"
                >
                  Masuk Sekarang
                </button>
              </div>
            </template>
          </div>
          
        </div>

      </div>
    </main>

    <!-- Modal Dialog: Save Session Confirmation -->
    <Transition name="fade">
      <div v-show="saveModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
        <!-- Backdrop -->
        <div @click="saveModalOpen = false" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>

        <!-- Content Card -->
        <div class="relative bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in z-10">
          <button 
            @click="saveModalOpen = false" 
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-2.5 text-blue-600 mb-4">
            <Save class="w-5 h-5" />
            <h3 class="text-lg font-extrabold text-slate-900">Simpan Sesi Komparasi</h3>
          </div>

          <p class="text-xs text-slate-500 mb-4 leading-relaxed">
            Berikan nama yang deskriptif untuk sesi perbandingan ini agar mudah ditemukan kembali di kemudian hari.
          </p>

          <!-- Input field -->
          <div class="space-y-4">
            <div>
              <label for="session-title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Sesi Komparasi</label>
              <input
                id="session-title"
                v-model="sessionInputTitle"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 rounded-xl font-medium text-sm transition-all"
                :placeholder="defaultSessionTitle"
              />
              <p class="text-[10px] text-slate-400 font-semibold mt-1.5 italic">
                *Kosongkan untuk penamaan otomatis berdasarkan isi gadget.
              </p>
            </div>
            
            <div v-if="activeSessionId" class="flex gap-2 bg-blue-50/30 border border-blue-50 p-3 rounded-xl text-xs text-blue-800 font-medium">
              <Sparkles class="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Sesi ini terhubung dengan <strong class="font-bold">"{{ activeSessionTitle }}"</strong>. Anda bisa menimpa sesi saat ini atau menyimpannya sebagai sesi baru.</span>
            </div>
          </div>

          <!-- Buttons layout -->
          <div class="mt-6 flex flex-col sm:flex-row items-center gap-2 justify-end">
            <button
              @click="saveModalOpen = false"
              class="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold text-sm transition-colors"
            >
              Batal
            </button>
            <button
              v-if="activeSessionId"
              @click="handleSaveSession(true)"
              class="w-full sm:w-auto px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm rounded-xl transition-all"
            >
              Simpan Baru
            </button>
            <button
              @click="handleSaveSession(false)"
              class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/10 transition-all"
            >
              {{ activeSessionId ? 'Timpa Sesi' : 'Simpan Sesi' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-100 pt-16 pb-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Cpu class="w-4 h-4 text-white" />
            </div>
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

// Quick scenarios tanding recommendations
const matchRecommendations = [
  {
    title: "iPhone 16 Pro Max vs Samsung Galaxy S25 Ultra",
    tag: "Flagship Tanding",
    ids: ["g-1", "g-2"]
  },
  {
    title: "MacBook Pro M4 vs Dell XPS 15",
    tag: "Laptop Premium",
    ids: ["g-4", "g-5"]
  },
  {
    title: "iPad Pro M4 vs Galaxy Tab S10 Ultra",
    tag: "Tablet Terbaik",
    ids: ["g-7", "g-8"]
  }
]

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
const sessionInputTitle = ref('')

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

// Scenarios loads
const loadMatchup = (ids) => {
  clearActiveSessionState()
  comparedGadgetIds.value = ids.map(id => String(id).startsWith('g-') ? id : `g-${id}`)
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
  sessionInputTitle.value = activeSessionId.value ? activeSessionTitle.value : ''
  saveModalOpen.value = true
}

const handleSaveSession = async (forceSaveAsNew = false) => {
  const title = sessionInputTitle.value.trim() || defaultSessionTitle.value
  
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

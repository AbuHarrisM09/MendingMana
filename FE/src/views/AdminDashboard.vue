<template>
  <div class="min-h-screen flex bg-[#F8F9FA] font-sans text-slate-800">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex z-10 transition-all duration-300">
      <div class="h-16 flex items-center px-6 border-b border-slate-50 shrink-0">
        <router-link to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Cpu class="w-4 h-4 text-white" />
          </div>
          <h1 class="text-lg font-extrabold text-slate-800 tracking-tight">Mending Mana</h1>
        </router-link>
      </div>

      <div class="px-4 py-6">
        <p class="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
        <nav class="space-y-1">
          <button
            v-for="item in sidebarItems"
            :key="item.id"
            @click="activeTab = item.id"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 relative',
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
            ]"
          >
            <div v-if="activeTab === item.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
            <component :is="item.icon" class="w-5 h-5" :class="activeTab === item.id ? 'text-blue-600' : 'text-slate-400'" />
            {{ item.label }}
            <span v-if="item.badge" class="ml-auto text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{{ item.badge }}</span>
          </button>
        </nav>
      </div>

      <div class="mt-auto p-4 border-t border-slate-50 space-y-1">
        <button
          @click="$router.push('/')"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors"
        >
          <Globe class="w-5 h-5 text-slate-400" />
          Ke Website
        </button>
        <button
          @click="logout"
          class="group w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors"
        >
          <LogOut class="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          Keluar
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0 shadow-sm">
        <div class="flex items-center gap-4">
          <button class="md:hidden text-slate-400 hover:text-slate-600 transition-colors">
            <Menu class="w-5 h-5" />
          </button>
          <div class="relative hidden sm:block">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari data..."
              class="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <Bell class="w-5 h-5" />
            <span v-if="data?.overview?.pendingModeration" class="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
          </button>
          <div class="flex items-center gap-3 cursor-pointer p-1 pr-3 hover:bg-slate-50 rounded-full transition-colors border border-transparent">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg">
              <span class="font-bold text-white text-sm">{{ userName ? userName.charAt(0).toUpperCase() : 'A' }}</span>
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-bold text-slate-700 leading-none">{{ userName || 'Administrator' }}</p>
              <p class="text-[10px] text-slate-400 font-bold tracking-widest mt-1 leading-none uppercase">Admin</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-auto p-4 md:p-8 relative">
        <!-- Loading -->
        <div v-if="loading" class="absolute inset-0 z-10 bg-[#F8F9FA]/80 flex justify-center items-center backdrop-blur-sm">
          <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 text-center shadow-lg max-w-2xl mx-auto mt-10">
          <p class="font-bold text-lg mb-2">Terjadi Kesalahan</p>
          <p class="text-sm">{{ error }}</p>
        </div>

        <!-- Dashboard Tab -->
        <div v-else-if="data && activeTab === 'dashboard'" class="max-w-7xl mx-auto space-y-6">
          <!-- Welcome Banner -->
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 animate-fade-in-up">
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-20 -translate-y-20"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -translate-x-10 translate-y-10"></div>
            <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 class="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-3">
                  Selamat Datang, Admin <ShieldCheck class="w-7 h-7 text-blue-300" />
                </h2>
                <p class="text-slate-300 font-medium max-w-xl">
                  Ringkasan aktivitas platform hari ini. Ada <span class="text-white font-bold">{{ data.overview.pendingModeration }}</span> ulasan menunggu moderasi.
                </p>
              </div>
              <div class="flex gap-3 w-full md:w-auto">
                <button @click="activeTab = 'reviews'" class="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                  <CheckCircle class="w-4 h-4" /> Moderasi
                </button>
                <button @click="activeTab = 'gadgets'" class="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold backdrop-blur-sm transition-all flex items-center justify-center gap-2 border border-white/10">
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
              @click="activeTab = card.tabTarget"
              class="block group text-left animate-fade-in-up"
              :style="{ animationDelay: `${0.1 + i * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }"
            >
              <div :class="['bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden h-full flex flex-col justify-between', card.shadow]">
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
            <div class="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8">
              <div class="flex items-center justify-between mb-8">
                <div>
                  <h3 class="text-slate-900 font-extrabold text-xl mb-1">Aktivitas Ulasan</h3>
                  <p class="text-slate-500 text-sm font-medium">Tren ulasan 7 hari terakhir</p>
                </div>
                <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp class="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div class="h-[240px] flex items-end gap-3 border-b border-slate-100 pb-6">
                <div
                  v-for="day in weeklyReviews"
                  :key="day.day"
                  class="flex-1 flex flex-col items-center gap-2"
                >
                  <div class="text-xs font-black text-slate-600 mb-1">{{ day.reviews }}</div>
                  <div class="w-full max-w-[24px] bg-blue-50 rounded-full h-full flex items-end overflow-hidden">
                    <div
                      class="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                      :style="{ height: `${Math.max(8, (day.reviews / weeklyMax) * 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase">{{ day.day }}</span>
                </div>
              </div>
            </div>

            <!-- Sentiment -->
            <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8 flex flex-col">
              <div class="mb-6">
                <h3 class="text-slate-900 font-extrabold text-xl mb-1">Analisis Sentimen</h3>
                <p class="text-slate-500 text-sm font-medium">Proporsi ulasan</p>
              </div>
              <div class="flex-1 flex flex-col items-center justify-center">
                <div
                  class="relative w-40 h-40 rounded-full shadow-inner"
                  :style="`background: conic-gradient(#10b981 ${data.sentiment.positivePercent}%, #f59e0b ${data.sentiment.positivePercent}% ${data.sentiment.positivePercent + data.sentiment.neutralPercent}%, #ef4444 ${data.sentiment.positivePercent + data.sentiment.neutralPercent}% 100%);`"
                >
                  <div class="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center flex-col shadow-sm">
                    <span class="text-3xl font-black text-slate-800">{{ data.overview.totalReviews }}</span>
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
            <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8">
              <div class="flex items-center justify-between mb-8">
                <h3 class="text-slate-900 font-extrabold text-xl">Top Gadget</h3>
                <button @click="activeTab = 'gadgets'" class="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  Kelola <ArrowRight class="w-4 h-4" />
                </button>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(gadget, idx) in topReviewed"
                  :key="gadget.id"
                  class="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg', idx === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-slate-400 to-slate-500']">
                    {{ idx + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 truncate">{{ gadget.name }}</p>
                    <p class="text-xs text-slate-500 font-medium">{{ gadget.reviews }} ulasan</p>
                  </div>
                  <div class="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" :style="{ width: `${(gadget.reviews / topReviewedMax) * 100}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Reviews -->
            <div class="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-8 flex flex-col">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-slate-900 font-extrabold text-xl">Ulasan Masuk</h3>
                <button @click="activeTab = 'reviews'" class="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  Semua <ArrowRight class="w-4 h-4" />
                </button>
              </div>
              <div class="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                <div
                  v-for="review in data.recentReviews"
                  :key="review.id"
                  class="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors group"
                >
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                    <span class="font-bold text-blue-600 text-sm">{{ review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U' }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between mb-1">
                      <div>
                        <p class="text-slate-900 text-sm font-bold">{{ review.user_name || 'Pengguna' }}</p>
                        <p class="text-slate-500 text-xs font-medium truncate w-48">{{ review.gadget_name || 'Gadget' }}</p>
                      </div>
                      <span class="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700">
                        <Clock class="w-3 h-3" /> Pending
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

        <!-- Gadget Management Tab -->
        <div v-else-if="activeTab === 'gadgets'" class="max-w-7xl mx-auto space-y-6 animate-fade-in">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl">
            <div>
              <h3 class="text-xl font-extrabold text-slate-900">Katalog Gadget</h3>
              <p class="text-slate-500 text-sm font-medium">Kelola data gadget, spesifikasi, dan gambar dalam satu panel.</p>
            </div>
            <button @click="openCreateForm" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
              <Plus class="w-4 h-4" /> Tambah Gadget Baru
            </button>
          </div>

          <!-- Gadgets Table/Card List -->
          <div class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/50">
                    <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Gadget</th>
                    <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Brand / Kategori</th>
                    <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Harga</th>
                    <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating / Ulasan</th>
                    <th class="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="gadget in adminGadgets" :key="gadget.id" class="hover:bg-slate-50/30 transition-colors group">
                    <td class="p-5">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                          <img v-if="gadget.images && gadget.images.length > 0" :src="gadget.images[0]" :alt="gadget.name" class="w-full h-full object-contain" />
                          <Smartphone v-else class="w-6 h-6 text-slate-400" />
                        </div>
                        <div class="min-w-0">
                          <p class="text-sm font-bold text-slate-800 truncate">{{ gadget.name }}</p>
                          <p class="text-xs text-slate-400 font-medium truncate">{{ gadget.model || '-' }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-5">
                      <div class="flex flex-col gap-1 items-start">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{{ gadget.brand }}</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">{{ gadget.category }}</span>
                      </div>
                    </td>
                    <td class="p-5 text-sm font-black text-slate-700">
                      {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(gadget.price) }}
                    </td>
                    <td class="p-5">
                      <span :class="[
                        'px-2.5 py-1 rounded-full text-xs font-bold capitalize',
                        gadget.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      ]">
                        {{ gadget.status || 'published' }}
                      </span>
                    </td>
                    <td class="p-5">
                      <div class="flex items-center gap-1">
                        <Star class="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span class="text-xs font-bold text-slate-700">{{ gadget.averageRating?.toFixed(1) || '0.0' }}</span>
                        <span class="text-[10px] text-slate-400">({{ gadget.totalReviews || 0 }})</span>
                      </div>
                    </td>
                    <td class="p-5 text-right">
                      <div class="flex justify-end gap-2">
                        <button @click="openEditForm(gadget)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Gadget">
                          <Edit class="w-4 h-4" />
                        </button>
                        <button @click="deleteGadget(gadget.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Gadget">
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="adminGadgets.length === 0">
                    <td colspan="6" class="p-10 text-center text-slate-400">
                      Tidak ada gadget dalam database.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Form Modal (Create / Edit Gadget) -->
        <div v-if="showFormModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            <!-- Modal Header -->
            <div class="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <h4 class="text-lg font-extrabold text-slate-900">
                {{ isEditing ? 'Edit Gadget' : 'Tambah Gadget Baru' }}
              </h4>
              <button @click="showFormModal = false" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Data Utama -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Gadget *</label>
                  <input v-model="gadgetForm.name" type="text" placeholder="Masukkan nama gadget" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Model</label>
                  <input v-model="gadgetForm.model" type="text" placeholder="Masukkan model" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Brand *</label>
                  <select v-model="gadgetForm.brand_id" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer" required>
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori *</label>
                  <select v-model="gadgetForm.category_id" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer" required>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Harga (IDR) *</label>
                  <input v-model="gadgetForm.price" type="number" placeholder="Contoh: 15000000" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status *</label>
                  <select v-model="gadgetForm.status" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer" required>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi</label>
                <textarea v-model="gadgetForm.description" rows="3" placeholder="Deskripsi lengkap mengenai gadget" class="w-full px-4 py-2.5 bg-slate-50 border border-transparent focus:border-blue-500 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-y"></textarea>
              </div>

              <!-- Unggah Gambar -->
              <div>
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gambar Gadget</label>
                <div class="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer relative transition-colors bg-slate-50/50">
                  <input type="file" multiple accept="image/*" @change="handleFileChange" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div class="flex flex-col items-center justify-center gap-2">
                    <Upload class="w-8 h-8 text-slate-400" />
                    <p class="text-sm font-bold text-slate-600">Klik atau seret gambar ke sini</p>
                    <p class="text-xs text-slate-400">Mendukung multi-file PNG, JPG, JPEG (Max. 5 file)</p>
                  </div>
                </div>

                <!-- Preview Gambar -->
                <div v-if="filePreviews.length > 0" class="flex gap-3 flex-wrap mt-4">
                  <div v-for="(preview, idx) in filePreviews" :key="idx" class="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden relative shadow-sm shrink-0">
                    <img :src="preview" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              <!-- Spesifikasi Dinamis -->
              <div>
                <div class="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                  <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Spesifikasi Teknis</label>
                  <button type="button" @click="addSpecRow" class="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-all">
                    <PlusCircle class="w-3.5 h-3.5" /> Tambah Baris
                  </button>
                </div>

                <div class="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="(spec, index) in gadgetForm.specs" :key="index" class="flex gap-2 items-center">
                    <input v-model="spec.spec_group" type="text" placeholder="Grup (e.g. Layar)" class="w-1/3 px-3 py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-lg text-xs outline-none transition-all" />
                    <input v-model="spec.spec_key" type="text" placeholder="Kunci (e.g. Resolusi)" class="w-1/3 px-3 py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-lg text-xs outline-none transition-all" required />
                    <input v-model="spec.spec_value" type="text" placeholder="Nilai (e.g. 1080p)" class="w-1/3 px-3 py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-lg text-xs outline-none transition-all" required />
                    <button type="button" @click="removeSpecRow(index)" class="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                      <MinusCircle class="w-4 h-4" />
                    </button>
                  </div>
                  <div v-if="gadgetForm.specs.length === 0" class="text-center py-4 text-xs text-slate-400">
                    Belum ada spesifikasi yang ditambahkan.
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="h-16 border-t border-slate-100 px-6 flex items-center justify-end gap-3 shrink-0">
              <button @click="showFormModal = false" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-500 transition-all">
                Batal
              </button>
              <button @click="saveGadget" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5">
                <Save class="w-4 h-4" /> {{ isEditing ? 'Simpan Perubahan' : 'Tambahkan Gadget' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'users'" class="max-w-7xl mx-auto animate-fade-in">
          <div class="bg-white rounded-[2rem] border border-slate-100 p-16 text-center flex flex-col items-center justify-center min-h-[400px] shadow-xl">
            <div class="w-20 h-20 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Users class="w-10 h-10 text-purple-500" />
            </div>
            <h3 class="text-2xl font-extrabold text-slate-800 mb-3">Manajemen Pengguna</h3>
            <p class="text-slate-500 max-w-md leading-relaxed text-sm font-medium">
              Lihat daftar member aktif, bekukan akun yang melanggar aturan, dan atur hak akses.
            </p>
          </div>
        </div>

        <div v-else-if="activeTab === 'reviews'" class="max-w-7xl mx-auto animate-fade-in">
          <div class="bg-white rounded-[2rem] border border-slate-100 p-16 text-center flex flex-col items-center justify-center min-h-[400px] shadow-xl">
            <div class="w-20 h-20 bg-gradient-to-br from-orange-50 to-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare class="w-10 h-10 text-orange-500" />
            </div>
            <h3 class="text-2xl font-extrabold text-slate-800 mb-3">Moderasi Ulasan</h3>
            <p class="text-slate-500 max-w-md leading-relaxed text-sm font-medium">
              Validasi ulasan yang ditandai atau dilaporkan agar platform tetap terpercaya.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Users, Smartphone, MessageSquare, ArrowRight, Star,
  LayoutDashboard, LogOut, Globe, TrendingUp, CheckCircle,
  Menu, Search, Bell, AlertTriangle, Activity, ShieldCheck,
  Zap, Plus, Clock, Cpu, Edit, Trash2, X, Upload, Save,
  PlusCircle, MinusCircle
} from "lucide-vue-next";
import axios from "axios";

const router = useRouter();

const userName = ref(localStorage.getItem("userFullName") || "");
const userEmail = ref(localStorage.getItem("userEmail") || "");
const activeTab = ref("dashboard");

const data = ref(null);
const loading = ref(true);
const error = ref("");

// Gadget Management State
const adminGadgets = ref([]);
const categories = ref([]);
const brands = ref([]);
const showFormModal = ref(false);
const isEditing = ref(false);
const editingGadgetId = ref(null);

const gadgetForm = ref({
  name: "",
  brand_id: "",
  category_id: "",
  model: "",
  price: "",
  description: "",
  status: "published",
  specs: [{ spec_group: "Umum", spec_key: "", spec_value: "" }],
});

const selectedFiles = ref([]);
const filePreviews = ref([]);

const weeklyReviews = computed(() => data.value?.charts?.weeklyReviews || []);
const weeklyMax = computed(() => {
  const values = weeklyReviews.value.map((item) => Number(item.reviews || 0));
  return Math.max(1, ...values);
});

const topReviewed = computed(() => data.value?.charts?.topReviewedGadgets || []);
const topReviewedMax = computed(() => {
  const values = topReviewed.value.map((item) => Number(item.reviews || 0));
  return Math.max(1, ...values);
});

const sidebarItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'gadgets', label: 'Manajemen Gadget', icon: Smartphone, badge: null },
  { id: 'users', label: 'Manajemen Pengguna', icon: Users, badge: null },
  { id: 'reviews', label: 'Moderasi Ulasan', icon: MessageSquare, badge: data.value?.overview?.pendingModeration || null },
]);

const statCards = computed(() => [
  {
    label: 'Total Pengguna',
    value: data.value?.overview?.totalUsers || 0,
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/10',
    sub: `${data.value?.overview?.bannedUsers || 0} dibekukan`,
    subIcon: Activity,
    tabTarget: 'users',
  },
  {
    label: 'Katalog Gadget',
    value: data.value?.overview?.totalGadgets || 0,
    icon: Smartphone,
    color: 'from-purple-500 to-fuchsia-600',
    shadow: 'shadow-purple-500/10',
    sub: 'Aktif di sistem',
    subIcon: Zap,
    tabTarget: 'gadgets',
  },
  {
    label: 'Total Ulasan',
    value: data.value?.overview?.totalReviews || 0,
    icon: MessageSquare,
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-500/10',
    sub: `${data.value?.sentiment?.positive || 0} disetujui`,
    subIcon: CheckCircle,
    tabTarget: 'reviews',
  },
  {
    label: 'Perlu Moderasi',
    value: data.value?.overview?.pendingModeration || 0,
    icon: AlertTriangle,
    color: 'from-rose-500 to-red-600',
    shadow: 'shadow-rose-500/10',
    sub: 'Menunggu tindakan',
    subIcon: Clock,
    tabTarget: 'reviews',
  },
]);

const sentimentItems = computed(() => [
  { name: 'Positif (4-5★)', value: data.value?.sentiment?.positive || 0, color: '#10b981' },
  { name: 'Netral (3★)', value: data.value?.sentiment?.neutral || 0, color: '#f59e0b' },
  { name: 'Negatif (1-2★)', value: data.value?.sentiment?.negative || 0, color: '#ef4444' },
]);

async function fetchDashboardData() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/");
    return;
  }
  const response = await axios.get("/api/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = response.data?.data ?? response.data;
  if (payload?.overview && payload?.sentiment) {
    data.value = payload;
  } else {
    error.value = response.data?.message || "Gagal memuat data dashboard.";
  }
}

async function fetchMetadata() {
  try {
    const token = localStorage.getItem("token");
    const catRes = await axios.get("/api/gadgets/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    categories.value = catRes.data;

    const brandRes = await axios.get("/api/gadgets/brands", {
      headers: { Authorization: `Bearer ${token}` },
    });
    brands.value = brandRes.data;
  } catch (err) {
    console.error("Gagal memuat kategori & brand:", err);
  }
}

async function fetchGadgets() {
  try {
    const response = await axios.get("/api/gadgets");
    adminGadgets.value = response.data;
  } catch (err) {
    console.error("Gagal memuat gadget:", err);
  }
}

onMounted(async () => {
  try {
    await fetchDashboardData();
    await fetchMetadata();
    await fetchGadgets();
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/");
    } else {
      error.value = err.response?.data?.message || "Terjadi kesalahan server saat mengambil data.";
    }
  } finally {
    loading.value = false;
  }
});

// File upload / preview handling
function handleFileChange(event) {
  const files = Array.from(event.target.files);
  selectedFiles.value = files;
  filePreviews.value = files.map(file => URL.createObjectURL(file));
}

function addSpecRow() {
  gadgetForm.value.specs.push({ spec_group: "Umum", spec_key: "", spec_value: "" });
}

function removeSpecRow(index) {
  gadgetForm.value.specs.splice(index, 1);
}

function openCreateForm() {
  isEditing.value = false;
  editingGadgetId.value = null;
  gadgetForm.value = {
    name: "",
    brand_id: brands.value[0]?.id || "",
    category_id: categories.value[0]?.id || "",
    model: "",
    price: "",
    description: "",
    status: "published",
    specs: [
      { spec_group: "Spesifikasi Utama", spec_key: "RAM", spec_value: "" },
      { spec_group: "Spesifikasi Utama", spec_key: "Penyimpanan", spec_value: "" },
      { spec_group: "Spesifikasi Utama", spec_key: "Prosesor", spec_value: "" },
      { spec_group: "Spesifikasi Utama", spec_key: "Baterai", spec_value: "" },
    ],
  };
  selectedFiles.value = [];
  filePreviews.value = [];
  showFormModal.value = true;
}

async function openEditForm(gadget) {
  isEditing.value = true;
  editingGadgetId.value = gadget.id;
  
  try {
    const res = await axios.get(`/api/gadgets/${gadget.id}`);
    const details = res.data;
    
    const matchedBrand = brands.value.find(b => b.name === details.brand);
    const matchedCategory = categories.value.find(c => c.name === details.category);

    gadgetForm.value = {
      name: details.name,
      brand_id: matchedBrand?.id || details.brand_id || "",
      category_id: matchedCategory?.id || details.category_id || "",
      model: details.model || "",
      price: details.price || "",
      description: details.description || "",
      status: details.status || "published",
      specs: details.specs && details.specs.length > 0
        ? details.specs.map(s => ({
            spec_group: s.spec_group,
            spec_key: s.spec_key,
            spec_value: s.spec_value
          }))
        : [
            { spec_group: "Spesifikasi Utama", spec_key: "RAM", spec_value: "" },
            { spec_group: "Spesifikasi Utama", spec_key: "Penyimpanan", spec_value: "" },
            { spec_group: "Spesifikasi Utama", spec_key: "Prosesor", spec_value: "" },
            { spec_group: "Spesifikasi Utama", spec_key: "Baterai", spec_value: "" },
          ],
    };
    selectedFiles.value = [];
    filePreviews.value = details.images || [];
    showFormModal.value = true;
  } catch (err) {
    console.error("Gagal mengambil detail gadget untuk edit:", err);
    alert("Gagal memuat detail gadget.");
  }
}

async function saveGadget() {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", gadgetForm.value.name);
    formData.append("brand_id", gadgetForm.value.brand_id);
    formData.append("category_id", gadgetForm.value.category_id);
    formData.append("model", gadgetForm.value.model);
    formData.append("price", gadgetForm.value.price);
    formData.append("description", gadgetForm.value.description);
    formData.append("status", gadgetForm.value.status);
    formData.append("specs", JSON.stringify(gadgetForm.value.specs));
    
    for (const file of selectedFiles.value) {
      formData.append("images", file);
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    if (isEditing.value) {
      await axios.put(`/api/gadgets/${editingGadgetId.value}`, formData, { headers });
    } else {
      await axios.post("/api/gadgets", formData, { headers });
    }

    showFormModal.value = false;
    await fetchGadgets();
    await fetchDashboardData();
  } catch (err) {
    console.error("Gagal menyimpan gadget:", err);
    alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan gadget");
  }
}

async function deleteGadget(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus gadget ini? Semua ulasan, media, dan spesifikasinya akan ikut terhapus.")) {
    return;
  }
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/api/gadgets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchGadgets();
    await fetchDashboardData();
  } catch (err) {
    console.error("Gagal menghapus gadget:", err);
    alert(err.response?.data?.message || "Gagal menghapus gadget");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/");
}
</script>

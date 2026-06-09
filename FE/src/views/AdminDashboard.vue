<template>
  <div class="h-screen flex bg-[#F8F9FA] font-sans text-slate-800 relative overflow-hidden">
    <!-- Sidebar Backdrop (Mobile only) -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-all duration-300"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static md:translate-x-0 h-screen overflow-y-auto shrink-0',
        isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-slate-950/20' : '-translate-x-full'
      ]"
    >
      <div class="h-16 flex items-center px-6 border-b border-slate-50 shrink-0">
        <router-link to="/" class="flex items-center gap-2.5">
          <img :src="logo" alt="Mending Mana Logo" class="w-8 h-8 object-cover rounded-xl shadow-lg shadow-blue-600/20" />
          <h1 class="text-lg font-extrabold text-slate-800 tracking-tight">Mending Mana</h1>
        </router-link>
      </div>

      <div class="px-4 py-6">
        <p class="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
        <nav class="space-y-1">
          <button
            v-for="item in sidebarItems"
            :key="item.id"
            @click="setActiveTab(item.id); isSidebarOpen = false"
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
          <button @click="isSidebarOpen = true" class="md:hidden text-slate-400 hover:text-slate-600 transition-colors">
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
          <button @click="setActiveTab('reviews')" class="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors" title="Moderasi Ulasan">
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
        <DashboardOverview
          v-else-if="data && activeTab === 'dashboard'"
          :data="data"
          @change-tab="setActiveTab"
        />

        <!-- Gadget Management Tab -->
        <AdminGadgetsTab
          v-else-if="activeTab === 'gadgets'"
          :gadgets="adminGadgets"
          @add-new="openCreateForm"
          @edit-gadget="openEditForm"
          @delete-gadget="deleteGadget"
        />

        <!-- Users Tab -->
        <AdminUsersTab
          v-else-if="activeTab === 'users'"
        />

        <!-- Reviews Tab -->
        <AdminReviewsTab
          v-else-if="activeTab === 'reviews'"
        />
      </div>
    </main>

    <!-- Form Modal (Create / Edit Gadget) -->
    <GadgetFormModal
      :show="showFormModal"
      :is-editing="isEditing"
      :gadget-form="gadgetForm"
      :brands="brands"
      :categories="categories"
      :file-previews="filePreviews"
      @close="closeFormModal"
      @save="saveGadget"
      @file-change="handleFileChange"
      @add-spec="addSpecRow"
      @remove-spec="removeSpecRow"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Globe, LogOut, Menu, Search, Bell
} from "lucide-vue-next";
import DashboardOverview from "../components/admin/DashboardOverview.vue";
import AdminGadgetsTab from "../components/admin/AdminGadgetsTab.vue";
import AdminReviewsTab from "../components/admin/AdminReviewsTab.vue";
import AdminUsersTab from "../components/admin/AdminUsersTab.vue";
import GadgetFormModal from "../components/admin/GadgetFormModal.vue";
import { useAdminDashboard } from "../composables/useAdminDashboard";

const {
  logo,
  userName,
  userEmail,
  activeTab,
  data,
  loading,
  error,
  adminGadgets,
  categories,
  brands,
  showFormModal,
  isEditing,
  gadgetForm,
  filePreviews,
  sidebarItems,
  handleFileChange,
  addSpecRow,
  removeSpecRow,
  openCreateForm,
  openEditForm,
  saveGadget,
  deleteGadget,
  logout
} = useAdminDashboard();

const isSidebarOpen = ref(false);

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const closeFormModal = () => {
  showFormModal.value = false;
};
</script>

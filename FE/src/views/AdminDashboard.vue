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
        <DashboardOverview
          v-else-if="data && activeTab === 'dashboard'"
          :data="data"
          @change-tab="activeTab = $event"
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
      @close="showFormModal = false"
      @save="saveGadget"
      @file-change="handleFileChange"
      @add-spec="addSpecRow"
      @remove-spec="removeSpecRow"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Cpu, Globe, LogOut, Menu, Search, Bell,
  LayoutDashboard, Smartphone, Users, MessageSquare
} from "lucide-vue-next";
import axios from "axios";

import DashboardOverview from "../components/admin/DashboardOverview.vue";
import AdminGadgetsTab from "../components/admin/AdminGadgetsTab.vue";
import AdminReviewsTab from "../components/admin/AdminReviewsTab.vue";
import AdminUsersTab from "../components/admin/AdminUsersTab.vue";
import GadgetFormModal from "../components/admin/GadgetFormModal.vue";

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

const sidebarItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'gadgets', label: 'Manajemen Gadget', icon: Smartphone, badge: null },
  { id: 'users', label: 'Manajemen Pengguna', icon: Users, badge: null },
  { id: 'reviews', label: 'Moderasi Ulasan', icon: MessageSquare, badge: data.value?.overview?.pendingModeration || null },
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

import { ref, onMounted, computed, watch } from "vue";
import logo from "../assets/logo.jpeg";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  LayoutDashboard, Smartphone, Users, MessageSquare
} from "lucide-vue-next";

export function useAdminDashboard() {
  const router = useRouter();

  const userName = ref(localStorage.getItem("userFullName") || "");
  const userEmail = ref(localStorage.getItem("userEmail") || "");
  const activeTab = ref(localStorage.getItem("adminActiveTab") || "dashboard");

  // Keep track of the active tab on refresh
  watch(activeTab, (newTab) => {
    localStorage.setItem("adminActiveTab", newTab);
  });

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
    localStorage.removeItem("adminActiveTab");
    router.push("/");
  }

  return {
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
    editingGadgetId,
    gadgetForm,
    selectedFiles,
    filePreviews,
    sidebarItems,
    fetchDashboardData,
    fetchMetadata,
    fetchGadgets,
    handleFileChange,
    addSpecRow,
    removeSpecRow,
    openCreateForm,
    openEditForm,
    saveGadget,
    deleteGadget,
    logout
  };
}

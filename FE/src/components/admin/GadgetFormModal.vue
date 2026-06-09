<template>
  <div v-if="show" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
      <!-- Modal Header -->
      <div class="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
        <h4 class="text-lg font-extrabold text-slate-900">
          {{ isEditing ? 'Edit Gadget' : 'Tambah Gadget Baru' }}
        </h4>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
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
            <input type="file" multiple accept="image/*" @change="$emit('file-change', $event)" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
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
            <button type="button" @click="$emit('add-spec')" class="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-all">
              <PlusCircle class="w-3.5 h-3.5" /> Tambah Baris
            </button>
          </div>

          <div class="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="(spec, index) in gadgetForm.specs" :key="index" class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center border-b border-slate-100 sm:border-b-0 pb-3 sm:pb-0">
              <input v-model="spec.spec_group" type="text" placeholder="Grup (e.g. Layar)" class="w-full sm:w-1/3 px-3 py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-lg text-xs outline-none transition-all" />
              <input v-model="spec.spec_key" type="text" placeholder="Kunci (e.g. Resolusi)" class="w-full sm:w-1/3 px-3 py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-lg text-xs outline-none transition-all" required />
              <div class="flex gap-2 items-center w-full sm:w-1/3">
                <input v-model="spec.spec_value" type="text" placeholder="Nilai (e.g. 1080p)" class="flex-1 px-3 py-2 bg-slate-50 border border-transparent focus:border-blue-500 rounded-lg text-xs outline-none transition-all" required />
                <button type="button" @click="$emit('remove-spec', index)" class="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                  <MinusCircle class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-if="!gadgetForm.specs || gadgetForm.specs.length === 0" class="text-center py-4 text-xs text-slate-400">
              Belum ada spesifikasi yang ditambahkan.
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="h-16 border-t border-slate-100 px-6 flex items-center justify-end gap-3 shrink-0">
        <button @click="$emit('close')" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-500 transition-all">
          Batal
        </button>
        <button @click="$emit('save')" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5">
          <Save class="w-4 h-4" /> {{ isEditing ? 'Simpan Perubahan' : 'Tambahkan Gadget' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, Upload, PlusCircle, MinusCircle, Save } from "lucide-vue-next";

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  isEditing: {
    type: Boolean,
    required: true,
  },
  gadgetForm: {
    type: Object,
    required: true,
  },
  brands: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  filePreviews: {
    type: Array,
    required: true,
  },
});

defineEmits(["close", "save", "file-change", "add-spec", "remove-spec"]);
</script>

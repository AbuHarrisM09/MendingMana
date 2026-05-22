<template>
  <div class="max-w-7xl mx-auto space-y-6 animate-fade-in">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl">
      <div>
        <h3 class="text-xl font-extrabold text-slate-900">Katalog Gadget</h3>
        <p class="text-slate-500 text-sm font-medium">Kelola data gadget, spesifikasi, dan gambar dalam satu panel.</p>
      </div>
      <button @click="$emit('add-new')" class="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
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
            <tr v-for="gadget in gadgets" :key="gadget.id" class="hover:bg-slate-50/30 transition-colors group">
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
                  <button @click="$emit('edit-gadget', gadget)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Gadget">
                    <Edit class="w-4 h-4" />
                  </button>
                  <button @click="$emit('delete-gadget', gadget.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Gadget">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="gadgets.length === 0">
              <td colspan="6" class="p-10 text-center text-slate-400">
                Tidak ada gadget dalam database.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Smartphone, Star, Edit, Trash2, Plus } from "lucide-vue-next";

defineProps({
  gadgets: {
    type: Array,
    required: true,
  },
});

defineEmits(["add-new", "edit-gadget", "delete-gadget"]);
</script>

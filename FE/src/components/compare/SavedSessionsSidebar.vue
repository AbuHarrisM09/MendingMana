<template>
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
          @click="$emit('load-session', session)"
        >
          <!-- Delete button for session (Member only) -->
          <button
            @click.stop="$emit('delete-session', session)"
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
          @click="$emit('login-redirect')"
          class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-colors"
        >
          Masuk Sekarang
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { History, RefreshCw, FolderHeart, Trash2 } from 'lucide-vue-next'

defineProps({
  isMember: {
    type: Boolean,
    required: true
  },
  loadingSessions: {
    type: Boolean,
    default: false
  },
  sessionsList: {
    type: Array,
    required: true
  },
  activeSessionId: {
    type: [Number, String],
    default: null
  },
  activeSessionTitle: {
    type: String,
    default: ''
  },
  formatDate: {
    type: Function,
    required: true
  }
})

defineEmits(['load-session', 'delete-session', 'login-redirect'])
</script>

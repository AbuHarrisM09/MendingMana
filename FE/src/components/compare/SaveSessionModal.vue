<template>
  <Transition name="fade">
    <div v-show="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <!-- Backdrop -->
      <div @click="$emit('close')" class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"></div>

      <!-- Content Card -->
      <div class="relative bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-in z-10">
        <button 
          @click="$emit('close')" 
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
            @click="$emit('close')"
            class="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-800 font-bold text-sm transition-colors"
          >
            Batal
          </button>
          <button
            v-if="activeSessionId"
            @click="$emit('save', sessionInputTitle, true)"
            class="w-full sm:w-auto px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm rounded-xl transition-all"
          >
            Simpan Baru
          </button>
          <button
            @click="$emit('save', sessionInputTitle, false)"
            class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/10 transition-all"
          >
            {{ activeSessionId ? 'Timpa Sesi' : 'Simpan Sesi' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X, Save, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
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
  defaultSessionTitle: {
    type: String,
    default: 'Komparasi Baru'
  }
})

const emit = defineEmits(['close', 'save'])

const sessionInputTitle = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    sessionInputTitle.value = props.activeSessionId ? props.activeSessionTitle : ''
  }
})
</script>

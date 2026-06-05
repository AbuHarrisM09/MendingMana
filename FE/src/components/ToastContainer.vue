<template>
  <div class="fixed top-4 right-4 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3.5 p-4 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 transition-all duration-300"
        :class="{
          'border-l-4 border-l-emerald-500': toast.type === 'success',
          'border-l-4 border-l-red-500': toast.type === 'error',
          'border-l-4 border-l-amber-500': toast.type === 'warning',
          'border-l-4 border-l-blue-500': toast.type === 'info',
        }"
      >
        <!-- Icon -->
        <component 
          :is="getIcon(toast.type)" 
          class="w-5 h-5 shrink-0 mt-0.5"
          :class="{
            'text-emerald-500': toast.type === 'success',
            'text-red-500': toast.type === 'error',
            'text-amber-500': toast.type === 'warning',
            'text-blue-500': toast.type === 'info',
          }"
        />
        
        <!-- Text -->
        <p class="text-sm font-bold text-slate-700 flex-1 leading-relaxed">{{ toast.message }}</p>
        
        <!-- Close Button -->
        <button @click="removeToast(toast.id)" class="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-50 mt-0.5">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useToast } from '../composables/useToast';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const { toasts, removeToast, showToast } = useToast();

const getIcon = (type) => {
  switch (type) {
    case 'error': return XCircle;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
    default: return CheckCircle2;
  }
};

onMounted(() => {
  if (localStorage.getItem('logoutToast') === 'true') {
    showToast('Anda berhasil keluar dari akun.', 'success');
    localStorage.removeItem('logoutToast');
  }
  if (localStorage.getItem('loginToast') === 'true') {
    showToast('Selamat datang kembali!', 'success');
    localStorage.removeItem('loginToast');
  }
});
</script>

<style scoped>
.toast-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-list-move {
  transition: transform 0.3s ease;
}
</style>

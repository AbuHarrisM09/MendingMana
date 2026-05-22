<template>
  <div class="max-w-7xl mx-auto animate-fade-in">
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
</template>

<script setup>
import { Users } from "lucide-vue-next";
</script>

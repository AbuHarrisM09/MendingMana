<template>
  <div class="max-w-7xl mx-auto animate-fade-in">
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
</template>

<script setup>
import { MessageSquare } from "lucide-vue-next";
</script>

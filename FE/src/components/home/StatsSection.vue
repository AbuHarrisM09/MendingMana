<template>
  <section class="py-24 bg-slate-900 rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 mb-12 overflow-hidden relative">
    <div class="absolute inset-0 z-0">
      <div class="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2"></div>
    </div>
    <div class="relative z-10 max-w-5xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-4">Mengapa Mending Mana?</h2>
        <p class="text-slate-400 text-lg">Komunitas tech reviewer terbesar dan paling objektif.</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div
          v-for="stat in statsData"
          :key="stat.label"
          class="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300"
        >
          <p class="text-slate-300 text-sm font-medium mb-3">{{ stat.label }}</p>
          <p class="text-white text-3xl md:text-4xl font-black">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  statsData: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <router-link :to="`/gadget/${gadget.id}`" class="group block">
    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 group-hover:-translate-y-1.5">
      <!-- Image -->
      <div class="relative aspect-square bg-gradient-to-br from-slate-50 to-white overflow-hidden">
        <img
          :src="gadget.images[0]"
          :alt="gadget.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <!-- Badges -->
        <div class="absolute top-3 left-3 flex flex-col gap-1.5">
          <span v-if="gadget.isNew" class="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg shadow-blue-600/30">
            <Zap class="w-3 h-3 animate-bounce" /> Baru
          </span>
          <span v-if="gadget.isTrending" class="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/30">
            <Flame class="w-3 h-3 animate-pulse" /> Trending
          </span>
        </div>

        <!-- Action buttons -->
        <div class="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            @click.prevent="handleWishlist"
            :class="[
              'w-9 h-9 rounded-xl shadow-lg flex items-center justify-center transition-all backdrop-blur-md',
              isWishlisted ? 'bg-pink-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-pink-50 hover:text-pink-500'
            ]"
            title="Tambah ke Wishlist"
          >
            <Heart :class="['w-4 h-4', { 'fill-current': isWishlisted }]" />
          </button>
          <button
            @click.prevent="handleCompare"
            :class="[
              'w-9 h-9 rounded-xl shadow-lg flex items-center justify-center transition-all backdrop-blur-md',
              isInCompare ? 'bg-blue-600 text-white' : 'bg-white/90 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            ]"
            title="Tambah ke Komparasi"
          >
            <GitCompare class="w-4 h-4" />
          </button>
        </div>

        <!-- Category badge -->
        <div class="absolute bottom-3 left-3">
          <span class="px-2.5 py-1 bg-white/80 backdrop-blur-md text-slate-700 text-[10px] font-bold rounded-full border border-white/60 shadow-sm uppercase tracking-wider">
            {{ gadget.category }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="p-4">
        <p class="text-[10px] text-blue-600 mb-1.5 font-bold uppercase tracking-wider">{{ gadget.brand }}</p>
        <h3 class="text-slate-800 text-sm mb-2.5 font-bold truncate group-hover:text-blue-600 transition-colors">
          {{ gadget.name }}
        </h3>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-3">
          <StarRating :rating="gadget.averageRating" size="sm" />
          <span class="text-amber-500 text-xs font-bold">
            {{ gadget.averageRating.toFixed(1) }}
          </span>
          <span class="text-slate-400 text-xs font-medium">({{ gadget.totalReviews }})</span>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <span class="text-blue-600 font-extrabold text-[0.95rem] tracking-tight">
            {{ formattedPrice }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Heart, GitCompare, Flame, Zap } from 'lucide-vue-next'
import StarRating from './StarRating.vue'
import { formatPrice } from '../../data/mockData.js'

const props = defineProps({
  gadget: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['login-required'])

// Mock auth & state for now
const isAuthenticated = true // Replace with actual auth check later
const isWishlisted = false
const isInCompare = false

const handleWishlist = () => {
  if (!isAuthenticated) {
    emit('login-required')
    return
  }
  // Toggle wishlist logic
}

const handleCompare = () => {
  if (!isAuthenticated) {
    emit('login-required')
    return
  }
  // Add to compare logic
}

const formattedPrice = computed(() => {
  return formatPrice(props.gadget.price)
})
</script>
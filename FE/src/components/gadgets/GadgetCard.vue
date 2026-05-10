<template>
  <router-link :to="`/gadget/${gadget.id}`" class="group block">
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 group-hover:-translate-y-1">
      <!-- Image -->
      <div class="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        <img
          :src="gadget.images[0]"
          :alt="gadget.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <!-- Badges -->
        <div class="absolute top-3 left-3 flex flex-col gap-1.5">
          <span v-if="gadget.isNew" class="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1">
            <Sparkles class="w-3 h-3" /> Baru
          </span>
          <span v-if="gadget.isTrending" class="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1">
            <TrendingUp class="w-3 h-3" /> Trending
          </span>
        </div>

        <!-- Action buttons -->
        <div class="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click.prevent="handleWishlist"
            :class="[
              'w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-colors',
              isWishlisted ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 hover:bg-pink-50'
            ]"
            title="Tambah ke Wishlist"
          >
            <Heart :class="['w-4 h-4', { 'fill-current': isWishlisted }]" />
          </button>
          <button
            @click.prevent="handleCompare"
            :class="[
              'w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-colors',
              isInCompare ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-blue-50'
            ]"
            title="Tambah ke Komparasi"
          >
            <GitCompare class="w-4 h-4" />
          </button>
        </div>

        <!-- Category badge -->
        <div class="absolute bottom-3 left-3">
          <span class="px-2 py-0.5 bg-white/90 backdrop-blur text-slate-700 text-xs rounded-full border border-slate-200">
            {{ gadget.category }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="p-4">
        <p class="text-xs text-blue-600 mb-1 font-medium">{{ gadget.brand }}</p>
        <h3 class="text-slate-800 text-sm mb-2 font-semibold truncate group-hover:text-blue-600 transition-colors">
          {{ gadget.name }}
        </h3>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-3">
          <StarRating :rating="gadget.averageRating" size="sm" />
          <span class="text-amber-500 text-xs font-semibold">
            {{ gadget.averageRating.toFixed(1) }}
          </span>
          <span class="text-slate-400 text-xs">({{ gadget.totalReviews }})</span>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <span class="text-blue-600 font-bold text-[0.95rem]">
            {{ formattedPrice }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { Heart, GitCompare, TrendingUp, Sparkles } from 'lucide-vue-next'
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
<template>
  <div class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 rounded-3xl overflow-hidden animate-fade-in">
    
    <!-- ============ MOBILE CARD VIEW (< md) ============ -->
    <div class="md:hidden">
      <!-- Swipeable tabs for each gadget -->
      <div class="flex items-center gap-2 px-4 pt-4 pb-2 overflow-x-auto no-scrollbar">
        <button
          v-for="(gadget, index) in comparedGadgetsData.gadgets"
          :key="gadget.id"
          @click="activeCardIndex = index"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border',
            activeCardIndex === index
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
              : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
          ]"
        >
          <div class="w-5 h-5 rounded-md bg-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
            <img 
              :src="gadget.images && gadget.images[0] ? gadget.images[0] : 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=40&h=40&fit=crop'" 
              class="w-full h-full object-contain"
            />
          </div>
          <span class="truncate max-w-[100px]">{{ gadget.name }}</span>
        </button>
      </div>

      <!-- Dot indicators -->
      <div class="flex items-center justify-center gap-1.5 py-2">
        <button
          v-for="(gadget, index) in comparedGadgetsData.gadgets"
          :key="'dot-' + gadget.id"
          @click="activeCardIndex = index"
          :class="[
            'rounded-full transition-all duration-300',
            activeCardIndex === index
              ? 'w-6 h-2 bg-blue-600'
              : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
          ]"
        ></button>
      </div>

      <!-- Swipeable card container -->
      <div 
        class="relative overflow-hidden"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div 
          class="flex transition-transform duration-300 ease-out"
          :style="{ transform: `translateX(calc(-${activeCardIndex * 100}% + ${swipeOffset}px))` }"
        >
          <div 
            v-for="(gadget, gIndex) in comparedGadgetsData.gadgets"
            :key="'card-' + gadget.id"
            class="w-full flex-shrink-0 px-4 pb-4"
          >
            <!-- Gadget Card Header -->
            <div class="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-5 mb-3 relative">
              <button
                @click="$emit('remove-gadget', gadget.id)"
                class="absolute top-3 right-3 text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                title="Hapus dari perbandingan"
              >
                <X class="w-4 h-4" />
              </button>

              <div class="flex items-center gap-4">
                <div class="w-20 h-20 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-100 shadow-sm flex-shrink-0">
                  <img 
                    :src="gadget.images && gadget.images[0] ? gadget.images[0] : 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=150&h=150&fit=crop'" 
                    class="max-w-full max-h-full object-contain" 
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">{{ gadget.brand }}</span>
                  <h3 class="text-sm font-extrabold text-slate-800 mt-0.5 leading-snug">
                    <router-link :to="'/gadget/' + gadget.id.replace('g-', '')" class="hover:underline">
                      {{ gadget.name }}
                    </router-link>
                  </h3>
                  <p class="text-sm font-extrabold text-slate-900 mt-1.5">{{ formatPrice(gadget.price) }}</p>
                  <div class="flex items-center gap-2 mt-1.5">
                    <div class="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      <Star class="w-3 h-3 text-amber-500 fill-current" />
                      <span class="text-[10px] font-bold text-amber-700">{{ gadget.averageRating ? gadget.averageRating.toFixed(1) : '0.0' }}</span>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium">({{ gadget.totalReviews || 0 }} Ulasan)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Specs List -->
            <div class="space-y-1">
              <template v-for="group in comparedGadgetsData.specGroups" :key="'m-' + group.group + '-' + gIndex">
                <!-- Group header -->
                <div class="bg-slate-50/80 px-4 py-2.5 rounded-xl mt-2 first:mt-0">
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-wider">{{ group.group }}</span>
                </div>
                <!-- Spec rows -->
                <div 
                  v-for="spec in group.specs"
                  :key="'m-' + spec.key + '-' + gIndex"
                  class="flex items-start justify-between gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0"
                >
                  <span class="text-[11px] font-bold text-slate-500 flex-shrink-0 w-[40%]">{{ spec.key }}</span>
                  <span v-if="spec.values[gadget.id] !== null" class="text-[11px] text-slate-800 font-medium text-right flex-1 break-words">
                    {{ spec.values[gadget.id] }}
                  </span>
                  <span v-else class="text-[11px] text-slate-300 italic text-right flex-1">—</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation arrows -->
      <div class="flex items-center justify-between px-4 pb-4 pt-1" v-if="comparedGadgetsData.gadgets.length > 1">
        <button
          @click="activeCardIndex = Math.max(0, activeCardIndex - 1)"
          :disabled="activeCardIndex === 0"
          :class="[
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
            activeCardIndex === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100'
          ]"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
          Sebelumnya
        </button>
        <span class="text-[10px] font-bold text-slate-400">
          {{ activeCardIndex + 1 }} / {{ comparedGadgetsData.gadgets.length }}
        </span>
        <button
          @click="activeCardIndex = Math.min(comparedGadgetsData.gadgets.length - 1, activeCardIndex + 1)"
          :disabled="activeCardIndex === comparedGadgetsData.gadgets.length - 1"
          :class="[
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
            activeCardIndex === comparedGadgetsData.gadgets.length - 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100'
          ]"
        >
          Berikutnya
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- ============ DESKTOP TABLE VIEW (>= md) ============ -->
    <div class="hidden md:block">
      <!-- Scrollable Table Wrapper -->
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full border-collapse text-left table-fixed min-w-[700px]">
          <thead>
            <!-- Header Row: Brand Image and basic actions -->
            <tr class="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100 shadow-sm">
              <!-- Column 0: Empty corner -->
              <th class="w-56 p-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50/50 border-r border-slate-100">
                Gadget Info
              </th>
              <!-- Columns 1-N: Compared Gadgets -->
              <th
                v-for="gadget in comparedGadgetsData.gadgets"
                :key="gadget.id"
                class="p-6 relative group border-r border-slate-100 last:border-r-0"
              >
                <!-- Delete floating button -->
                <button
                  @click="$emit('remove-gadget', gadget.id)"
                  class="absolute top-4 right-4 text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-all hover:scale-110"
                  title="Hapus dari perbandingan"
                >
                  <X class="w-4 h-4" />
                </button>

                <div class="flex flex-col items-center text-center mt-2">
                  <!-- Image representation -->
                  <div class="w-28 h-28 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-100 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img 
                      :src="gadget.images && gadget.images[0] ? gadget.images[0] : 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=150&h=150&fit=crop'" 
                      class="max-w-full max-h-full object-contain" 
                    />
                  </div>

                  <!-- Brand name -->
                  <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mt-4">{{ gadget.brand }}</span>
                  <!-- Gadget name -->
                  <h3 class="text-sm font-extrabold text-slate-800 line-clamp-2 mt-1 px-2 h-10 leading-snug group-hover:text-blue-700 transition-colors">
                    <router-link :to="'/gadget/' + gadget.id.replace('g-', '')" class="hover:underline">
                      {{ gadget.name }}
                    </router-link>
                  </h3>

                  <!-- Formatted Price -->
                  <p class="text-sm font-extrabold text-slate-900 mt-2">{{ formatPrice(gadget.price) }}</p>

                  <!-- Rating & Reviews snippet -->
                  <div class="flex flex-col items-center gap-1 mt-2">
                    <div class="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                      <Star class="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span class="text-xs font-bold text-amber-700">{{ gadget.averageRating ? gadget.averageRating.toFixed(1) : '0.0' }}</span>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium">({{ gadget.totalReviews || 0 }} Ulasan)</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Technical Spec Groups Loop -->
            <template v-for="group in comparedGadgetsData.specGroups" :key="group.group">
              <!-- Spec Category Section Header -->
              <tr class="bg-slate-50/80 backdrop-blur-sm border-y border-slate-100">
                <td 
                  :colspan="comparedGadgetsData.gadgets.length + 1"
                  class="px-6 py-3 text-xs font-black text-slate-900 uppercase tracking-wider"
                >
                  {{ group.group }}
                </td>
              </tr>
              
              <!-- Spec Keys Loop inside the Group -->
              <tr
                v-for="spec in group.specs"
                :key="spec.key"
                class="border-b border-slate-100 hover:bg-slate-50/30 transition-colors"
              >
                <!-- Key Label column -->
                <td class="p-4 px-6 text-xs font-bold text-slate-500 bg-slate-50/10 border-r border-slate-100 leading-relaxed">
                  {{ spec.key }}
                </td>
                
                <!-- Gadget values side by side -->
                <td
                  v-for="gadget in comparedGadgetsData.gadgets"
                  :key="gadget.id"
                  class="p-4 text-xs text-slate-700 border-r border-slate-100 last:border-r-0 leading-relaxed font-medium"
                >
                  <span v-if="spec.values[gadget.id] !== null" class="break-words">
                    {{ spec.values[gadget.id] }}
                  </span>
                  <span v-else class="text-slate-300 font-normal italic">
                    —
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRightLeft, X, Star, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { formatPrice } from '../../data/mockData.js'

const props = defineProps({
  comparedGadgetsData: {
    type: Object,
    required: true
  }
})

defineEmits(['remove-gadget'])

// Mobile card view state
const activeCardIndex = ref(0)

// Touch/Swipe handling
const touchStartX = ref(0)
const touchStartY = ref(0)
const swipeOffset = ref(0)
const isSwiping = ref(false)

function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  isSwiping.value = false
}

function onTouchMove(e) {
  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value
  
  // Only handle horizontal swipes
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    isSwiping.value = true
    // Add resistance at the edges
    const isAtStart = activeCardIndex.value === 0 && deltaX > 0
    const isAtEnd = activeCardIndex.value === props.comparedGadgetsData.gadgets.length - 1 && deltaX < 0
    
    if (isAtStart || isAtEnd) {
      swipeOffset.value = deltaX * 0.3
    } else {
      swipeOffset.value = deltaX * 0.6
    }
    e.preventDefault()
  }
}

function onTouchEnd() {
  if (isSwiping.value) {
    const threshold = 50
    if (swipeOffset.value < -threshold && activeCardIndex.value < props.comparedGadgetsData.gadgets.length - 1) {
      activeCardIndex.value++
    } else if (swipeOffset.value > threshold && activeCardIndex.value > 0) {
      activeCardIndex.value--
    }
  }
  swipeOffset.value = 0
  isSwiping.value = false
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

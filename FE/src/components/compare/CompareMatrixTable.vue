<template>
  <div class="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-100/50 rounded-3xl overflow-hidden animate-fade-in">
    <!-- Horizontal Swipe Helper (visible on mobile only) -->
    <div class="md:hidden bg-blue-50/50 text-blue-700 px-4 py-2 border-b border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold">
      <ArrowRightLeft class="w-3.5 h-3.5" />
      <span>Geser tabel ke kanan untuk melihat gadget lain</span>
    </div>

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
</template>

<script setup>
import { ArrowRightLeft, X, Star } from 'lucide-vue-next'
import { formatPrice } from '../../data/mockData.js'

defineProps({
  comparedGadgetsData: {
    type: Object,
    required: true
  }
})

defineEmits(['remove-gadget'])
</script>

<template>
  <section class="sticky top-[64px] z-30 bg-white/80 backdrop-blur-xl border-y border-slate-100 py-4 shadow-sm transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <!-- Search (mobile) -->
        <form @submit.prevent="$emit('search')" class="w-full md:hidden">
          <div class="relative group">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              placeholder="Cari gadget apa hari ini?"
              class="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-transparent hover:border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="$emit('update:searchQuery', '')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 p-1 rounded-full transition-colors"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        </form>

        <!-- Categories -->
        <div class="flex-1 min-w-0 w-full md:w-auto overflow-x-auto hide-scrollbar">
          <div class="flex gap-2 min-w-max px-1">
            <button
              v-for="cat in categories"
              :key="cat.value"
              @click="$emit('category-selected', cat.value)"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                activeCategory === cat.value
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-slate-800'
              ]"
            >
              <component :is="cat.icon" class="w-4 h-4" />
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Sort -->
        <div class="w-full md:w-auto flex shrink-0">
          <select
            :value="sortBy"
            @change="$emit('update:sortBy', $event.target.value)"
            class="w-full md:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none pr-10"
            :style="selectStyle"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Search, X } from 'lucide-vue-next'

defineProps({
  categories: {
    type: Array,
    required: true
  },
  activeCategory: {
    type: String,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  sortOptions: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  selectStyle: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['search', 'update:searchQuery', 'category-selected', 'update:sortBy'])
</script>

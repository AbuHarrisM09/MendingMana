<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="i in max"
      :key="i"
      type="button"
      @click="interactive && onRate(i)"
      @mouseenter="interactive && (hovered = i)"
      @mouseleave="interactive && (hovered = 0)"
      :class="interactive ? 'cursor-pointer focus:outline-none' : 'cursor-default'"
      :disabled="!interactive"
    >
      <Star
        :class="[
          starSizeClass,
          'transition-colors',
          isFilled(i)
            ? 'fill-amber-400 text-amber-400'
            : isHalfFilled(i)
            ? 'fill-amber-200 text-amber-400'
            : 'fill-slate-200 text-slate-300'
        ]"
      />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  rating: { type: Number, required: true },
  max: { type: Number, default: 5 },
  size: { type: String, default: 'md' },
  interactive: { type: Boolean, default: false }
})

const emit = defineEmits(['rate'])

const hovered = ref(0)

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6'
}

const starSizeClass = computed(() => sizeMap[props.size] || sizeMap.md)

const isFilled = (starVal) => {
  return props.interactive
    ? (hovered.value || props.rating) >= starVal
    : props.rating >= starVal
}

const isHalfFilled = (starVal) => {
  return (
    !props.interactive &&
    props.rating >= starVal - 0.5 &&
    props.rating < starVal
  )
}

const onRate = (starVal) => {
  emit('rate', starVal)
}
</script>

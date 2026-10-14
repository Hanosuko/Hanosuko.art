<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Eye, EyeClosed } from 'lucide'
import { MorphIcon } from 'morphicons/vue'
import { useViewCounter } from '@/composables/useViewCounter'

const { total, error, register } = useViewCounter('/api/views')

const formatted = computed(() => {
  if (total.value === null) return '…'
  return new Intl.NumberFormat('en-US').format(total.value)
})

// Глаз изредка моргает: открытый → закрытый → открытый
const blinking = ref(false)
let blinkTimer: number | undefined

const scheduleBlink = (): void => {
  blinkTimer = window.setTimeout(() => {
    blinking.value = true
    blinkTimer = window.setTimeout(() => {
      blinking.value = false
      scheduleBlink()
    }, 180)
  }, 3500 + Math.random() * 3000)
}

onMounted(() => {
  void register()
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) scheduleBlink()
})

onBeforeUnmount(() => window.clearTimeout(blinkTimer))
</script>

<template>
  <div class="view-counter">
    <MorphIcon :icon="blinking ? EyeClosed : Eye" :size="14" spring="snappy" />
    <span v-if="!error">{{ formatted }} views</span>
    <span v-else>— views</span>
  </div>
</template>

<style scoped>
.view-counter {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>

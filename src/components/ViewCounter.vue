<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Eye } from 'lucide-vue-next'
import { useViewCounter } from '@/composables/useViewCounter'

const { total, error, register } = useViewCounter('/api/views')

const formatted = computed(() => {
  if (total.value === null) return '…'
  return new Intl.NumberFormat('en-US').format(total.value)
})

onMounted(() => {
  void register()
})
</script>

<template>
  <div class="view-counter">
    <Eye :size="14" aria-hidden="true" />
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

<script setup lang="ts">
import { Eye } from 'lucide-vue-next'
import { profile } from '@/config/profile'

// 👇 Сейчас это просто заглушка с числом из конфига.
// Чтобы подключить реальный счётчик (например, https://counterapi.dev или
// свой serverless endpoint) — замени тело компонента и убери fakeValue из конфига.
const formatted = new Intl.NumberFormat('en-US').format(profile.viewCounter.fakeValue)
</script>

<template>
  <div class="view-counter">
    <Eye :size="14" aria-hidden="true" />
    <span>{{ formatted }} views</span>
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

<script setup lang="ts">
import { computed } from 'vue'
import { profile } from '@/config/profile'
import { useServerStatus } from '@/composables/useServerStatus'

// 👇 Адрес сервера и логотип — в src/config/profile.ts → server
const server = profile.server

const { status } = useServerStatus(server.address)

const players = computed(() => status.value?.players ?? null)
// Полоска считается от barMax, а не от 991 слота — иначе даже сотня игроков почти не видна
const fill = computed(() => {
  const current = players.value
  const max = server.barMax ?? current?.max ?? 0
  return current && max > 0 ? Math.min((current.online / max) * 100, 100) : 0
})
</script>

<template>
  <!-- Плитка сервера: логотип, IP и полоска онлайна. Тянется до низа плеера слева, содержимое по центру -->
  <section class="srv glass-card" :aria-label="`${server.name} server status`">
    <img v-if="server.logoUrl" class="srv-icon is-logo" :src="server.logoUrl" alt="" />
    <img v-else-if="status?.icon" class="srv-icon" :src="status.icon" alt="" />
    <span v-else class="srv-icon is-empty" aria-hidden="true" />

    <div class="srv-main">
      <h2 class="srv-name">IP: {{ server.address }}</h2>
      <!-- Выключенный сервер не отдаёт игроков — тогда полоски нет, только IP -->
      <div v-if="players" class="srv-players">
        <span class="srv-bar" aria-hidden="true"><span :style="{ width: `${fill}%` }" /></span>
        <span class="srv-count"><b>{{ players.online }}</b> / {{ players.max }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.srv {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 1.25rem;
}

.srv-icon {
  width: 3.25rem;
  height: 3.25rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  image-rendering: pixelated;
  background: rgba(255, 255, 255, 0.06);
}

/* Логотип с сайта гладкий, а не пиксельный, и не прилипает к краям плашки */
.srv-icon.is-logo {
  padding: 0.55rem;
  object-fit: contain;
  image-rendering: auto;
}

.srv-main {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
  flex: 1;
}

.srv-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.srv-players {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.srv-bar {
  flex: 1;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.srv-bar > span {
  display: block;
  height: 100%;
  min-width: 6px;
  border-radius: inherit;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  transition: width 0.6s ease;
}

.srv-count {
  font-variant-numeric: tabular-nums;
}

.srv-count b {
  color: var(--color-text);
}

/* Узкая плитка (телефон) — плотнее */
@container (max-width: 28rem) {
  .srv {
    gap: 0.8rem;
    padding: 0.85rem 0.95rem;
  }

  .srv-icon {
    width: 2.85rem;
    height: 2.85rem;
  }
}
</style>

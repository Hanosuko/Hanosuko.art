<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Globe } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import { useServerStatus } from '@/composables/useServerStatus'

// 👇 Адрес сервера и сайт — в src/config/profile.ts → server
const server = profile.server

const { status } = useServerStatus(server.address)

const isOnline = computed(() => status.value?.online === true)
const players = computed(() => status.value?.players ?? null)
const fill = computed(() => {
  const current = players.value
  return current && current.max > 0 ? Math.min((current.online / current.max) * 100, 100) : 0
})

const statusLabel = computed(() => {
  if (!status.value) return 'checking…'
  return isOnline.value ? 'online' : 'offline'
})

const siteHost = server.websiteUrl ? new URL(server.websiteUrl).host.replace(/^www\./, '') : null
</script>

<template>
  <!-- Короткая плитка: иконка, онлайн и ссылка на сайт -->
  <section class="srv glass-card" :aria-label="`${server.name} server status`">
    <img v-if="status?.icon" class="srv-icon" :src="status.icon" alt="" />
    <span v-else class="srv-icon is-empty" aria-hidden="true" />

    <div class="srv-main">
      <div class="srv-head">
        <h2 class="srv-name">{{ server.name }}</h2>
        <span class="srv-pill" :class="{ 'is-online': isOnline, 'is-pending': !status }">
          <span class="srv-dot" aria-hidden="true" />
          {{ statusLabel }}
        </span>
      </div>
      <div v-if="players" class="srv-players">
        <span class="srv-bar" aria-hidden="true"><span :style="{ width: `${fill}%` }" /></span>
        <span class="srv-count"><b>{{ players.online }}</b> / {{ players.max }}</span>
      </div>
    </div>

    <a
      v-if="server.websiteUrl"
      class="srv-site"
      :href="server.websiteUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`${server.name} website`"
    >
      <Globe :size="16" aria-hidden="true" />
      <span class="srv-site-host">{{ siteHost }}</span>
      <ArrowUpRight :size="14" class="srv-site-arrow" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.srv {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 1.25rem;
}

.srv-icon {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.6rem;
  image-rendering: pixelated;
  background: rgba(255, 255, 255, 0.06);
}

.srv-main {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
}

.srv-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.srv-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.srv-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(242, 63, 67, 0.12);
  color: #f87171;
  font-size: 0.72rem;
  font-weight: 700;
}

.srv-pill.is-online {
  background: rgba(35, 165, 90, 0.14);
  color: #4ade80;
}

.srv-pill.is-pending {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-muted);
}

.srv-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: currentColor;
}

.srv-pill.is-online .srv-dot {
  animation: srv-pulse 2s ease-out infinite;
}

.srv-players {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text-muted);
  font-size: 0.78rem;
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

.srv-site {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  flex-shrink: 0;
  height: 2.6rem;
  padding: 0 0.85rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 700;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.srv-site-arrow {
  color: var(--color-text-muted);
}

.srv-site:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 1px;
}

@media (hover: hover) {
  .srv-site:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.14);
  }
}

/* Узкая плитка — от кнопки сайта остаётся только глобус, чтобы влезло название */
@container (max-width: 28rem) {
  .srv {
    gap: 0.7rem;
    padding: 0.8rem 0.85rem;
  }

  .srv-site {
    width: 2.6rem;
    padding: 0;
  }

  .srv-site-host,
  .srv-site-arrow {
    display: none;
  }
}

@keyframes srv-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.55);
  }
  100% {
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
  }
}
</style>

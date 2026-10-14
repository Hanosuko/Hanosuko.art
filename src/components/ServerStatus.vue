<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Copy, Globe, Users } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import { useServerStatus } from '@/composables/useServerStatus'
import { parseMotdLine } from '@/utils/motd'

// 👇 Адрес сервера и сайт — в src/config/profile.ts → server
const server = profile.server

const { status } = useServerStatus(server.address)

const isOnline = computed(() => status.value?.online === true)
const players = computed(() => status.value?.players ?? null)
const fill = computed(() => {
  const current = players.value
  return current && current.max > 0 ? Math.min((current.online / current.max) * 100, 100) : 0
})
const version = computed(() => status.value?.protocol?.name ?? status.value?.version ?? null)
const motd = computed(() => (status.value?.motd?.raw ?? []).map(parseMotdLine).filter((line) => line.length > 0))

const statusLabel = computed(() => {
  if (!status.value) return 'checking…'
  return isOnline.value ? 'online' : 'offline'
})

const copied = ref(false)
let copiedTimer: number | undefined

const copyAddress = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(server.address)
    copied.value = true
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => (copied.value = false), 1400)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <section class="srv glass-card" :aria-label="`${server.name} server status`">
    <header class="srv-head">
      <img v-if="status?.icon" class="srv-icon" :src="status.icon" alt="" />
      <span v-else class="srv-icon is-empty" aria-hidden="true" />
      <div class="srv-title">
        <h2 class="srv-name">{{ server.name }}</h2>
        <span class="srv-meta">{{ server.address }}<template v-if="version"> · {{ version }}</template></span>
      </div>
      <span class="srv-pill" :class="{ 'is-online': isOnline, 'is-pending': !status }">
        <span class="srv-dot" aria-hidden="true" />
        {{ statusLabel }}
      </span>
    </header>

    <!-- MOTD как в списке серверов Minecraft -->
    <div v-if="motd.length" class="srv-motd">
      <p v-for="(line, lineIndex) in motd" :key="lineIndex">
        <span
          v-for="(segment, index) in line"
          :key="index"
          :style="{
            color: segment.color ?? undefined,
            fontWeight: segment.bold ? 700 : undefined,
            fontStyle: segment.italic ? 'italic' : undefined,
            textDecoration: [segment.underline && 'underline', segment.strike && 'line-through'].filter(Boolean).join(' ') || undefined,
          }"
        >{{ segment.text }}</span>
      </p>
    </div>

    <div v-if="players" class="srv-players">
      <Users :size="14" aria-hidden="true" />
      <span class="srv-bar" aria-hidden="true"><span :style="{ width: `${fill}%` }" /></span>
      <span class="srv-count"><b>{{ players.online }}</b> / {{ players.max }}</span>
    </div>

    <div class="srv-actions">
      <button type="button" class="srv-copy" :class="{ 'is-done': copied }" @click="copyAddress">
        <Check v-if="copied" :size="15" aria-hidden="true" />
        <Copy v-else :size="15" aria-hidden="true" />
        <span>{{ copied ? 'copied!' : server.address }}</span>
      </button>
      <a
        v-if="server.websiteUrl"
        class="srv-site"
        :href="server.websiteUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${server.name} website`"
        title="Website"
      >
        <Globe :size="16" aria-hidden="true" />
      </a>
    </div>
  </section>
</template>

<style scoped>
.srv {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
  padding: 1.1rem 1.2rem 1.2rem;
  border-radius: 1.25rem;
}

.srv-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.srv-icon {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.6rem;
  image-rendering: pixelated;
  background: rgba(255, 255, 255, 0.06);
}

.srv-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.srv-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.srv-meta {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.srv-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.3rem 0.65rem;
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

.srv-motd {
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #aaaaaa;
  /* В Minecraftia нет капителей (ᴄɪꜱᴘʀᴀᴄ) — они разъезжаются, поэтому основной шрифт */
  font-size: 0.75rem;
  line-height: 1.6;
  white-space: pre-wrap;
  text-align: center;
}

.srv-motd p {
  margin: 0;
  overflow-wrap: anywhere;
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

.srv-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.srv-copy,
.srv-site {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.6rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.srv-copy {
  flex: 1;
  min-width: 0;
}

.srv-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.srv-copy.is-done {
  color: #4ade80;
}

.srv-site {
  width: 2.6rem;
  flex-shrink: 0;
}

.srv-copy:focus-visible,
.srv-site:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 1px;
}

@media (hover: hover) {
  .srv-copy:hover,
  .srv-site:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.14);
  }
}

/* На узкой плитке пробелы-отступы из игры не влезают — схлопываем их */
@container (max-width: 24rem) {
  .srv-motd {
    white-space: normal;
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

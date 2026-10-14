<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Check, Copy } from 'lucide'
import { MorphIcon } from 'morphicons/vue'
import { profile } from '@/config/profile'
import { useServerStatus } from '@/composables/useServerStatus'

// 👇 Адрес сервера и логотип — в src/config/profile.ts → server
const server = profile.server

const { status } = useServerStatus(server.address)

const players = computed(() => status.value?.players ?? null)
const fill = computed(() => {
  const current = players.value
  return current && current.max > 0 ? Math.min((current.online / current.max) * 100, 100) : 0
})

// Кнопка копирует IP: иконка перетекает в галочку, адрес уезжает вверх, снизу въезжает «IP copied!»
const COPIED_TEXT = 'IP copied!'
const copied = ref(false)
let copiedTimer: number | undefined

const copyIp = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(server.address)
  } catch {
    return
  }
  copied.value = true
  window.clearTimeout(copiedTimer)
  copiedTimer = window.setTimeout(() => (copied.value = false), 1800)
}

onBeforeUnmount(() => window.clearTimeout(copiedTimer))

// Невидимая подложка с текстом подлиннее держит ширину кнопки, пока надписи сменяют друг друга
const sizerText = server.address.length >= COPIED_TEXT.length ? server.address : COPIED_TEXT
</script>

<template>
  <!-- Короткая плитка: логотип, онлайн и кнопка «скопировать IP» -->
  <section class="srv glass-card" :aria-label="`${server.name} server status`">
    <img v-if="server.logoUrl" class="srv-icon is-logo" :src="server.logoUrl" alt="" />
    <img v-else-if="status?.icon" class="srv-icon" :src="status.icon" alt="" />
    <span v-else class="srv-icon is-empty" aria-hidden="true" />

    <div class="srv-main">
      <h2 class="srv-name">{{ server.name }}</h2>
      <!-- Выключенный сервер не отдаёт игроков — тогда полоски нет, только название -->
      <div v-if="players" class="srv-players">
        <span class="srv-bar" aria-hidden="true"><span :style="{ width: `${fill}%` }" /></span>
        <span class="srv-count"><b>{{ players.online }}</b> / {{ players.max }}</span>
      </div>
    </div>

    <button
      type="button"
      class="srv-copy"
      :class="{ 'is-copied': copied }"
      :title="copied ? COPIED_TEXT : `Copy server IP: ${server.address}`"
      @click="copyIp"
    >
      <MorphIcon :icon="copied ? Check : Copy" :size="16" spring="bouncy" reduced-motion="user" />
      <span class="srv-copy-text">
        <span class="srv-copy-sizer" aria-hidden="true">{{ sizerText }}</span>
        <Transition name="srv-swap">
          <span :key="copied ? 'copied' : 'ip'" class="srv-copy-label">{{ copied ? COPIED_TEXT : server.address }}</span>
        </Transition>
      </span>
    </button>
    <span class="sr-only" aria-live="polite">{{ copied ? COPIED_TEXT : '' }}</span>
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

/* Логотип с сайта гладкий, а не пиксельный, и не прилипает к краям плашки */
.srv-icon.is-logo {
  padding: 0.45rem;
  object-fit: contain;
  image-rendering: auto;
}

.srv-main {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
}

.srv-name {
  margin: 0;
  font-size: 1rem;
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

.srv-copy {
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
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
}

.srv-copy:active {
  transform: scale(0.95);
}

.srv-copy:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 1px;
}

@media (hover: hover) {
  .srv-copy:hover {
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.14);
  }
}

/* Скопировано — кнопка подсвечивается зелёным и коротко «подпрыгивает» */
.srv-copy.is-copied {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.35);
  animation: srv-copied 0.35s ease;
}

/* Надписи лежат в одной клетке сетки и сменяют друг друга, ширину держит подложка */
.srv-copy-text {
  display: grid;
  overflow: hidden;
}

.srv-copy-text > * {
  grid-area: 1 / 1;
  white-space: nowrap;
}

.srv-copy-sizer {
  visibility: hidden;
}

.srv-swap-enter-active,
.srv-swap-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.srv-swap-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.srv-swap-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@keyframes srv-copied {
  40% {
    transform: scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .srv-copy.is-copied {
    animation: none;
  }

  .srv-swap-enter-active,
  .srv-swap-leave-active {
    transition: opacity 0.15s ease;
  }

  .srv-swap-enter-from,
  .srv-swap-leave-to {
    transform: none;
  }
}

/* Узкая плитка — плотнее отступы, чтобы влезли название, полоска и адрес */
@container (max-width: 28rem) {
  .srv {
    gap: 0.7rem;
    padding: 0.8rem 0.85rem;
  }

  .srv-copy {
    padding: 0 0.7rem;
  }
}

/* Совсем узко — остаётся одна иконка, а «скопировано» показывает галочка и зелёный цвет */
@container (max-width: 20rem) {
  .srv-copy {
    width: 2.6rem;
    padding: 0;
  }

  .srv-copy-text {
    display: none;
  }
}
</style>

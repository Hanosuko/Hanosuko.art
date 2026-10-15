<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DiscordGuildConfig } from '@/types/profile'
import { placeOver, type PopoverPlace } from '@/utils/popover'

// Карточка сервера по клику на тег, как в Discord. Кнопка никуда не ведёт: по клику надпись
// уезжает вверх, снизу въезжает «Maybe next time», через пару секунд всё возвращается
const props = defineProps<{
  guild: DiscordGuildConfig
  tag: string
  badgeUrl: string | null
  guildId: string | null
  anchor: DOMRect
}>()

const NEXT_TIME = 'Maybe next time :)'
const GO_TEXT = 'Go to Server'

const box = ref<HTMLElement | null>(null)
const place = ref<PopoverPlace | null>(null)

onMounted(() => {
  const el = box.value
  if (el) place.value = placeOver(props.anchor, el.offsetWidth, el.offsetHeight, 10)
})

// Дата основания зашита в ID сервера (snowflake): старшие биты — миллисекунды от 2015-01-01
const founded = computed(() => {
  if (!props.guildId) return null
  const ms = Number(BigInt(props.guildId) >> 22n) + 1_420_070_400_000
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(ms)
})

const numberFormat = new Intl.NumberFormat('en-US')

const nextTime = ref(false)
let timer: number | undefined

const onGo = (): void => {
  nextTime.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => (nextTime.value = false), 2400)
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <Teleport to="body">
    <div
      ref="box"
      class="guild-card"
      :class="{ 'is-placed': place, 'is-below': place?.below }"
      :style="place ? { left: `${place.left}px`, top: `${place.top}px`, '--origin-x': `${place.arrow}px` } : undefined"
      role="dialog"
      :aria-label="guild.name"
    >
      <div class="gc-banner" :style="{ background: `linear-gradient(170deg, ${guild.banner[0]} 25%, ${guild.banner[1]})` }" />
      <img class="gc-icon" :src="guild.iconUrl" alt="" />

      <div class="gc-body">
        <h3 class="gc-name">
          <span>{{ guild.name }}</span>
          <span class="gc-tag">
            <img v-if="badgeUrl" :src="badgeUrl" alt="" />
            {{ tag }}
          </span>
        </h3>
        <p class="gc-counts">
          <span><i class="gc-dot is-online" />{{ numberFormat.format(guild.online) }} Online</span>
          <span><i class="gc-dot" />{{ numberFormat.format(guild.members) }} Members</span>
        </p>
        <p v-if="founded" class="gc-founded">Established {{ founded }}</p>

        <button type="button" class="gc-go" :class="{ 'is-next': nextTime }" @click="onGo">
          <span class="gc-go-sizer" aria-hidden="true">{{ NEXT_TIME }}</span>
          <Transition name="gc-swap">
            <span :key="String(nextTime)" class="gc-go-label">{{ nextTime ? NEXT_TIME : GO_TEXT }}</span>
          </Transition>
        </button>
        <span class="sr-only" aria-live="polite">{{ nextTime ? NEXT_TIME : '' }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Цвета и размеры сняты со скриншота карточки сервера в Discord */
.guild-card {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  visibility: hidden;
  width: 300px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #e2e2e4;
  background: #fff;
  color: #28282d;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  font-family: 'gg sans', 'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  transform-origin: var(--origin-x, 50%) 100%;
}

.guild-card.is-below {
  transform-origin: var(--origin-x, 50%) 0;
}

.guild-card.is-placed {
  visibility: visible;
  animation: gc-in 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.gc-banner {
  height: 120px;
}

/* Иконка сервера наезжает на баннер, вокруг — белая рамка цвета карточки */
.gc-icon {
  display: block;
  width: 72px;
  height: 72px;
  margin: -40px 0 0 16px;
  border: 4px solid #fff;
  border-radius: 22px;
  background: #fff;
  object-fit: cover;
}

.gc-body {
  padding: 10px 16px 16px;
}

.gc-name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 22px;
}

.gc-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 6px;
  background: #ebebed;
  font-size: 13px;
  font-weight: 700;
}

.gc-tag img {
  width: 14px;
  height: 14px;
}

.gc-counts,
.gc-founded {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 18px;
  color: #595a62;
}

.gc-counts {
  display: flex;
  gap: 12px;
}

.gc-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 5px;
  border-radius: 9999px;
  background: #80848e;
}

.gc-dot.is-online {
  background: #23a55a;
}

.gc-founded {
  margin-top: 4px;
}

/* Кнопка: надписи лежат в одной клетке сетки и сменяют друг друга, ширину держит невидимая подложка */
.gc-go {
  display: grid;
  place-items: center;
  overflow: hidden;
  width: 100%;
  height: 38px;
  margin-top: 16px;
  border: 0;
  border-radius: 8px;
  background: #3a834c;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.25s ease,
    transform 0.15s ease;
}

.gc-go > * {
  grid-area: 1 / 1;
  white-space: nowrap;
}

.gc-go-sizer {
  visibility: hidden;
}

@media (hover: hover) {
  .gc-go:not(.is-next):hover {
    background: #317241;
  }
}

.gc-go:active {
  transform: scale(0.97);
}

.gc-go:focus-visible {
  outline: 2px solid #3a834c;
  outline-offset: 2px;
}

/* «В следующий раз»: кнопка сереет и коротко качается, как «нет» */
.gc-go.is-next {
  background: #6d6f78;
  animation: gc-nope 0.4s ease;
}

.gc-swap-enter-active,
.gc-swap-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.gc-swap-enter-from {
  transform: translateY(110%);
  opacity: 0;
}

.gc-swap-leave-to {
  transform: translateY(-110%);
  opacity: 0;
}

@keyframes gc-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.95);
  }
}

@keyframes gc-nope {
  20% {
    transform: translateX(-5px);
  }
  45% {
    transform: translateX(4px);
  }
  70% {
    transform: translateX(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .guild-card.is-placed,
  .gc-go.is-next {
    animation: none;
  }

  .gc-swap-enter-active,
  .gc-swap-leave-active {
    transition: opacity 0.15s ease;
  }

  .gc-swap-enter-from,
  .gc-swap-leave-to {
    transform: none;
  }
}
</style>

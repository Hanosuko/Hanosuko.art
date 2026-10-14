<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { AlertCircle, ExternalLink, RotateCw } from 'lucide-vue-next'
import { Check, Copy } from 'lucide'
import { MorphIcon } from 'morphicons/vue'
import { profile } from '@/config/profile'
import { useMyTiers } from '@/composables/useMyTiers'
import { useCistiers } from '@/composables/useCistiers'
import type { KitTier, TierSource, TierSourceState, UnrankedKit } from '@/types/tiers'
import TierTooltip from '@/components/TierTooltip.vue'
import mytiersLogo from '@/assets/tiers/mytiers-logo.svg'
import cistiersLogo from '@/assets/tiers/cistiers-logo.png'

// 👇 Ники, сайты и цвета китов — в src/config/profile.ts → mytiers и cistiers
const { mytiers, cistiers } = profile

interface TierTab extends TierSourceState {
  id: TierSource
  label: string
  iconUrl: string
}

const tabs: TierTab[] = [
  {
    id: 'mytiers',
    label: 'MyTiers',
    iconUrl: mytiersLogo,
    ...useMyTiers(mytiers),
  },
]
if (cistiers) {
  tabs.push({ id: 'cistiers', label: 'CISTiers', iconUrl: cistiersLogo, ...useCistiers(cistiers) })
}

const activeId = ref<TierSource>(tabs[0].id)
const active = computed(() => tabs.find((tab) => tab.id === activeId.value) ?? tabs[0])

// Шаблон разворачивает только ref верхнего уровня — поэтому отдельные computed
const tierProfile = computed(() => active.value.profile.value)
const isLoading = computed(() => active.value.isLoading.value)
const error = computed(() => active.value.error.value)

// Вкладка грузится при первом открытии
watch(
  active,
  (tab) => {
    if (!tab.profile.value && !tab.isLoading.value) void tab.load()
  },
  { immediate: true },
)

const selectTab = (id: TierSource): void => {
  activeId.value = id
}

// Стрелки влево/вправо переключают вкладки, как в обычном tablist
const onTabsKeydown = (event: KeyboardEvent): void => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  const index = tabs.findIndex((tab) => tab.id === activeId.value)
  const step = event.key === 'ArrowRight' ? 1 : -1
  const next = tabs[(index + step + tabs.length) % tabs.length]
  selectTab(next.id)
  ;(event.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus()
}

const SKELETON_SLOTS = 10

// --- Подсказка при наведении на тир (только для мыши: на тач-экранах плитка — просто ссылка) ---
const canHover = window.matchMedia('(hover: hover)').matches
const tip = ref<{ kit: KitTier | UnrankedKit; x: number; y: number } | null>(null)

const hideTip = (): void => {
  tip.value = null
}

// MyTiers — над центром плитки, CISTiers — на 45px ниже курсора (или под плиткой при фокусе с клавиатуры)
const showTipAt = (kit: KitTier | UnrankedKit, target: Element, pointer?: MouseEvent): void => {
  if (!canHover && pointer) return
  const rect = target.getBoundingClientRect()
  if (activeId.value === 'mytiers') {
    tip.value = { kit, x: rect.left + rect.width / 2, y: rect.top - 12 }
  } else if (pointer) {
    tip.value = { kit, x: pointer.clientX, y: pointer.clientY + 45 }
  } else {
    tip.value = { kit, x: rect.left + rect.width / 2, y: rect.bottom + 8 }
  }
}

const onTileMouse = (kit: KitTier | UnrankedKit, event: MouseEvent): void => {
  showTipAt(kit, event.currentTarget as Element, event)
}

const onTileFocus = (kit: KitTier | UnrankedKit, event: FocusEvent): void => {
  showTipAt(kit, event.currentTarget as Element)
}

// Подсказка привязана к экрану (position: fixed) — при прокрутке и смене вкладки прячем
watch(activeId, hideTip)
window.addEventListener('scroll', hideTip, { capture: true, passive: true })
onBeforeUnmount(() => window.removeEventListener('scroll', hideTip, { capture: true }))

const nickname = computed(() => tierProfile.value?.nickname ?? mytiers.username)
// Рендер скина по нику — один и тот же для обеих вкладок
const skinUrl = new URL(`/api/avatar/${encodeURIComponent(mytiers.username)}?s=256`, mytiers.siteUrl).href
const nameMcUrl = computed(() => `https://namemc.com/profile/${encodeURIComponent(nickname.value)}`)

const score = computed(() => tierProfile.value?.points ?? 0)
const pointsWord = computed(() => (score.value === 1 ? 'point' : 'points'))

const copied = ref(false)
let copiedTimer: number | undefined

const copyNickname = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(nickname.value)
    copied.value = true
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => (copied.value = false), 1200)
  } catch {
    copied.value = false
  }
}

const hideBrokenImage = (event: Event): void => {
  ;(event.target as HTMLImageElement).style.visibility = 'hidden'
}
</script>

<template>
  <section class="mytiers glass-card" aria-label="Minecraft tiers">
    <div class="mt-banner" aria-hidden="true">
      <img class="mt-banner-img" :src="skinUrl" alt="" @error="hideBrokenImage" />
    </div>

    <div class="mt-tabs" role="tablist" aria-label="Tier list" @keydown="onTabsKeydown">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="mt-tab"
        :class="{ 'is-active': tab.id === activeId }"
        :data-tab="tab.id"
        :aria-selected="tab.id === activeId"
        :tabindex="tab.id === activeId ? 0 : -1"
        aria-controls="mt-tabpanel"
        @click="selectTab(tab.id)"
      >
        <img class="mt-tab-icon" :src="tab.iconUrl" alt="" @error="hideBrokenImage" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="mt-avatar-wrap">
      <img class="mt-avatar" :src="skinUrl" :alt="nickname" decoding="async" @error="hideBrokenImage" />
    </div>

    <div id="mt-tabpanel" class="mt-panel" role="tabpanel" :aria-label="active.label">
      <div class="mt-head">
        <h2 class="mt-name">{{ nickname }}</h2>
        <div v-if="tierProfile" class="mt-stats">
          <span><b>#{{ tierProfile.rank ?? '—' }}</b> overall</span>
          <span><b>{{ score }}</b> {{ pointsWord }}</span>
        </div>
      </div>

      <div class="mt-divider" />

      <div v-if="error && !tierProfile" class="mt-state">
        <AlertCircle :size="16" aria-hidden="true" />
        <span>{{ active.label }} is unavailable</span>
        <button type="button" class="mt-retry" @click="active.load">
          <RotateCw :size="14" aria-hidden="true" />
          retry
        </button>
      </div>

      <ul v-else class="mt-grid">
        <template v-if="isLoading || !tierProfile">
          <li v-for="n in SKELETON_SLOTS" :key="`skeleton-${n}`" class="mt-slot is-skeleton" />
        </template>

        <template v-else>
          <li
            v-for="(kit, index) in tierProfile.ranked"
            :key="`${activeId}-${kit.slug}`"
            class="mt-cell"
            :style="{ '--kit': kit.color, '--delay': `${index * 40}ms` }"
            @mouseenter="onTileMouse(kit, $event)"
            @mousemove="activeId === 'cistiers' && onTileMouse(kit, $event)"
            @mouseleave="hideTip"
            @focusin="onTileFocus(kit, $event)"
            @focusout="hideTip"
          >
            <component
              :is="kit.discordUrl ? 'a' : 'span'"
              class="mt-tile"
              :href="kit.discordUrl ?? undefined"
              :target="kit.discordUrl ? '_blank' : undefined"
              :rel="kit.discordUrl ? 'noopener noreferrer' : undefined"
              :aria-label="`${kit.name}: ${kit.retired ? 'retired ' : ''}${kit.pos}${kit.tier}`"
            >
              <img class="mt-kit-icon" :src="kit.iconUrl" alt="" draggable="false" @error="hideBrokenImage" />
              <strong class="mt-tier">
                <span v-if="kit.retired" class="mt-retired">R</span>{{ kit.pos }}{{ kit.tier }}
              </strong>
            </component>
          </li>

          <li
            v-for="(kit, index) in tierProfile.unranked"
            :key="`${activeId}-${kit.slug}`"
            class="mt-cell"
            :style="{ '--delay': `${(tierProfile.ranked.length + index) * 40}ms` }"
            @mouseenter="onTileMouse(kit, $event)"
            @mousemove="activeId === 'cistiers' && onTileMouse(kit, $event)"
            @mouseleave="hideTip"
          >
            <span class="mt-slot" :aria-label="`${kit.name}: not tested`">
              <img class="mt-kit-icon is-muted" :src="kit.iconUrl" alt="" draggable="false" @error="hideBrokenImage" />
            </span>
          </li>
        </template>
      </ul>

      <TierTooltip v-if="tip" :variant="activeId" :kit="tip.kit" :x="tip.x" :y="tip.y" />

      <div class="mt-actions">
        <button
          type="button"
          class="mt-action is-square"
          :class="{ 'is-done': copied }"
          :aria-label="copied ? 'Copied' : 'Copy nickname'"
          :title="copied ? 'Copied' : 'Copy nickname'"
          @click="copyNickname"
        >
          <MorphIcon :icon="copied ? Check : Copy" :size="16" spring="bouncy" reduced-motion="user" />
        </button>
        <a
          class="mt-action is-square mt-namemc"
          :href="nameMcUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open on NameMC"
          title="NameMC"
        >n</a>
        <a class="mt-action is-wide" :href="active.profileUrl" target="_blank" rel="noopener noreferrer">
          <ExternalLink :size="16" aria-hidden="true" />
          <span>Open on {{ active.label }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mytiers {
  /* Цвет карточки под стеклом — им же закрашено кольцо вокруг скина, как «вырез» */
  --mt-card: #1a1a1a;
  --mt-tile: #18181b;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  isolation: isolate;
}

/* Баннер: размытый рендер скина, как на mytiers.ru */
.mt-banner {
  position: absolute;
  inset: 0 0 auto;
  height: 9rem;
  overflow: hidden;
  z-index: -1;
  -webkit-mask-image: linear-gradient(to bottom, #000 20%, transparent);
  mask-image: linear-gradient(to bottom, #000 20%, transparent);
}

.mt-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
  filter: blur(8px);
  transform: scale(1.8);
}

/* Переключатель MyTiers / CISTiers в правом верхнем углу */
.mt-tabs {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.25rem;
  border-radius: 9999px;
  background: rgba(10, 10, 12, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.mt-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2rem;
  padding: 0 0.85rem;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.mt-tab.is-active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.mt-tab:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 1px;
}

@media (hover: hover) {
  .mt-tab:not(.is-active):hover {
    color: var(--color-text);
  }
}

.mt-tab-icon {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}

.mt-tab:not(.is-active) .mt-tab-icon {
  opacity: 0.6;
}

.mt-avatar-wrap {
  width: 6.5rem;
  height: 6.5rem;
  margin: 4.5rem 0 0 1.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mt-card);
  flex-shrink: 0;
}

/* Рендер скина обрезается кругом, как на mytiers.ru */
.mt-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 9999px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.04);
}

.mt-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0.75rem;
  padding: 1.1rem 1.1rem 1.25rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.025);
}

.mt-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.25rem 1rem;
}

.mt-name {
  margin: 0;
  min-width: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mt-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.mt-stats b {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.mt-divider {
  height: 1px;
  margin: 0.9rem 0 1rem;
  background: rgba(255, 255, 255, 0.07);
}

/* Если соседняя плитка выше, лишнее место делится поровну над и под сеткой,
   а не остаётся пустой полосой над кнопками */
.mt-grid {
  list-style: none;
  margin: auto 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.6rem;
}

.mt-cell {
  position: relative;
  animation: mt-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0ms);
}

.mt-tile,
.mt-slot {
  position: relative;
  display: block;
  aspect-ratio: 3 / 4;
  width: 100%;
  overflow: hidden;
  border-radius: 1rem;
}

/* Подсветка плитки цветом кита — та же формула, что на mytiers.ru */
.mt-tile {
  border: 1px solid transparent;
  background:
    linear-gradient(
        to top right,
        color-mix(in srgb, var(--kit) 22%, transparent),
        color-mix(in srgb, var(--kit) 5%, transparent) 55%,
        transparent
      )
      padding-box,
    linear-gradient(var(--mt-tile), var(--mt-tile)) padding-box,
    linear-gradient(
        to bottom,
        color-mix(in srgb, var(--kit) 40%, transparent),
        color-mix(in srgb, var(--kit) 10%, transparent)
      )
      border-box;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.mt-slot {
  border: 2px dashed rgba(255, 255, 255, 0.07);
}

.mt-slot.is-skeleton {
  animation: mt-pulse 1.4s ease-in-out infinite;
}

.mt-kit-icon {
  position: absolute;
  top: -20%;
  right: -22%;
  width: 100%;
  transform: rotate(18deg);
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

.mt-kit-icon.is-muted {
  opacity: 0.12;
  filter: grayscale(1);
}

.mt-tier {
  position: absolute;
  inset: auto 0 9%;
  text-align: center;
  font-size: clamp(0.95rem, 3.6cqi, 1.5rem);
  font-weight: 700;
  line-height: 1;
  color: color-mix(in srgb, var(--kit) 78%, #fff);
  font-variant-numeric: tabular-nums;
}

.mt-retired {
  opacity: 0.6;
}



@media (hover: hover) {
  .mt-cell:hover .mt-tile {
    transform: translateY(-4px);
    box-shadow: 0 8px 22px color-mix(in srgb, var(--kit) 25%, transparent);
  }
}

.mt-tile:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--kit) 70%, #fff);
  outline-offset: 2px;
}

.mt-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: auto 0;
  padding: 1.5rem 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.mt-retry {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
  padding: 0.35rem 0.7rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text);
  font-size: 0.8rem;
  cursor: pointer;
}

.mt-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
}

.mt-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.75rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.mt-action:hover,
.mt-action:focus-visible {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.12);
  outline: none;
}

.mt-action.is-square {
  width: 2.75rem;
  flex-shrink: 0;
}

.mt-action.is-wide {
  flex: 1;
}

.mt-action.is-done {
  color: #34d399;
}

.mt-namemc {
  font-family: 'Minecraftia', 'Monocraft', monospace;
  font-size: 1.15rem;
  line-height: 1;
  padding-top: 0.45rem;
}

@keyframes mt-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes mt-pulse {
  50% {
    opacity: 0.45;
  }
}

/* Узкая плитка (телефон, планшет) */
@container (max-width: 26rem) {
  .mt-banner {
    height: 7.5rem;
  }

  .mt-tabs {
    top: 0.75rem;
    right: 0.75rem;
  }

  .mt-tab {
    height: 1.85rem;
    padding: 0 0.65rem;
    font-size: 0.7rem;
  }

  .mt-avatar-wrap {
    width: 5.5rem;
    height: 5.5rem;
    margin: 3.5rem 0 0 1rem;
  }

  .mt-avatar {
    width: 5rem;
    height: 5rem;
  }

  .mt-panel {
    margin: 0.5rem;
    padding: 0.9rem 0.75rem 1rem;
  }

  .mt-name {
    font-size: 1.4rem;
  }

  .mt-stats {
    font-size: 0.75rem;
  }

  .mt-grid {
    gap: 0.4rem;
  }

  .mt-tile,
  .mt-slot {
    border-radius: 0.75rem;
  }

  .mt-action {
    height: 2.75rem;
    font-size: 0.75rem;
  }
}
</style>

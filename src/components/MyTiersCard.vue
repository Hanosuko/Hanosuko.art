<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AlertCircle, Check, Copy, ExternalLink, RotateCw } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import { useMyTiers } from '@/composables/useMyTiers'

// 👇 Ник, сайт и цвета китов — в src/config/profile.ts → mytiers
const settings = profile.mytiers

const { player, kits, isLoading, error, fetchProfile, avatarUrl, profileUrl } = useMyTiers(
  settings.siteUrl,
  settings.username,
  settings.kitColors,
)

const SKELETON_SLOTS = 10

const nickname = computed(() => player.value?.nickname ?? settings.username)
const brandLabel = computed(() => new URL(settings.siteUrl).host.toUpperCase())
const brandIconUrl = computed(() => new URL('/tier_icons/overall.svg', settings.siteUrl).href)
const nameMcUrl = computed(() => `https://namemc.com/profile/${encodeURIComponent(nickname.value)}`)

const score = computed(() => player.value?.overallScore ?? 0)
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

onMounted(() => {
  void fetchProfile()
})
</script>

<template>
  <section class="mytiers glass-card" aria-label="MyTiers profile">
    <div class="mt-banner" aria-hidden="true">
      <img class="mt-banner-img" :src="avatarUrl" alt="" @error="hideBrokenImage" />
    </div>

    <a
      class="mt-brand"
      :href="profileUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Open ${nickname} on ${brandLabel}`"
    >
      <img class="mt-brand-icon" :src="brandIconUrl" alt="" @error="hideBrokenImage" />
      <span>{{ brandLabel }}</span>
    </a>

    <div class="mt-avatar-wrap">
      <img class="mt-avatar" :src="avatarUrl" :alt="nickname" decoding="async" @error="hideBrokenImage" />
    </div>

    <div class="mt-panel">
      <div class="mt-head">
        <h2 class="mt-name">{{ nickname }}</h2>
        <div v-if="player" class="mt-stats">
          <span><b>#{{ player.rank > 0 ? player.rank : '—' }}</b> overall</span>
          <span><b>{{ score }}</b> {{ pointsWord }}</span>
        </div>
      </div>

      <div class="mt-divider" />

      <div v-if="error && !player" class="mt-state">
        <AlertCircle :size="16" aria-hidden="true" />
        <span>MyTiers is unavailable</span>
        <button type="button" class="mt-retry" @click="fetchProfile">
          <RotateCw :size="14" aria-hidden="true" />
          retry
        </button>
      </div>

      <ul v-else class="mt-grid">
        <template v-if="isLoading || !player">
          <li v-for="n in SKELETON_SLOTS" :key="`skeleton-${n}`" class="mt-slot is-skeleton" />
        </template>

        <template v-else>
          <li
            v-for="(kit, index) in kits.ranked"
            :key="kit.slug"
            class="mt-cell"
            :style="{ '--kit': kit.color, '--delay': `${index * 40}ms` }"
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
            <span class="mt-tip" aria-hidden="true">
              <b>{{ kit.name }}</b>
              <span v-if="kit.peak && kit.peak !== `${kit.pos}${kit.tier}`">peak {{ kit.peak }}</span>
              <span v-if="kit.retired">retired</span>
            </span>
          </li>

          <li
            v-for="(kit, index) in kits.unranked"
            :key="kit.slug"
            class="mt-cell"
            :style="{ '--delay': `${(kits.ranked.length + index) * 40}ms` }"
          >
            <span class="mt-slot" :aria-label="`${kit.name}: not tested`">
              <img class="mt-kit-icon is-muted" :src="kit.iconUrl" alt="" draggable="false" @error="hideBrokenImage" />
            </span>
            <span class="mt-tip" aria-hidden="true"><b>{{ kit.name }}</b><span>not tested</span></span>
          </li>
        </template>
      </ul>

      <div class="mt-actions">
        <button
          type="button"
          class="mt-action is-square"
          :class="{ 'is-done': copied }"
          :aria-label="copied ? 'Copied' : 'Copy nickname'"
          :title="copied ? 'Copied' : 'Copy nickname'"
          @click="copyNickname"
        >
          <Check v-if="copied" :size="16" aria-hidden="true" />
          <Copy v-else :size="16" aria-hidden="true" />
        </button>
        <a
          class="mt-action is-square mt-namemc"
          :href="nameMcUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open on NameMC"
          title="NameMC"
        >n</a>
        <a class="mt-action is-wide" :href="profileUrl" target="_blank" rel="noopener noreferrer">
          <ExternalLink :size="16" aria-hidden="true" />
          <span>Open on MyTiers</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mytiers {
  --mt-card: #141416;
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

.mt-brand {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  height: 2.5rem;
  padding: 0 1.1rem;
  border-radius: 9999px;
  background: rgba(10, 10, 12, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.mt-brand:hover,
.mt-brand:focus-visible {
  border-color: #ffe453;
  box-shadow: 0 0 18px rgba(255, 228, 83, 0.25);
  outline: none;
}

.mt-brand-icon {
  width: 1.1rem;
  height: 1.1rem;
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

.mt-avatar {
  width: 6rem;
  height: 6rem;
  object-fit: contain;
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

.mt-grid {
  list-style: none;
  margin: 0;
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

.mt-tip {
  position: absolute;
  bottom: calc(100% + 0.4rem);
  left: 50%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.75rem;
  border-radius: 0.6rem;
  background: #111113;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 4px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.mt-tip b {
  color: var(--color-text);
  font-size: 0.8rem;
}

.mt-cell:hover .mt-tip,
.mt-cell:focus-within .mt-tip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.mt-cell:hover .mt-tile,
.mt-tile:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--kit) 25%, transparent);
  outline: none;
}

.mt-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  margin-top: auto;
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
</style>

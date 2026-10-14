<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { KitTier, TierSource, UnrankedKit } from '@/types/tiers'
import { isRanked, parseTier, tierPoints } from '@/utils/tiers'

// Подсказка над плиткой тира, в стиле сайта-источника:
// mytiers — над плиткой со стрелкой: «High Tier 3», очки, Peak, если пик выше;
// cistiers — за курсором: иконка кита, название, очки.
const props = defineProps<{
  variant: TierSource
  kit: KitTier | UnrankedKit
  x: number
  y: number
}>()

const pointsText = (points: number): string => `${points} ${points === 1 ? 'point' : 'points'}`
const tierName = (pos: string, tier: number): string => `${pos === 'HT' ? 'High' : 'Low'} Tier ${tier}`

const ranked = computed(() => (isRanked(props.kit) ? props.kit : null))

// Как на MyTiers: если пик выше текущего тира, заголовок — пиковый тир с пометкой Peak
const peak = computed(() => {
  const kit = ranked.value
  const parsed = kit ? parseTier(kit.peak) : null
  return kit && parsed && tierPoints(parsed) > kit.points ? parsed : null
})

const title = computed(() => {
  const kit = ranked.value
  if (!kit) return '—'
  return peak.value ? tierName(peak.value.pos, peak.value.tier) : tierName(kit.pos, kit.tier)
})

const sub = computed(() => {
  const kit = ranked.value
  if (!kit) return `${props.kit.name} · no tier`
  return kit.retired ? `Retired · ${pointsText(kit.points)}` : pointsText(kit.points)
})

// Не даём подсказке вылезти за край экрана; стрелка при этом остаётся над плиткой
const box = ref<HTMLElement | null>(null)
const shiftX = ref(0)

watch(
  () => [props.x, props.y, props.kit],
  async () => {
    shiftX.value = 0
    await nextTick()
    const rect = box.value?.getBoundingClientRect()
    if (!rect) return
    const margin = 8
    if (rect.left < margin) shiftX.value = margin - rect.left
    else if (rect.right > window.innerWidth - margin) shiftX.value = window.innerWidth - margin - rect.right
  },
  { immediate: true },
)
</script>

<template>
  <Teleport to="body">
    <div
      ref="box"
      class="tier-tip"
      :class="`is-${variant}`"
      :style="{ left: `${x + shiftX}px`, top: `${y}px`, '--arrow-shift': `${-shiftX}px` }"
      role="tooltip"
    >
      <template v-if="variant === 'mytiers'">
        <span v-if="peak" class="tip-peak">Peak</span>
        <span class="tip-title">{{ title }}</span>
        <span class="tip-sub">{{ sub }}</span>
      </template>
      <template v-else>
        <img class="tip-icon" :src="kit.iconUrl" alt="" />
        <span class="tip-name">{{ kit.name }}</span>
        <span class="tip-points">{{ ranked ? pointsText(ranked.points) : 'no tier' }}</span>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.tier-tip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
}

/* MyTiers: тёмно-синяя плашка над плиткой со стрелкой вниз, шрифт Geist */
.tier-tip.is-mytiers {
  font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 11px 16px;
  border-radius: 12px;
  background: #12131f;
  border: 1px solid #1a1b2a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  text-align: center;
  transform: translate(-50%, -100%);
  animation: tip-mytiers-in 120ms ease forwards;
}

.tier-tip.is-mytiers::after {
  content: '';
  position: absolute;
  top: 100%;
  left: calc(50% + var(--arrow-shift, 0px));
  width: 10px;
  height: 10px;
  background: #12131f;
  border-right: 1px solid #1a1b2a;
  border-bottom: 1px solid #1a1b2a;
  border-bottom-right-radius: 2px;
  transform: translate(-50%, -50%) rotate(45deg);
}

.tip-peak {
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #a8b4d4;
}

.tip-title {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.tip-sub {
  font-size: 13px;
  font-weight: 500;
  color: #8b92b8;
}

/* CISTiers: плашка в строку, едет за курсором, шрифт Open Sans */
.tier-tip.is-cistiers {
  font-family: 'Open Sans', ui-sans-serif, system-ui, sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #1a1a1a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translateX(-50%);
  animation: tip-fade-in 120ms ease forwards;
}

.tip-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.tip-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.tip-points {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes tip-mytiers-in {
  from {
    opacity: 0;
    transform: translate(-50%, calc(6px - 100%)) scale(0.95);
  }
}

@keyframes tip-fade-in {
  from {
    opacity: 0;
  }
}
</style>

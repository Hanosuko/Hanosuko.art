<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { DiscordBadgeConfig } from '@/types/profile'
import { placeOver, type PopoverPlace } from '@/utils/popover'

// Подсказка значка как в Discord. Висит поверх всей страницы (Teleport в body), поэтому не обрезается
// карточкой; стоит над значком со стрелкой на него. У края экрана сдвигается внутрь, а стрелка остаётся
// над значком; если сверху не хватает места — открывается под значком.
const props = defineProps<{ badge: DiscordBadgeConfig; anchor: DOMRect }>()

const box = ref<HTMLElement | null>(null)
const place = ref<PopoverPlace | null>(null)

const card = computed(() => (props.badge.tooltip?.kind === 'card' ? props.badge.tooltip : null))
const detail = computed(() => (props.badge.tooltip?.kind === 'detail' ? props.badge.tooltip : null))
const variant = computed(() => {
  if (card.value) return ['is-card', `is-${card.value.theme}`]
  return detail.value ? ['is-detail'] : ['is-plain']
})

// Размер считается до показа: подсказка сначала невидима в углу экрана, потом встаёт на место
onMounted(() => {
  const el = box.value
  if (el) place.value = placeOver(props.anchor, el.offsetWidth, el.offsetHeight)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="box"
      class="badge-tip"
      :class="[...variant, { 'is-placed': place, 'is-below': place?.below }]"
      :style="place ? { left: `${place.left}px`, top: `${place.top}px`, '--arrow-x': `${place.arrow}px` } : undefined"
      role="tooltip"
    >
      <template v-if="card">
        <img class="bt-art" :src="card.imageUrl" alt="" />
        <span v-if="card.eyebrow" class="bt-eyebrow">{{ card.eyebrow }}</span>
        <strong class="bt-title">
          {{ card.title }}<span v-if="card.theme === 'nitro'" class="bt-nitro"> Nitro</span>
        </strong>
        <span v-if="card.text" class="bt-text">{{ card.text }}</span>
      </template>

      <template v-else-if="detail">
        <img class="bt-icon" :src="badge.iconUrl" alt="" />
        <span class="bt-lines">
          <strong class="bt-title">{{ detail.title }}</strong>
          <span class="bt-text">{{ detail.text }}</span>
        </span>
      </template>

      <template v-else>{{ badge.label }}</template>
    </div>
  </Teleport>
</template>

<style scoped>
/* Цвета и размеры сняты со скриншотов Discord */
.badge-tip {
  --tip-bg: #0a0a0b;
  --tip-border: #26262a;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  visibility: hidden;
  pointer-events: none;
  border: 1px solid var(--tip-border);
  border-radius: 8px;
  background: var(--tip-bg);
  color: #dfe0e2;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  font-family: 'gg sans', 'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  transform-origin: var(--arrow-x, 50%) 100%;
}

.badge-tip.is-placed {
  visibility: visible;
  animation: badge-tip-in 0.14s ease-out;
}

.badge-tip.is-below {
  transform-origin: var(--arrow-x, 50%) 0;
}

/* Стрелка — повёрнутый квадрат цвета подсказки, наполовину спрятанный под ней */
.badge-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: var(--arrow-x, 50%);
  width: 9px;
  height: 9px;
  border-right: 1px solid var(--tip-border);
  border-bottom: 1px solid var(--tip-border);
  border-bottom-right-radius: 2px;
  background: var(--tip-bg);
  transform: translate(-50%, -50%) rotate(45deg);
}

.badge-tip.is-below::after {
  top: auto;
  bottom: 100%;
  border: 0;
  border-top: 1px solid var(--tip-border);
  border-left: 1px solid var(--tip-border);
  border-radius: 2px 0 0;
  transform: translate(-50%, 50%) rotate(45deg);
}

/* Обычная подсказка: текст по центру, длинный переносится */
.badge-tip.is-plain {
  max-width: 200px;
  padding: 9px 12px;
  text-align: center;
  overflow-wrap: anywhere;
}

/* С иконкой слева: заголовок и строка под ним */
.badge-tip.is-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 280px;
  padding: 8px 14px 8px 8px;
}

.bt-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  object-fit: contain;
}

.bt-lines {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.is-detail .bt-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: #f2f3f5;
}

.is-detail .bt-text {
  color: #96979e;
}

/* Карточка: большая картинка, надпись, крупный заголовок, строка под ним */
.badge-tip.is-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 236px;
  padding: 18px 20px 20px;
  border-radius: 12px;
  text-align: center;
}

.bt-art {
  width: 72px;
  height: 72px;
  margin-bottom: 12px;
  object-fit: contain;
}

.bt-eyebrow {
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
}

.is-card .bt-title {
  font-size: 23px;
  font-weight: 800;
  line-height: 28px;
}

.is-card .bt-text {
  margin-top: 4px;
}

/* Светлая карточка (Orbs) */
.badge-tip.is-light,
.badge-tip.is-nitro {
  --tip-bg: #fff;
  --tip-border: #e2e2e4;
  color: #28282d;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.is-light .bt-eyebrow {
  color: #6d6f78;
}

/* Nitro: светлая карточка с золотым отливом сверху, заголовок жирным курсивом, как логотип NITRO */
.badge-tip.is-nitro {
  background: linear-gradient(#f9e9c8, #fff 58%);
}

.is-nitro .bt-art {
  width: 88px;
  height: 88px;
}

.is-nitro .bt-title {
  font-size: 21px;
  font-style: italic;
  font-weight: 900;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: #121214;
}

.is-nitro .bt-text {
  color: #5c5e66;
}

/* Тёмная карточка (подарки) */
.badge-tip.is-dark {
  width: 200px;
}

.is-dark .bt-art {
  width: 64px;
  height: 64px;
}

.is-dark .bt-eyebrow {
  font-size: 13px;
  font-weight: 500;
  color: #96979e;
}

.is-dark .bt-title {
  font-size: 16px;
  line-height: 22px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #f2f3f5;
}

@keyframes badge-tip-in {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
  }
}

.badge-tip.is-below.is-placed {
  animation-name: badge-tip-in-below;
}

@keyframes badge-tip-in-below {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }
}

@media (prefers-reduced-motion: reduce) {
  .badge-tip.is-placed {
    animation: none;
  }
}
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { profile } from '@/config/profile'
import { useServerStatus } from '@/composables/useServerStatus'
import { drawMinecraftText, minecraftTextWidth } from '@/utils/minecraftText'

// 👇 Адрес сервера и картинки строки — в src/config/profile.ts → server
const server = profile.server
const motd = server.motd

// Строка списка серверов в игре — 305×36 пикселей интерфейса, картинки сняты при интерфейсе ×2.
// Все координаты ниже — в пикселях картинки
const WIDTH = 610
const HEIGHT = 72
const GUI_WIDTH = 305
// Значок пинга: левый край первой полоски, правый край последней, верх
const PING_LEFT = 576
const PING_RIGHT = 594
const PING_TOP = 6
// Онлайн стоит на одной высоте со значком и заканчивается за 13 пикселей до него — как в игре
const COUNT_GAP = 13
// Подсказка. В игре она висит правее и выше курсора: рамка — в 16 и 32 пикселях от него
const TIP_WIDTH = 166
const TIP_HEIGHT = 58
const TIP_OFFSET_X = 16
const TIP_OFFSET_Y = 32
const VIEWPORT_MARGIN = 4

const { status } = useServerStatus(server.address)

const players = computed(() => (status.value?.online ? (status.value.players ?? null) : null))
// Пока сервер не ответил или выключен — онлайна нет, как в игре
const count = computed(() => (players.value ? `${players.value.online}/${players.value.max}` : null))
const countLeft = computed(() =>
  count.value ? PING_LEFT - COUNT_GAP - minecraftTextWidth(count.value) + 1 : PING_LEFT,
)

const label = computed(() =>
  players.value
    ? `${server.address}, ${players.value.online} of ${players.value.max} players online`
    : server.address,
)
const tipId = useId()

// --- Масштаб: пиксель интерфейса игры — целое число пикселей экрана, иначе пиксели выходят разной толщины ---
const frame = ref<HTMLElement | null>(null)
// CSS-пикселей в одном пикселе картинки
const unit = ref(1)

const fit = (): void => {
  const box = frame.value
  if (!box) return
  const ratio = window.devicePixelRatio || 1
  const available = box.clientWidth
  const devicePerGui = Math.floor((available * ratio) / GUI_WIDTH)
  // Плитка уже строки — тогда просто по ширине
  unit.value = devicePerGui >= 1 ? devicePerGui / ratio / 2 : available / WIDTH
}

const px = (value: number): string => `${value * unit.value}px`

// --- Картинки и отрисовка ---
const canvas = ref<HTMLCanvasElement | null>(null)
const images = shallowRef<{ normal: HTMLImageElement; selected: HTMLImageElement } | null>(null)
const failed = ref(false)
const selected = ref(false)

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

const draw = (): void => {
  const context = canvas.value?.getContext('2d')
  const loaded = images.value
  if (!context || !loaded) return
  context.clearRect(0, 0, WIDTH, HEIGHT)
  context.drawImage(selected.value ? loaded.selected : loaded.normal, 0, 0)
  if (count.value) drawMinecraftText(context, count.value, countLeft.value, PING_TOP)
}

watch([images, selected, count], draw, { flush: 'post' })

// --- Выделение: клик по строке выделяет её, клик в любое другое место или Esc снимает ---
const root = ref<HTMLElement | null>(null)

const toggle = (): void => {
  selected.value = !selected.value
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    selected.value = false
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!event.repeat) toggle()
  }
}

const onFocusOut = (event: FocusEvent): void => {
  // Окно браузера потеряло фокус (переключились в другое приложение) — выделение остаётся, как в игре
  if (!document.hasFocus()) return
  if (!root.value?.contains(event.relatedTarget as Node | null)) selected.value = false
}

// --- Подсказка при наведении на онлайн и значок пинга. Мышь — пока курсор в зоне, палец — до следующего касания ---
const hit = ref<HTMLElement | null>(null)
const tip = ref<{ x: number; y: number } | null>(null)
let tipFromTouch = false

const hideTip = (): void => {
  tip.value = null
  tipFromTouch = false
}

const hitStyle = computed(() => {
  const left = countLeft.value - 4
  const top = PING_TOP - 4
  return {
    left: px(left),
    top: px(top),
    width: px(PING_RIGHT + 4 - left),
    height: px(24),
  }
})

const onHitMove = (event: PointerEvent): void => {
  if (event.pointerType === 'touch') return
  tipFromTouch = false
  tip.value = { x: event.clientX, y: event.clientY }
}

const onHitLeave = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') hideTip()
}

const onHitDown = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') return
  if (tipFromTouch) {
    hideTip()
    return
  }
  tipFromTouch = true
  tip.value = { x: event.clientX, y: event.clientY }
}

const tipStyle = computed(() => {
  if (!tip.value) return undefined
  const width = TIP_WIDTH * unit.value
  const height = TIP_HEIGHT * unit.value
  const viewWidth = document.documentElement.clientWidth
  const viewHeight = document.documentElement.clientHeight
  let left = tip.value.x + TIP_OFFSET_X * unit.value
  // Не влезает справа — встаёт слева от курсора, как в игре
  if (left + width > viewWidth - VIEWPORT_MARGIN) left = tip.value.x - TIP_OFFSET_X * unit.value - width
  const top = tip.value.y - TIP_OFFSET_Y * unit.value
  return {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Math.max(VIEWPORT_MARGIN, left)}px`,
    top: `${Math.min(Math.max(VIEWPORT_MARGIN, top), viewHeight - height - VIEWPORT_MARGIN)}px`,
  }
})

// Касание или клик где угодно вне строки снимает выделение, вне зоны онлайна — убирает подсказку с пальца
const onDocumentPointerDown = (event: PointerEvent): void => {
  const target = event.target as Node | null
  if (selected.value && !root.value?.contains(target)) selected.value = false
  if (tipFromTouch && !hit.value?.contains(target)) hideTip()
}

// --- Подписки ---
let resizeObserver: ResizeObserver | null = null
let ratioQuery: MediaQueryList | null = null

// Зум страницы или перенос окна на другой монитор меняют devicePixelRatio — пересчитать масштаб
const watchPixelRatio = (): void => {
  ratioQuery?.removeEventListener('change', onPixelRatioChange)
  ratioQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
  ratioQuery.addEventListener('change', onPixelRatioChange)
}

function onPixelRatioChange(): void {
  fit()
  hideTip()
  watchPixelRatio()
}

onMounted(() => {
  fit()
  watchPixelRatio()
  if (frame.value) {
    resizeObserver = new ResizeObserver(() => {
      fit()
      hideTip()
    })
    resizeObserver.observe(frame.value)
  }
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  window.addEventListener('scroll', hideTip, { capture: true, passive: true })

  Promise.all([loadImage(motd.image), loadImage(motd.selectedImage)])
    .then(([normal, selectedImage]) => {
      images.value = { normal, selected: selectedImage }
    })
    .catch(() => {
      failed.value = true
    })
  // Подсказка нужна сразу при первом наведении
  void loadImage(motd.tooltipImage).catch(() => undefined)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  ratioQuery?.removeEventListener('change', onPixelRatioChange)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  window.removeEventListener('scroll', hideTip, { capture: true })
})
</script>

<template>
  <!-- Плитка сервера — строка из списка серверов Minecraft. Тянется до низа плеера слева, строка по центру -->
  <div
    ref="root"
    class="srv glass-card"
    role="button"
    tabindex="0"
    :aria-pressed="selected"
    :aria-label="label"
    :aria-describedby="tipId"
    @click="toggle"
    @keydown="onKeydown"
    @focusout="onFocusOut"
    @dragstart.prevent
    @contextmenu.prevent
  >
    <div ref="frame" class="srv-frame">
      <div v-if="!failed" class="motd" :style="{ width: px(WIDTH), height: px(HEIGHT) }">
        <canvas ref="canvas" class="motd-canvas" :width="WIDTH" :height="HEIGHT" aria-hidden="true" />
        <span
          ref="hit"
          class="motd-hit"
          :style="hitStyle"
          aria-hidden="true"
          @pointerenter="onHitMove"
          @pointermove="onHitMove"
          @pointerleave="onHitLeave"
          @pointerdown="onHitDown"
        />
      </div>
      <!-- Картинки не загрузились — хотя бы адрес и онлайн текстом -->
      <p v-else class="srv-fallback">
        IP: {{ server.address }}<template v-if="count"> · {{ count }}</template>
      </p>
    </div>
    <span :id="tipId" class="sr-only">{{ motd.tooltipText }}</span>

    <Teleport to="body">
      <img
        v-if="tip"
        class="motd-tip"
        :src="motd.tooltipImage"
        :style="tipStyle"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.srv {
  display: flex;
  align-items: center;
  width: 100%;
  /* Высота как у прежней плитки с логотипом — на телефоне соседние блоки не сдвигаются */
  min-height: 5.5rem;
  padding: 1rem 1.25rem;
  border-radius: 1.25rem;
  cursor: pointer;
  /* Строку нельзя выделить, утащить или открыть меню картинки долгим нажатием */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.srv:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.srv-frame {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
}

.motd {
  position: relative;
  flex: none;
}

.motd-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.motd-hit {
  position: absolute;
}

.srv-fallback {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

/* Узкая плитка (телефон) — плотнее, строке остаётся больше места */
@container (max-width: 28rem) {
  .srv {
    padding: 0.85rem 0.95rem;
  }
}
</style>

<style>
/* Подсказка вынесена в <body>, чтобы её не обрезала плитка; не мешает наведению и кликам */
.motd-tip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}
</style>

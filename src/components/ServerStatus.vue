<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, useId, watch } from 'vue'
import { profile } from '@/config/profile'
import { useServerStatus } from '@/composables/useServerStatus'
import { drawMinecraftText, minecraftTextWidth } from '@/utils/minecraftText'

// 👇 Адрес, сайт, надписи и картинки — в src/config/profile.ts → server
const server = profile.server
const motd = server.motd

// Строка списка серверов в игре — 305×36 пикселей интерфейса, картинка снята при интерфейсе ×2.
// Координаты строки ниже — в пикселях картинки
const WIDTH = 610
const HEIGHT = 72
const GUI_WIDTH = 305
// Иконка сервера: квадрат 64×64 и сам логотип внутри него — там же, где был на скриншоте
const ICON = { left: 4, top: 4, size: 64 }
const LOGO = { left: 15, top: 13, width: 42, height: 47 }
// Стрелка «Играть» 28×44 — по центру иконки
const JOIN = { left: 22, top: 14, width: 28, height: 44 }
// Значок пинга: пять полосок по 2 пикселя с тенью, шаг 4
const PING_LEFT = 576
const PING_RIGHT = 594
const PING_TOP = 6
const PING_BARS = { width: 22, height: 14, step: 4 }
// Онлайн стоит на одной высоте со значком и заканчивается за 13 пикселей до него — как в игре
const COUNT_GAP = 13
// Подсказка. В игре она висит правее и выше курсора: рамка — в 16 и 32 пикселях от него
const TIP_WIDTH = 166
const TIP_HEIGHT = 58
const TIP_OFFSET_X = 16
const TIP_OFFSET_Y = 32
const VIEWPORT_MARGIN = 4

// Высоты частей экрана в пикселях интерфейса игры — те же числа, что в стилях ниже
const LIST_CHROME = 8
const ROW_GUI = 36
const LAN_GUI = 24
const BUTTONS_GUI = 24
// Заголовок плитки — в rem, как у соседних блоков
const HEADER_REM = 3.5
const PADDING_REM = 2
const BORDER = 2

const { status, reload } = useServerStatus(server.address)

const players = computed(() => (status.value?.online ? (status.value.players ?? null) : null))
// Пока сервер не ответил, выключен или идёт «Обновить» — онлайна нет, как в игре
const refreshing = ref(false)
const count = computed(() =>
  players.value && !refreshing.value ? `${players.value.online}/${players.value.max}` : null,
)
const countLeft = computed(() =>
  count.value ? PING_LEFT - COUNT_GAP - minecraftTextWidth(count.value) + 1 : PING_LEFT,
)

const label = computed(() =>
  players.value
    ? `${server.address}, ${players.value.online} of ${players.value.max} players online`
    : server.address,
)
const tipId = useId()

// --- Масштаб и раскладка ---
const root = ref<HTMLElement | null>(null)
const frame = ref<HTMLElement | null>(null)
// CSS-пикселей в одном пикселе картинки
const unit = ref(1)
// Телефон: плитка не тянется по соседям, строка — во всю ширину
const mobileQuery = window.matchMedia('(max-width: 767px)')
const mobile = ref(mobileQuery.matches)
// Что из экрана помещается по высоте. Строка со списком видна всегда
const show = reactive({ buttons: true, header: true, lan: true })

const rem = (): number => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
const gui = computed(() => unit.value * 2)

// Минимальная высота: на десктопе только строка в списке — плитка не растягивает соседнюю колонку,
// остальное появляется, когда плитку вытянули соседи. На телефоне — весь экран сразу
const minHeight = computed(() => {
  const r = rem()
  const base = PADDING_REM * r + BORDER + (LIST_CHROME + ROW_GUI) * gui.value
  return mobile.value ? base + HEADER_REM * r + (BUTTONS_GUI + LAN_GUI) * gui.value : base
})

const layout = (): void => {
  const tile = root.value
  if (!tile) return
  const r = rem()
  const available = tile.clientHeight - PADDING_REM * r + 0.5
  const base = (LIST_CHROME + ROW_GUI) * gui.value
  const withButtons = base + BUTTONS_GUI * gui.value
  const withHeader = withButtons + HEADER_REM * r
  show.buttons = available >= withButtons
  show.header = available >= withHeader
  show.lan = available >= withHeader + LAN_GUI * gui.value
}

// Пиксель интерфейса игры — целое число пикселей экрана, иначе пиксели выходят разной толщины.
// На телефоне — во всю ширину: при плотности экрана от 2 дробный масштаб почти не заметен
const fit = (): void => {
  const box = frame.value
  if (!box) return
  const ratio = window.devicePixelRatio || 1
  const available = box.clientWidth
  if (available <= 0) return
  const devicePerGui = Math.floor((available * ratio) / GUI_WIDTH)
  const fill = devicePerGui < 1 || (mobile.value && ratio >= 2)
  unit.value = fill ? available / WIDTH : devicePerGui / ratio / 2
  layout()
}

const px = (value: number): string => `${value * unit.value}px`
const box = (rect: { left: number; top: number; width: number; height: number }) => ({
  left: px(rect.left),
  top: px(rect.top),
  width: px(rect.width),
  height: px(rect.height),
})

const iconStyle = computed(() => box({ left: ICON.left, top: ICON.top, width: ICON.size, height: ICON.size }))
const logoStyle = computed(() => box(LOGO))
const joinStyle = computed(() => box(JOIN))
const rootStyle = computed(() => ({ '--g': `${gui.value}px`, minHeight: `${minHeight.value}px` }))

// --- Картинки и отрисовка строки ---
const canvas = ref<HTMLCanvasElement | null>(null)
const image = shallowRef<HTMLImageElement | null>(null)
const failed = ref(false)
const selected = ref(false)
// Кадр анимации пинга при «Обновить»: полоски растут и убывают, как в игре
const pingFrame = ref(0)
const PING_SEQUENCE = [1, 2, 3, 4, 5, 4, 3, 2]

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = reject
    element.src = src
  })

const draw = (): void => {
  const context = canvas.value?.getContext('2d')
  const row = image.value
  if (!context || !row) return
  context.clearRect(0, 0, WIDTH, HEIGHT)
  // Выбранный сервер в игре — белая рамка в пиксель интерфейса и чёрный фон
  if (selected.value) {
    context.fillStyle = '#fff'
    context.fillRect(0, 0, WIDTH, HEIGHT)
    context.fillStyle = '#000'
    context.fillRect(2, 2, WIDTH - 4, HEIGHT - 4)
  }
  context.drawImage(row, 0, 0)
  if (refreshing.value) {
    const bars = PING_SEQUENCE[pingFrame.value % PING_SEQUENCE.length]
    if (selected.value) {
      context.fillStyle = '#000'
      context.fillRect(PING_LEFT, PING_TOP, PING_BARS.width, PING_BARS.height)
    } else context.clearRect(PING_LEFT, PING_TOP, PING_BARS.width, PING_BARS.height)
    const width = bars * PING_BARS.step
    context.drawImage(row, PING_LEFT, PING_TOP, width, PING_BARS.height, PING_LEFT, PING_TOP, width, PING_BARS.height)
  }
  if (count.value) drawMinecraftText(context, count.value, countLeft.value, PING_TOP)
}

watch([image, selected, count, refreshing, pingFrame], draw, { flush: 'post' })

// --- «Обновить»: свежий пинг и анимация полосок, пока ждём (не меньше 0,8 секунды, как в игре) ---
const refresh = async (): Promise<void> => {
  if (refreshing.value) return
  refreshing.value = true
  const started = Date.now()
  const timer = window.setInterval(() => pingFrame.value++, 100)
  await reload({ fresh: true })
  await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, 800 - (Date.now() - started))))
  window.clearInterval(timer)
  refreshing.value = false
}

// --- «Поиск игр в локальной сети» с бегущими точками ---
const DOTS = ['O o o', 'o O o', 'o o O', 'o O o']
const dotsFrame = ref(1)
const dots = computed(() => DOTS[dotsFrame.value % DOTS.length])
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let dotsTimer: number | undefined

// --- Выделение: клик по строке выделяет её, клик в любое другое место (и по кнопкам) или Esc снимает ---
const row = ref<HTMLElement | null>(null)

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
  if (!row.value?.contains(event.relatedTarget as Node | null)) selected.value = false
}

// --- Стрелка «Играть» в иконке: мышь — при наведении на строку, палец — у выбранной строки ---
const rowHovered = ref(false)
const iconHovered = ref(false)
const lastTouch = ref(false)
const arrowVisible = computed(() => rowHovered.value || (selected.value && lastTouch.value))

const onRowEnter = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') rowHovered.value = true
}

const onRowLeave = (event: PointerEvent): void => {
  if (event.pointerType === 'touch') return
  rowHovered.value = false
  iconHovered.value = false
}

const onRowPointerDown = (event: PointerEvent): void => {
  lastTouch.value = event.pointerType === 'touch'
}

const onIconEnter = (event: PointerEvent): void => {
  if (event.pointerType !== 'touch') iconHovered.value = true
}

const onIconLeave = (): void => {
  iconHovered.value = false
}

// Стрелка видна — клик открывает сайт. Не видна (палец, строка не выбрана) — обычный клик по строке
const onIconClick = (event: MouseEvent): void => {
  if (!arrowVisible.value) return
  event.stopPropagation()
  window.open(server.siteUrl, '_blank', 'noopener,noreferrer')
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
  return box({ left, top: PING_TOP - 4, width: PING_RIGHT + 4 - left, height: 24 })
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
  if (selected.value && !row.value?.contains(target)) selected.value = false
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

const onMobileChange = (): void => {
  mobile.value = mobileQuery.matches
  fit()
}

onMounted(() => {
  fit()
  watchPixelRatio()
  mobileQuery.addEventListener('change', onMobileChange)
  resizeObserver = new ResizeObserver(() => {
    fit()
    hideTip()
  })
  if (frame.value) resizeObserver.observe(frame.value)
  if (root.value) resizeObserver.observe(root.value)
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  window.addEventListener('scroll', hideTip, { capture: true, passive: true })

  if (!reduceMotion) {
    dotsTimer = window.setInterval(() => {
      if (show.lan && !document.hidden) dotsFrame.value++
    }, 300)
  }

  loadImage(motd.image)
    .then((element) => {
      image.value = element
    })
    .catch(() => {
      failed.value = true
    })
  // Стрелки и подсказка нужны сразу при первом наведении — без мигания
  for (const src of [motd.joinImage, motd.joinHighlightedImage, motd.tooltipImage]) {
    void loadImage(src).catch(() => undefined)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  ratioQuery?.removeEventListener('change', onPixelRatioChange)
  mobileQuery.removeEventListener('change', onMobileChange)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  window.removeEventListener('scroll', hideTip, { capture: true })
  window.clearInterval(dotsTimer)
})
</script>

<template>
  <!--
    Плитка сервера — экран «Сетевая игра» из Minecraft: заголовок, список со строкой сервера и поиском
    игр в локальной сети, кнопки. Тянется до низа плеера слева; что не влезает по высоте — прячется
  -->
  <section ref="root" class="srv glass-card" :style="rootStyle" :aria-label="`${server.name} server`">
    <div class="srv-screen">
      <header v-if="show.header" class="srv-header">
        <h2 class="srv-title">{{ server.title }}</h2>
        <p v-if="server.description" class="srv-description">{{ server.description }}</p>
      </header>

      <div class="mc-list">
        <div ref="frame" class="srv-frame">
          <div
            v-if="!failed"
            ref="row"
            class="motd"
            role="button"
            tabindex="0"
            :style="{ width: px(WIDTH), height: px(HEIGHT) }"
            :aria-pressed="selected"
            :aria-label="label"
            :aria-describedby="tipId"
            @click="toggle"
            @keydown="onKeydown"
            @focusout="onFocusOut"
            @pointerenter="onRowEnter"
            @pointerleave="onRowLeave"
            @pointerdown="onRowPointerDown"
            @dragstart.prevent
            @contextmenu.prevent
          >
            <canvas ref="canvas" class="motd-canvas" :width="WIDTH" :height="HEIGHT" aria-hidden="true" />
            <img class="motd-logo" :src="motd.logo" :style="logoStyle" alt="" draggable="false" />
            <template v-if="arrowVisible">
              <span class="motd-icon-shade" :style="iconStyle" aria-hidden="true" />
              <img
                class="motd-join"
                :src="iconHovered ? motd.joinHighlightedImage : motd.joinImage"
                :style="joinStyle"
                alt=""
                draggable="false"
              />
            </template>
            <span
              class="motd-icon-hit"
              :class="{ 'is-active': arrowVisible }"
              :style="iconStyle"
              aria-hidden="true"
              @pointerenter="onIconEnter"
              @pointerleave="onIconLeave"
              @click="onIconClick"
            />
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
          <!-- Картинка не загрузилась — хотя бы адрес и онлайн текстом -->
          <p v-else class="srv-fallback">
            IP: {{ server.address }}<template v-if="count"> · {{ count }}</template>
          </p>
        </div>

        <div v-if="show.lan" class="mc-lan" aria-hidden="true">
          <span>{{ server.labels.scanning }}</span>
          <span class="mc-lan-dots">{{ dots }}</span>
        </div>
      </div>

      <div v-if="show.buttons" class="mc-buttons">
        <a class="mc-button" :href="server.siteUrl" target="_blank" rel="noopener noreferrer">
          {{ server.labels.play }}
        </a>
        <button type="button" class="mc-button" :disabled="refreshing" @click="refresh">
          {{ server.labels.refresh }}
        </button>
      </div>
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
  </section>
</template>

<style scoped>
/* --g — пиксель интерфейса игры в CSS-пикселях: все размеры «как в игре» считаются от него */
.srv {
  position: relative;
  width: 100%;
  border-radius: 1.25rem;
  overflow: hidden;
}

/* Содержимое не влияет на высоту плитки — её задают соседи и min-height из скрипта */
.srv-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.srv-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  flex: none;
  height: 2.75rem;
  margin-bottom: 0.75rem;
  padding: 0 1.25rem;
  text-align: center;
}

/* Заголовок как у «ME :]» и «MY SETUP» */
.srv-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.srv-description {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--color-text-muted, #a3a3a3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Список серверов: тёмный фон и разделители сверху и снизу, как в игре */
.mc-list {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(var(--g) * 4) 0.5rem;
  background: rgba(0, 0, 0, 0.32);
}

.mc-list::before,
.mc-list::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: calc(var(--g) * 2);
}

.mc-list::before {
  top: 0;
  background: linear-gradient(rgba(255, 255, 255, 0.22) 50%, rgba(0, 0, 0, 0.55) 50%);
}

.mc-list::after {
  bottom: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.55) 50%, rgba(255, 255, 255, 0.22) 50%);
}

.srv-frame {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
  flex: none;
}

.motd {
  position: relative;
  flex: none;
  cursor: pointer;
  /* Строку нельзя выделить, утащить или открыть меню картинки долгим нажатием */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.motd:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.motd-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.motd-logo,
.motd-icon-shade,
.motd-join,
.motd-icon-hit,
.motd-hit {
  position: absolute;
}

.motd-logo,
.motd-join {
  pointer-events: none;
  -webkit-user-drag: none;
}

/* Логотип в высоком качестве — сглаженный, а не пиксельный */
.motd-logo {
  object-fit: contain;
}

/* Затемнение иконки под стрелкой — как в игре (0xA0909090) */
.motd-icon-shade {
  background: rgba(144, 144, 144, 0.627);
}

.motd-join {
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

.motd-icon-hit.is-active {
  cursor: pointer;
}

/* «Поиск игр в локальной сети» и точки — шрифтом игры с тенью */
.mc-lan {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: none;
  height: calc(var(--g) * 24);
  font-family: 'Minecraftia', 'Monocraft', monospace;
  font-size: calc(var(--g) * 8);
  line-height: calc(var(--g) * 10);
  color: #fff;
  text-shadow: var(--g) var(--g) 0 #3f3f3f;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
}

.mc-lan-dots {
  color: #808080;
  text-shadow: var(--g) var(--g) 0 #202020;
}

/* Кнопки как в игре: серые с чёрной рамкой, при наведении рамка белая, выключенные — тёмные */
.mc-buttons {
  display: flex;
  justify-content: center;
  gap: calc(var(--g) * 4);
  flex: none;
  margin-top: calc(var(--g) * 4);
  padding: 0 0.5rem;
}

.mc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 auto;
  min-width: 0;
  width: calc(var(--g) * 150);
  height: calc(var(--g) * 20);
  padding: 0 calc(var(--g) * 4);
  border: var(--g) solid #000;
  background: #6f6f6f;
  box-shadow:
    inset var(--g) var(--g) 0 rgba(255, 255, 255, 0.28),
    inset calc(var(--g) * -1) calc(var(--g) * -2) 0 rgba(0, 0, 0, 0.32);
  font-family: 'Minecraftia', 'Monocraft', monospace;
  font-size: calc(var(--g) * 8);
  line-height: 1;
  color: #fff;
  text-shadow: var(--g) var(--g) 0 #3f3f3f;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.mc-button:hover,
.mc-button:focus-visible {
  border-color: #fff;
  outline: none;
}

.mc-button:disabled {
  border-color: #000;
  background: #2c2c2c;
  box-shadow: none;
  color: #a0a0a0;
  text-shadow: var(--g) var(--g) 0 #282828;
  cursor: default;
}

.srv-fallback {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

/* Телефон: строка во всю ширину плитки */
@media (max-width: 767px) {
  .mc-list {
    padding-inline: 0.25rem;
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

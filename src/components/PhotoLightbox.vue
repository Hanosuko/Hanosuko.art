<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

// Просмотр фото поверх страницы. Фото вылетает из своей плитки и растёт до размера экрана,
// а при закрытии улетает в плитку того фото, на котором закрыли. Листается стрелками,
// клавишами ← → и свайпом; закрывается крестиком, Esc, кликом мимо фото и свайпом вниз
const props = defineProps<{
  photos: string[]
  title: string
  // Пропорции фото (ширина / высота) по адресу — рамка встаёт по ним ещё до отрисовки картинки
  ratios: Record<string, number>
  // Где на странице плитка фото и какое у неё скругление
  thumb: (index: number) => { rect: DOMRect; radius: number } | null
}>()

// Номер открытого фото; null — просмотр закрыт
const index = defineModel<number | null>('index', { required: true })

const emit = defineEmits<{
  // Фото долетело в плитку, просмотр убран со страницы
  closed: [index: number]
}>()

const DURATION = 420
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const isOpen = computed(() => index.value !== null)

// Последнее показанное фото: пока просмотр закрывается, index уже null, а лететь надо в его плитку
const shown = ref(0)
watch(index, (value) => {
  if (value !== null) shown.value = value
})

const src = computed(() => props.photos[shown.value])

// Пропорции, которые узнали уже здесь, если плитка не успела загрузиться
const loadedRatios = ref<Record<string, number>>({})
const ratio = computed(() => props.ratios[src.value] ?? loadedRatios.value[src.value] ?? 4 / 3)

const onLoad = (event: Event): void => {
  const { naturalWidth, naturalHeight } = event.target as HTMLImageElement
  if (naturalWidth && naturalHeight) {
    loadedRatios.value = { ...loadedRatios.value, [src.value]: naturalWidth / naturalHeight }
  }
}

const pad = (value: number): string => String(value).padStart(2, '0')

// В какую сторону листали: туда уезжает старое фото, с другой стороны въезжает новое
const direction = ref<'next' | 'prev'>('next')

const go = (step: 1 | -1): void => {
  if (index.value === null || props.photos.length < 2) return
  direction.value = step > 0 ? 'next' : 'prev'
  index.value = (index.value + step + props.photos.length) % props.photos.length
}

const close = (): void => {
  index.value = null
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowRight') go(1)
  else if (event.key === 'ArrowLeft') go(-1)
}

// Клик по пустому месту вокруг фото закрывает просмотр
const onStageClick = (event: MouseEvent): void => {
  if (!(event.target as Element).closest('.lb-img')) close()
}

// Свайп влево-вправо листает, вниз — закрывает
let touch: { x: number; y: number } | null = null

const onTouchStart = (event: TouchEvent): void => {
  const point = event.touches[0]
  touch = event.touches.length === 1 && point ? { x: point.clientX, y: point.clientY } : null
}

const onTouchEnd = (event: TouchEvent): void => {
  const point = event.changedTouches[0]
  if (!touch || !point) return
  const dx = point.clientX - touch.x
  const dy = point.clientY - touch.y
  touch = null
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  else if (dy > 80 && dy > Math.abs(dx) * 1.5) close()
}

// Пока открыт просмотр, страница под ним не крутится и не ловит фокус и клики.
// Место полосы прокрутки занимает отступ — иначе страница сдвинулась бы вбок
const closeButton = ref<HTMLButtonElement | null>(null)
let locked = false

const lock = (): void => {
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
  document.getElementById('app')?.setAttribute('inert', '')
  window.addEventListener('keydown', onKeydown)
  locked = true
}

const unlock = (): void => {
  if (!locked) return
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')
  document.getElementById('app')?.removeAttribute('inert')
  window.removeEventListener('keydown', onKeydown)
  locked = false
}

watch(isOpen, (open) => {
  if (!open) return
  lock()
  void nextTick(() => closeButton.value?.focus({ preventScroll: true }))
})

onBeforeUnmount(unlock)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const onScreen = (rect: DOMRect): boolean =>
  rect.width > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth

// Кадр, где фото лежит ровно на плитке: уменьшено, чтобы закрыть её целиком (как object-fit: cover),
// и подрезано по её краям и скруглению. clip-path считается до transform, поэтому всё делится на scale
const thumbFrame = (img: HTMLElement, thumb: { rect: DOMRect; radius: number }): Keyframe => {
  const box = img.getBoundingClientRect()
  const { rect } = thumb
  const scale = Math.max(rect.width / box.width, rect.height / box.height)
  const x = rect.left + rect.width / 2 - (box.left + box.width / 2)
  const y = rect.top + rect.height / 2 - (box.top + box.height / 2)
  const insetX = (box.width - rect.width / scale) / 2
  const insetY = (box.height - rect.height / scale) / 2
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    clipPath: `inset(${insetY}px ${insetX}px round ${thumb.radius / scale}px)`,
  }
}

const fullFrame = (img: HTMLElement): Keyframe => ({
  transform: 'translate(0px, 0px) scale(1)',
  clipPath: `inset(0px 0px round ${parseFloat(getComputedStyle(img).borderTopLeftRadius) || 0}px)`,
})

// Фото летит из плитки или в неё, если плитка видна на экране и анимации не выключены в системе
const zoomTarget = (root: HTMLElement) => {
  const img = root.querySelector<HTMLElement>('.lb-img')
  const thumb = props.thumb(shown.value)
  if (!img || !thumb || !onScreen(thumb.rect) || reducedMotion.matches) return { img, thumb: null }
  return { img, thumb }
}

const settle = (animations: (Animation | undefined)[], done: () => void): void => {
  void Promise.all(animations.map((animation) => animation?.finished)).then(done, done)
}

// Анимации открытия: если закрыли, не дождавшись конца, они просто проигрываются назад
let entering: Animation[] = []

const onEnter = (el: Element, done: () => void): void => {
  const root = el as HTMLElement
  const { img, thumb } = zoomTarget(root)
  const chrome = root.querySelector('.lb-bar')

  entering = [
    root.querySelector('.lb-backdrop')?.animate({ opacity: [0, 1] }, { duration: DURATION, easing: EASE }),
    chrome?.animate({ opacity: [0, 1] }, { duration: 260, delay: 120, easing: 'ease', fill: 'backwards' }),
    img && thumb
      ? img.animate([thumbFrame(img, thumb), fullFrame(img)], { duration: DURATION, easing: EASE, fill: 'backwards' })
      : img?.animate(
          { opacity: [0, 1], transform: ['scale(0.96)', 'scale(1)'] },
          { duration: 220, easing: 'ease', fill: 'backwards' },
        ),
  ].filter((animation): animation is Animation => animation !== undefined)

  settle(entering, done)
}

const onLeave = (el: Element, done: () => void): void => {
  const running = entering.filter((animation) => animation.playState === 'running')
  entering = []
  if (running.length) {
    running.forEach((animation) => animation.reverse())
    settle(running, done)
    return
  }

  const root = el as HTMLElement
  const { img, thumb } = zoomTarget(root)
  const chrome = root.querySelector('.lb-bar')

  settle(
    [
      root.querySelector('.lb-backdrop')?.animate({ opacity: [1, 0] }, { duration: DURATION, easing: EASE, fill: 'forwards' }),
      chrome?.animate({ opacity: [1, 0] }, { duration: 160, easing: 'ease', fill: 'forwards' }),
      img && thumb
        ? img.animate([fullFrame(img), thumbFrame(img, thumb)], { duration: DURATION, easing: EASE, fill: 'forwards' })
        : img?.animate(
            { opacity: [1, 0], transform: ['scale(1)', 'scale(0.96)'] },
            { duration: 200, easing: 'ease', fill: 'forwards' },
          ),
    ],
    done,
  )
}

const onAfterLeave = (): void => {
  unlock()
  emit('closed', shown.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition :css="false" @enter="onEnter" @leave="onLeave" @after-leave="onAfterLeave">
      <div v-if="isOpen" class="lightbox" role="dialog" aria-modal="true" :aria-label="title">
        <div class="lb-backdrop" />

        <div class="lb-stage" @click="onStageClick" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
          <Transition :name="`lb-swap-${direction}`" mode="out-in">
            <figure :key="src" class="lb-figure" :style="{ '--ratio': ratio }">
              <img
                class="lb-img"
                :src="src"
                :alt="`${title} ${shown + 1}`"
                draggable="false"
                @load="onLoad"
              />
            </figure>
          </Transition>
        </div>

        <div class="lb-bar">
          <template v-if="photos.length > 1">
            <span class="lb-counter" aria-live="polite">{{ pad(shown + 1) }} / {{ pad(photos.length) }}</span>
            <button type="button" class="lb-btn lb-nav lb-prev" aria-label="Previous photo" @click="go(-1)">
              <ChevronLeft :size="20" aria-hidden="true" />
            </button>
            <button type="button" class="lb-btn lb-nav lb-next" aria-label="Next photo" @click="go(1)">
              <ChevronRight :size="20" aria-hidden="true" />
            </button>
          </template>
          <button ref="closeButton" type="button" class="lb-btn lb-close" aria-label="Close" @click="close">
            <X :size="20" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.lb-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(8, 8, 10, 0.82);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
}

/* Сцена во весь экран: фото по центру, клик по пустому месту закрывает */
.lb-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    max(4.25rem, env(safe-area-inset-top))
    max(5rem, env(safe-area-inset-right))
    max(2rem, env(safe-area-inset-bottom))
    max(5rem, env(safe-area-inset-left));
  cursor: zoom-out;
}

/* Размер фото — по его пропорциям: во всю ширину или во всю высоту, смотря что упрётся раньше */
.lb-figure {
  --max-w: calc(100vw - 10rem);
  --max-h: calc(100dvh - 6.25rem);
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
}

.lb-img {
  display: block;
  width: min(var(--max-w), calc(var(--max-h) * var(--ratio)));
  height: auto;
  aspect-ratio: var(--ratio);
  object-fit: cover;
  border-radius: 0.9rem;
  background: var(--color-background);
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* Счётчик и кнопки. Пустое место полосы пропускает клик на сцену */
.lb-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding:
    max(1rem, env(safe-area-inset-top))
    max(1rem, env(safe-area-inset-right))
    0
    max(1rem, env(safe-area-inset-left));
  pointer-events: none;
}

.lb-bar > * {
  pointer-events: auto;
}

.lb-counter {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  user-select: none;
}

.lb-btn {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  background: rgba(28, 28, 28, 0.7);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    scale 0.15s ease;
}

.lb-btn:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 18px var(--color-glow);
}

@media (hover: hover) {
  .lb-btn:hover {
    border-color: var(--color-accent);
    box-shadow: 0 0 18px var(--color-glow);
  }
}

.lb-btn:active {
  scale: 0.92;
}

/* Телефон: стрелки рядом с крестиком справа сверху, счётчик слева */
.lb-prev {
  margin-left: auto;
}

.lb-close:first-child {
  margin-left: auto;
}

/* Десктоп: стрелки по бокам экрана, посередине по высоте */
@media (min-width: 768px) {
  .lb-close {
    margin-left: auto;
  }

  .lb-nav {
    position: fixed;
    top: 50%;
    width: 3rem;
    height: 3rem;
    translate: 0 -50%;
  }

  .lb-prev {
    left: max(1.25rem, env(safe-area-inset-left));
  }

  .lb-next {
    right: max(1.25rem, env(safe-area-inset-right));
  }
}

@media (max-width: 767px) {
  .lb-stage {
    padding:
      max(4.25rem, env(safe-area-inset-top))
      max(0.75rem, env(safe-area-inset-right))
      max(1rem, env(safe-area-inset-bottom))
      max(0.75rem, env(safe-area-inset-left));
  }

  .lb-figure {
    --max-w: calc(100vw - 1.5rem);
    --max-h: calc(100dvh - 5.25rem);
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* Смена фото: старое уезжает в сторону листания, новое въезжает с другой стороны */
.lb-swap-next-enter-active,
.lb-swap-next-leave-active,
.lb-swap-prev-enter-active,
.lb-swap-prev-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.lb-swap-next-leave-to,
.lb-swap-prev-enter-from {
  opacity: 0;
  transform: translateX(-2rem);
}

.lb-swap-next-enter-from,
.lb-swap-prev-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

@media (prefers-reduced-motion: reduce) {
  .lb-swap-next-leave-to,
  .lb-swap-prev-enter-from,
  .lb-swap-next-enter-from,
  .lb-swap-prev-leave-to {
    transform: none;
  }
}
</style>

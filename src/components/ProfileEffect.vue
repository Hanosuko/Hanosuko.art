<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { ProfileEffect, ProfileEffectLayer } from '@/types/profile'
import { useIntro } from '@/composables/useIntro'

const props = defineProps<{ effect: ProfileEffect }>()

// Эффект профиля Discord: APNG-слои поверх карточки с таймингами Discord — слой появляется через start мс,
// играет duration мс, петля повторяется через loopDelay. APNG нельзя перезапустить с первого кадра,
// поэтому файл скачивается один раз, а на каждый показ создаётся новый blob-URL — для браузера это новая картинка.

interface ShownLayer {
  id: number
  src: string
  zIndex: number
  duration: number
}

const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
// Без анимации — статичный кадр, как в Discord при «Уменьшении движения»
const staticOnly = window.matchMedia('(prefers-reduced-motion: reduce)').matches || saveData

const root = ref<HTMLElement | null>(null)
const shown = shallowRef<ShownLayer[]>([])
const { entered } = useIntro()

const files = new Map<string, Promise<Blob | null>>()
const timers = new Set<number>()
let observer: IntersectionObserver | null = null
let inView = true
let started = false
let disposed = false
let nextId = 0

const download = (src: string): Promise<Blob | null> => {
  let file = files.get(src)
  if (!file) {
    // Эффект весит ~7 МБ (растровые точки почти не сжимаются) — низкий приоритет,
    // чтобы шрифты, аватар и остальная страница грузились первыми
    file = fetch(src, { priority: 'low' })
      .then((response) => (response.ok ? response.blob() : null))
      .catch(() => null)
    files.set(src, file)
  }
  return file
}

const later = (callback: () => void, ms: number): void => {
  const timer = window.setTimeout(() => {
    timers.delete(timer)
    callback()
  }, ms)
  timers.add(timer)
}

const hide = (id: number): void => {
  const layer = shown.value.find((item) => item.id === id)
  if (layer) URL.revokeObjectURL(layer.src)
  shown.value = shown.value.filter((item) => item.id !== id)
}

const show = async (layer: ProfileEffectLayer): Promise<void> => {
  const blob = await download(layer.src)
  if (!blob || disposed) return
  const item = { id: ++nextId, src: URL.createObjectURL(blob), zIndex: layer.zIndex ?? 0, duration: layer.duration }
  shown.value = [...shown.value, item]
}

// Длительность считается с момента, когда картинка реально появилась
const onLoad = (layer: ShownLayer): void => later(() => hide(layer.id), layer.duration)

// Петля держит ритм, даже если показ пропущен: вкладка скрыта или карточка за экраном
const schedule = (layer: ProfileEffectLayer, delay: number): void => {
  later(() => {
    if (layer.loop) schedule(layer, layer.duration + (layer.loopDelay ?? 0))
    if (inView && !document.hidden) void show(layer)
  }, delay)
}

const start = async (): Promise<void> => {
  if (started || staticOnly) return
  started = true
  // Ждём все файлы: иначе тяжёлое вступление может запоздать и наложиться на петлю
  const loaded = await Promise.all(props.effect.layers.map((layer) => download(layer.src)))
  if (disposed || loaded.includes(null)) return
  for (const layer of props.effect.layers) schedule(layer, layer.start)
}

onMounted(() => {
  if (staticOnly) return
  // Качаем заранее, пока висит заставка, — после клика эффект стартует сразу.
  // Но только когда загрузилась сама страница: start() всё равно дождётся файлов
  const prefetch = (): void => {
    if (!disposed) for (const layer of props.effect.layers) void download(layer.src)
  }
  if (document.readyState === 'complete') prefetch()
  else window.addEventListener('load', prefetch, { once: true })
  if (root.value) {
    observer = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true
    })
    observer.observe(root.value)
  }
})

watch(entered, (isEntered) => {
  if (isEntered) void start()
}, { immediate: true })

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  for (const timer of timers) window.clearTimeout(timer)
  for (const layer of shown.value) URL.revokeObjectURL(layer.src)
})
</script>

<template>
  <div ref="root" class="profile-effect" aria-hidden="true">
    <img v-if="staticOnly && effect.reducedMotionSrc" :src="effect.reducedMotionSrc" alt="" />
    <img
      v-for="layer in shown"
      :key="layer.id"
      :src="layer.src"
      :style="{ zIndex: layer.zIndex }"
      alt=""
      @load="onLoad(layer)"
      @error="hide(layer.id)"
    />
  </div>
</template>

<style scoped>
/* Поверх всей карточки, но клики проходят насквозь */
.profile-effect {
  position: absolute;
  inset: 0;
  z-index: 4;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

/* Как в Discord: по ширине карточки, от верхнего края */
.profile-effect img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
}
</style>

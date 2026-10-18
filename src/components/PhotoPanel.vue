<script setup lang="ts">
import { computed, nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
import { profile } from '@/config/profile'
import PhotoLightbox from '@/components/PhotoLightbox.vue'

const gallery = profile.gallery

// Фото, которое не загрузилось (файла нет), убираем — раскладка перестраивается под оставшиеся
const missing = ref(new Set<string>())
const photos = computed(() => gallery.photos.filter((photo) => !missing.value.has(photo.src)))

const dropPhoto = (src: string): void => {
  missing.value = new Set(missing.value).add(src)
}

// Своя раскладка для 1–6 фото; седьмое и дальше встают парами ниже
const layout = computed(() => `count-${Math.min(photos.value.length, 6)}`)

// Пропорции фото: просмотр ставит по ним рамку ещё до того, как картинка отрисуется
const ratios = ref<Record<string, number>>({})

const onThumbLoad = (src: string, event: Event): void => {
  const { naturalWidth, naturalHeight } = event.target as HTMLImageElement
  if (naturalWidth && naturalHeight) ratios.value = { ...ratios.value, [src]: naturalWidth / naturalHeight }
}

// Открытое в просмотре фото. Его плитка прячется, пока фото не долетит обратно, — будто фото
// поднялось с плашки, а не скопировалось
const viewing = ref<number | null>(null)
const lifted = ref<number | null>(null)

watch(viewing, (index) => {
  if (index !== null) lifted.value = index
})

const cells: (HTMLElement | null)[] = []

const setCell = (el: Element | ComponentPublicInstance | null, index: number): void => {
  cells[index] = el instanceof HTMLElement ? el : null
}

// Где плитка на экране: фото вылетает из неё и возвращается в неё. Размер — по картинке внутри рамки
const thumb = (index: number): { rect: DOMRect; radius: number } | null => {
  const cell = cells[index]
  const img = cell?.querySelector('img')
  if (!cell || !img) return null
  const radius = parseFloat(getComputedStyle(cell).borderTopLeftRadius) - cell.clientLeft
  return { rect: img.getBoundingClientRect(), radius: Math.max(radius, 0) }
}

// Фокус возвращается на плитку фото, на котором закрыли, — с клавиатуры можно листать дальше.
// Ждём перерисовки: скрытую плитку браузер сфокусировать не даст
const onClosed = (index: number): void => {
  lifted.value = null
  void nextTick(() => cells[index]?.focus({ preventScroll: true }))
}
</script>

<template>
  <section class="glass-card photo-card" aria-label="Photo gallery">
    <header class="photo-header">
      <h2 class="photo-title">{{ gallery.title }}</h2>
    </header>

    <div class="photo-grid" :class="layout">
      <button
        v-for="(photo, index) in photos"
        :key="photo.src"
        :ref="(el) => setCell(el, index)"
        type="button"
        class="photo-cell"
        :class="[`photo-cell-${index + 1}`, { 'is-lifted': lifted === index }]"
        :aria-label="`Open photo ${index + 1} of ${photos.length}`"
        @click="viewing = index"
      >
        <img
          class="photo-img"
          :src="photo.src"
          alt=""
          loading="lazy"
          decoding="async"
          @load="onThumbLoad(photo.src, $event)"
          @error="dropPhoto(photo.src)"
        />
      </button>
    </div>

    <PhotoLightbox
      v-model:index="viewing"
      :photos="photos"
      :title="gallery.title"
      :ratios="ratios"
      :thumb="thumb"
      @closed="onClosed"
    />
  </section>
</template>

<style scoped>
.photo-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.5rem;
  width: 100%;
  overflow: hidden;
}

.photo-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: center;
  flex-shrink: 0;
}

.photo-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-accent);
}

/* Бенто: 1-е фото широкое сверху, 2-е и 3-е — квадраты слева, 4-е — высокое справа
   (под вертикальное фото), 5-е и 6-е — нижний ряд. Ряды не ниже минимума, а если колонка
   длиннее — коллаж дотягивается до её низа и фото растут */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: minmax(10.5rem, 1.35fr);
  grid-auto-rows: minmax(8.5rem, 1fr);
  gap: 0.5rem;
  flex: 1 1 auto;
}

.photo-grid.count-1 {
  grid-template-areas: 'p1 p1';
}

.photo-grid.count-2 {
  grid-template-areas:
    'p1 p1'
    'p2 p2';
}

.photo-grid.count-3 {
  grid-template-areas:
    'p1 p1'
    'p2 p3';
}

.photo-grid.count-4 {
  grid-template-areas:
    'p1 p1'
    'p2 p4'
    'p3 p4';
}

.photo-grid.count-5 {
  grid-template-areas:
    'p1 p1'
    'p2 p4'
    'p3 p4'
    'p5 p5';
}

.photo-grid.count-6 {
  grid-template-areas:
    'p1 p1'
    'p2 p4'
    'p3 p4'
    'p5 p6';
}

.photo-cell {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-background);
  color: inherit;
  cursor: zoom-in;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

@media (hover: hover) {
  .photo-cell:hover {
    border-color: var(--color-accent);
    box-shadow: 0 0 18px var(--color-glow);
    transform: translateY(-1px);
  }
}

.photo-cell:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 18px var(--color-glow);
}

/* Фото этой плитки сейчас в просмотре */
.photo-cell.is-lifted {
  visibility: hidden;
}

.photo-cell-1 {
  grid-area: p1;
}

.photo-cell-2 {
  grid-area: p2;
}

.photo-cell-3 {
  grid-area: p3;
}

.photo-cell-4 {
  grid-area: p4;
}

.photo-cell-5 {
  grid-area: p5;
}

.photo-cell-6 {
  grid-area: p6;
}

.photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>

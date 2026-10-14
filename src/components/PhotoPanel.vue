<script setup lang="ts">
import { profile } from '@/config/profile'

const gallery = profile.gallery
</script>

<template>
  <section class="glass-card neon-ring photo-card" aria-label="Photo gallery">
    <header class="photo-header">
      <h2 class="photo-title">{{ gallery.title }}</h2>
    </header>

    <div class="photo-grid">
      <figure
        v-for="(src, index) in gallery.photos"
        :key="src"
        class="photo-cell"
        :class="`photo-cell-${index + 1}`"
      >
        <img
          class="photo-img"
          :src="src"
          :alt="`${gallery.title} ${index + 1}`"
          loading="lazy"
          decoding="async"
        />
      </figure>
    </div>
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

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.5rem;
  flex: 1 1 auto;
  /* На телефоне — фиксированные пропорции, на десктопе растягивается до высоты ряда */
  aspect-ratio: 3 / 4;
}

.photo-cell {
  position: relative;
  margin: 0;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-background);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.photo-cell:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 18px var(--color-glow);
  transform: translateY(-1px);
}

.photo-cell-1 {
  grid-column: span 2;
  grid-row: span 1;
}

.photo-cell-2 {
  grid-column: span 2;
  grid-row: span 1;
}

.photo-cell-3 {
  grid-column: 1;
  grid-row: 3;
}

.photo-cell-4 {
  grid-column: 2;
  grid-row: 3;
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

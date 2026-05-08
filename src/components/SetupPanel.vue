<script setup lang="ts">
import { profile } from '@/config/profile'

const setup = profile.setup
</script>

<template>
  <aside class="setup-panel" aria-label="My setup">
    <section class="glass-card neon-ring setup-card">
      <header class="setup-header">
        <h2 class="setup-title">{{ setup.title }}</h2>
        <p v-if="setup.description" class="setup-description">{{ setup.description }}</p>
      </header>

      <figure class="setup-photo-wrap">
        <img
          class="setup-photo"
          :src="setup.photoUrl"
          :alt="setup.title"
          loading="lazy"
          decoding="async"
        />
      </figure>

      <ul class="setup-specs">
        <li v-for="item in setup.specs" :key="item.label" class="setup-spec">
          <span class="spec-label">{{ item.label }}</span>
          <span class="spec-value">{{ item.value }}</span>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.setup-panel {
  position: fixed;
  top: 1.5rem;
  bottom: 1.5rem;
  right: clamp(0.2rem, 4vw, 4rem);
  width: clamp(4rem, 24vw, 26rem);
  z-index: 20;
  pointer-events: auto;
}

@media (max-width: 900px) {
  .setup-panel {
    display: none;
  }
}

.setup-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.25rem 1.4rem;
  border-radius: 1.5rem;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.setup-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: center;
  flex-shrink: 0;
}

.setup-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.setup-description {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--color-text-muted, #a3a3a3);
}

.setup-photo-wrap {
  margin: 0;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--color-background);
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.setup-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.setup-specs {
  list-style: none;
  margin: -0.75rem -1rem;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.setup-specs::-webkit-scrollbar {
  width: 6px;
}

.setup-specs::-webkit-scrollbar-track {
  background: transparent;
}

.setup-specs::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 3px;
}

.setup-specs::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.32);
}

.setup-spec {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0.7rem;
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.setup-spec:hover {
  z-index: 5;
  border-color: var(--color-accent);
  box-shadow: 0 0 18px var(--color-glow);
  transform: translateY(-1px);
}

.spec-label {
  flex: 0 0 auto;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted, #a3a3a3);
}

.spec-value {
  flex: 1 1 auto;
  text-align: right;
  font-size: 0.78rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

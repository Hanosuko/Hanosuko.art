<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  kitName: string
  kitSlug: string
  renderUrl: string
  discordUrl: string
  tableBaseUrl: string
}

const props = defineProps<Props>()
const emit = defineEmits<(event: 'close') => void>()

const tableUrl = `${props.tableBaseUrl.replace(/\/+$/, '')}/${props.kitSlug}`

const handleKey = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKey)
})

const stars = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  top: Math.random() * 95,
  left: Math.random() * 95,
  scale: 0.5 + Math.random() * 0.9,
  delay: Math.random() * 4,
}))
</script>

<template>
  <div class="tier-modal-backdrop" @click.self="emit('close')">
    <div class="tier-modal glass-card" role="dialog" aria-modal="true">
      <div class="stars" aria-hidden="true">
        <span
          v-for="star in stars"
          :key="star.id"
          class="star"
          :style="{
            top: `${star.top}%`,
            left: `${star.left}%`,
            transform: `scale(${star.scale})`,
            animationDelay: `${star.delay}s`,
          }"
          >✦</span
        >
      </div>

      <button type="button" class="close-button" aria-label="Close" @click="emit('close')">
        <X :size="20" aria-hidden="true" />
      </button>

      <header class="tier-modal-head">
        <h2 class="kit-title">{{ kitName }}</h2>
      </header>

      <div class="render-stage">
        <img class="render-image" :src="renderUrl" :alt="kitName" />
      </div>

      <div class="action-row">
        <a
          :href="discordUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="action-button discord-icon"
          aria-label="Перейти в дискорд"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path
              d="M19.27 5.33a17.27 17.27 0 0 0-4.34-1.34l-.21.43c1.46.32 2.84.86 4.07 1.62A14.6 14.6 0 0 0 5.21 6.04 16.7 16.7 0 0 1 9.28 4.42L9.07 4a17.27 17.27 0 0 0-4.34 1.34A18.16 18.16 0 0 0 1.4 16.5a17.85 17.85 0 0 0 5.4 2.74c.43-.6.83-1.24 1.18-1.92a11.4 11.4 0 0 1-1.86-.9c.15-.11.31-.23.46-.36 3.6 1.66 7.5 1.66 11.05 0 .15.13.3.25.46.36-.6.36-1.22.66-1.86.9.35.68.75 1.32 1.18 1.92a17.85 17.85 0 0 0 5.4-2.74 18.18 18.18 0 0 0-3.34-11.17ZM8.52 14.45c-1.07 0-1.95-1-1.95-2.22 0-1.22.86-2.22 1.95-2.22s1.97 1 1.95 2.22c0 1.22-.86 2.22-1.95 2.22Zm7.2 0c-1.07 0-1.95-1-1.95-2.22 0-1.22.86-2.22 1.95-2.22s1.97 1 1.95 2.22c0 1.22-.86 2.22-1.95 2.22Z"
              fill="currentColor"
            />
          </svg>
        </a>
        <a
          :href="tableUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="action-button table-button"
        >
          Посмотреть таблицу
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tier-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: opacity 0.28s ease, backdrop-filter 0.28s ease;
}

.tier-modal {
  position: relative;
  width: min(420px, 100%);
  border-radius: 1.25rem;
  padding: 1.5rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden;
  font-family: 'Monocraft', monospace;
  font-weight: 700;
  transform-origin: center;
  transition:
    opacity 0.28s ease,
    transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.55);
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.45);
  animation: twinkle 3.5s ease-in-out infinite;
}

.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 9999px;
  transition: color 0.2s ease, background 0.2s ease;
  z-index: 2;
}

.close-button:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.06);
}

.tier-modal-head {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  margin-top: 0.5rem;
}

.kit-title {
  margin: 0;
  font-size: 2.4rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.35);
  font-weight: 700;
}

.render-stage {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 14rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.render-image {
  max-width: 80%;
  max-height: 16rem;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 22px rgba(0, 0, 0, 0.55));
  animation: float 4s ease-in-out infinite;
}

.discord-link {
  display: none;
}

.action-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.action-button.discord-icon {
  flex: 0 0 auto;
  width: 3.25rem;
  padding: 0;
  background: #5865F2;
  color: #ffffff;
  border: 1px solid #5865F2;
}

.action-button.discord-icon svg {
  width: 1.4rem;
  height: 1.4rem;
}

.action-button.discord-icon:hover,
.action-button.discord-icon:focus-visible {
  transform: translateY(-1px);
  background: #6973ff;
  border-color: #6973ff;
  box-shadow: 0 0 22px rgba(88, 101, 242, 0.45);
  outline: none;
}

.action-button.table-button {
  flex: 1 1 auto;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.18);
  text-transform: none;
  letter-spacing: 0.02em;
}

.action-button.table-button:hover,
.action-button.table-button:focus-visible {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 18px var(--color-glow);
  outline: none;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.85;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(-4px);
  }
  50% {
    transform: translateY(4px);
  }
}
</style>

<style>
.tier-modal-backdrop.modal-fade-enter-from,
.tier-modal-backdrop.modal-fade-leave-to {
  opacity: 0;
}

.tier-modal-backdrop.modal-fade-enter-from .tier-modal,
.tier-modal-backdrop.modal-fade-leave-to .tier-modal {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}
</style>

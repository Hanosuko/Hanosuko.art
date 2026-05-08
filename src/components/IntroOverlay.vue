<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)

const dismiss = (): void => {
  visible.value = false
}

const onKey = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    dismiss()
  }
}
</script>

<template>
  <Transition name="intro">
    <div
      v-if="visible"
      class="intro"
      role="button"
      tabindex="0"
      aria-label="Click to enter"
      @click="dismiss"
      @keydown="onKey"
    >
      <span class="intro-text">click to me &gt;_&lt;</span>
    </div>
  </Transition>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(10, 10, 15, 0.35);
  backdrop-filter: blur(28px) saturate(140%);
  -webkit-backdrop-filter: blur(28px) saturate(140%);
  outline: none;
  user-select: none;
}

.intro-text {
  font-family: 'Monocraft', monospace;
  font-size: clamp(1.5rem, 5vw, 2.75rem);
  letter-spacing: 0.04em;
  color: var(--color-text);
  text-shadow:
    0 0 18px var(--color-glow),
    0 0 42px var(--color-glow);
  animation: intro-pulse 1.8s ease-in-out infinite;
}

@keyframes intro-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.92;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}

.intro-leave-active {
  transition: opacity 0.7s ease, backdrop-filter 0.7s ease, -webkit-backdrop-filter 0.7s ease;
}

.intro-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px) saturate(100%);
  -webkit-backdrop-filter: blur(0px) saturate(100%);
}

.intro-leave-active .intro-text {
  transition: transform 0.7s ease, opacity 0.5s ease;
  animation: none;
  transform: scale(1.25);
  opacity: 0;
}
</style>

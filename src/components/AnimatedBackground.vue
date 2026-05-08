<script setup lang="ts">
import { computed } from 'vue'
import { profile } from '@/config/profile'

const variant = computed(() => profile.background.variant)
const imageUrl = computed(() => profile.background.imageUrl)
</script>

<template>
  <div class="background-root" aria-hidden="true">
    <div v-if="variant === 'gradient'" class="background-gradient" />
    <div v-else-if="variant === 'particles'" class="background-particles">
      <span v-for="n in 40" :key="n" class="particle" :style="{ '--i': n }" />
    </div>
    <div
      v-else-if="variant === 'static' && imageUrl"
      class="background-image"
      :style="{ backgroundImage: `url(${imageUrl})` }"
    />
    <div v-if="variant !== 'static' || imageUrl" class="background-vignette" />
  </div>
</template>

<style scoped>
.background-root {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--color-background);
}

.background-gradient {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(circle at 20% 30%, rgba(229, 229, 229, 0.08), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(180, 180, 180, 0.06), transparent 50%),
    radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.04), transparent 55%);
  animation: drift 22s ease-in-out infinite alternate;
  filter: blur(40px);
}

@keyframes drift {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-4%, 3%) scale(1.05);
  }
}

.background-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.6;
}

.background-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

.background-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-accent);
  opacity: 0;
  left: calc((var(--i) * 137) % 100 * 1%);
  top: 100%;
  animation: float-up 12s linear infinite;
  animation-delay: calc(var(--i) * -0.4s);
  box-shadow: 0 0 8px var(--color-glow);
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(0.6);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-110vh) scale(1);
    opacity: 0;
  }
}
</style>

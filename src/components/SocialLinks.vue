<script setup lang="ts">
import { computed } from 'vue'
import { profile } from '@/config/profile'
import type { SocialKind, SocialLink } from '@/types/profile'

// 👇 Чтобы добавить/убрать соцсеть — редактируй src/config/profile.ts → social
const links = computed<SocialLink[]>(() =>
  profile.social.filter((link) => link.url.trim().length > 0),
)

const sanitize = (url: string): string => {
  if (/^https?:\/\//i.test(url)) return url
  if (/^mailto:/i.test(url)) return url
  return '#'
}

const brandPaths: Record<SocialKind, string> = {
  telegram:
    'M9.04 15.36 8.84 19.13c.31 0 .45-.13.61-.29l1.46-1.4 3.04 2.23c.56.31.96.15 1.11-.52l2.01-9.42c.18-.83-.3-1.16-.85-.96L4.4 13.45c-.81.31-.8.76-.14.96l3.16.99 7.34-4.62c.35-.22.66-.1.4.13z',
  discord:
    'M19.27 5.33a17.27 17.27 0 0 0-4.34-1.34l-.21.43c1.46.32 2.84.86 4.07 1.62A14.6 14.6 0 0 0 5.21 6.04 16.7 16.7 0 0 1 9.28 4.42L9.07 4a17.27 17.27 0 0 0-4.34 1.34A18.16 18.16 0 0 0 1.4 16.5a17.85 17.85 0 0 0 5.4 2.74c.43-.6.83-1.24 1.18-1.92a11.4 11.4 0 0 1-1.86-.9c.15-.11.31-.23.46-.36 3.6 1.66 7.5 1.66 11.05 0 .15.13.3.25.46.36-.6.36-1.22.66-1.86.9.35.68.75 1.32 1.18 1.92a17.85 17.85 0 0 0 5.4-2.74 18.18 18.18 0 0 0-3.34-11.17ZM8.52 14.45c-1.07 0-1.95-1-1.95-2.22 0-1.22.86-2.22 1.95-2.22s1.97 1 1.95 2.22c0 1.22-.86 2.22-1.95 2.22Zm7.2 0c-1.07 0-1.95-1-1.95-2.22 0-1.22.86-2.22 1.95-2.22s1.97 1 1.95 2.22c0 1.22-.86 2.22-1.95 2.22Z',
  github:
    'M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.28-1.67-1.28-1.67-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.93 10.93 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.77 1.06.77 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z',
  tiktok:
    'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25v-.44h-3.36v13.56a2.93 2.93 0 0 1-2.94 2.94 2.93 2.93 0 0 1-2.94-2.94 2.93 2.93 0 0 1 2.94-2.94c.31 0 .61.05.89.15v-3.4a6.34 6.34 0 0 0-.89-.06A6.36 6.36 0 0 0 3.16 16.6a6.36 6.36 0 0 0 6.36 6.36 6.36 6.36 0 0 0 6.36-6.36V9.4a8.18 8.18 0 0 0 4.78 1.53V7.55c-.4 0-.78-.04-1.07-.13z',
  youtube:
    'M23.5 6.51a3 3 0 0 0-2.12-2.12C19.51 4 12 4 12 4s-7.51 0-9.38.39A3 3 0 0 0 .5 6.51 31.43 31.43 0 0 0 .1 12a31.43 31.43 0 0 0 .4 5.49 3 3 0 0 0 2.12 2.12C4.49 20 12 20 12 20s7.51 0 9.38-.39a3 3 0 0 0 2.12-2.12A31.43 31.43 0 0 0 23.9 12a31.43 31.43 0 0 0-.4-5.49ZM9.75 15.57V8.43L15.82 12l-6.07 3.57Z',
  minecraft:
    'M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h6v6h-6v-6ZM9 9h6v6H9V9Z',
  namemc:
    'M4 4h16v4H4V4Zm0 4h4v12H4V8Zm12 0h4v12h-4V8Z',
  modrinth:
    'M12.252.004a11.78 11.768 0 0 0-8.92 3.73 11 10.999 0 0 0-2.17 3.11 11.37 11.359 0 0 0-1.16 5.169c0 1.42.17 2.5.6 3.77.24.759.77 1.899 1.17 2.529a12.3 12.298 0 0 0 8.85 5.639c.44.05 2.54.07 2.76.02.2-.04.22.1-.26-1.7l-.36-1.37-1.01-.06a8.5 8.489 0 0 1-5.18-1.8 5.34 5.34 0 0 1-1.3-1.26c0-.05.34-.28.74-.5a37.572 37.545 0 0 1 2.88-1.629c.03 0 .5.45 1.06.98l1 .97 2.07-.43 2.06-.43 1.47-1.47c.8-.8 1.48-1.5 1.48-1.52 0-.09-.42-1.63-.46-1.7-.04-.06-.2-.03-1.02.18-.53.13-1.2.3-1.45.4l-.48.15-.53.53-.53.53-.93.1-.93.07-.52-.5a2.7 2.7 0 0 1-.96-1.7l-.13-.6.43-.57c.68-.9.68-.9 1.46-1.1.4-.1.65-.2.83-.33.13-.099.65-.579 1.14-1.069l.9-.9-.7-.7-.7-.7-1.95.54c-1.07.3-1.96.53-1.97.53-.03 0-2.23 2.48-2.63 2.97l-.29.35.28 1.03c.16.56.3 1.16.31 1.34l.03.3-.34.23c-.37.23-2.22 1.3-2.84 1.63-.36.2-.37.2-.44.1-.08-.1-.23-.6-.32-1.03-.18-.86-.17-2.75.02-3.73a8.84 8.839 0 0 1 7.9-6.93c.43-.03.77-.08.78-.1.06-.17.5-2.999.47-3.039-.01-.02-.1-.02-.2-.03Zm3.68.67c-.2 0-.3.1-.37.38-.06.23-.46 2.42-.46 2.52 0 .04.1.11.22.16a8.51 8.499 0 0 1 2.99 2 8.38 8.379 0 0 1 2.16 3.449 6.9 6.9 0 0 1 .4 2.8c0 1.07 0 1.27-.1 1.73a9.37 9.369 0 0 1-1.76 3.769c-.32.4-.98 1.06-1.37 1.38-.38.32-1.54 1.1-1.7 1.14-.1.03-.1.06-.07.26.03.18.64 2.56.7 2.78l.06.06a12.07 12.058 0 0 0 7.27-9.4c.13-.77.13-2.58 0-3.4a11.96 11.948 0 0 0-5.73-8.578c-.7-.42-2.05-1.06-2.25-1.06Z',
}
</script>

<template>
  <section v-if="links.length" class="social-grid">
    <a
      v-for="(link, index) in links"
      :key="link.kind"
      :href="sanitize(link.url)"
      :aria-label="link.label ?? link.kind"
      :style="{ '--enter-delay': `${index * 70}ms` }"
      target="_blank"
      rel="noopener noreferrer"
      class="social-button"
    >
      <span v-if="link.kind === 'namemc'" class="social-letter" aria-hidden="true">n</span>
      <svg
        v-else
        class="social-icon"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path :d="brandPaths[link.kind]" fill="currentColor" />
      </svg>
      <span class="social-tooltip" aria-hidden="true">{{ link.label ?? link.kind }}</span>
    </a>
  </section>
</template>

<style scoped>
.social-grid {
  position: relative;
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 28rem;
}

.social-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1rem;
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--color-text);
  opacity: 0;
  transform: translateY(10px) scale(0.9);
  animation: social-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--enter-delay, 0ms);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease;
}

.social-tooltip {
  position: absolute;
  top: calc(100% + 0.65rem);
  left: 50%;
  transform: translate(-50%, 4px);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 5;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

.social-button:hover .social-tooltip,
.social-button:focus-visible .social-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.social-button:hover,
.social-button:focus-visible {
  transform: translateY(-3px) scale(1.05);
  color: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow:
    0 0 0 1px var(--color-accent),
    0 0 24px var(--color-glow);
  outline: none;
  z-index: 40;
}

.social-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.25s ease;
}

.social-letter {
  font-family: 'Minecraftia', 'Monocraft', monospace;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  color: currentColor;
  margin: 0.7rem 0 0 0.15rem;
  transition: transform 0.25s ease;
  transform-origin: center;
}

.social-button:hover .social-icon {
  animation: social-jiggle 0.6s ease;
}

.social-button:hover .social-letter {
  animation: social-jiggle 0.6s ease;
}

@keyframes social-pop {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes social-jiggle {
  0% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-12deg) scale(1.15);
  }
  50% {
    transform: rotate(8deg) scale(1.1);
  }
  75% {
    transform: rotate(-4deg) scale(1.12);
  }
  100% {
    transform: rotate(0deg) scale(1.1);
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import { profile } from '@/config/profile'

// 👇 Чтобы добавить кастомные ссылки — редактируй src/config/profile.ts → customLinks
const links = computed(() =>
  profile.customLinks.filter((link) => link.enabled && link.url.trim().length > 0),
)

const sanitize = (url: string): string => {
  if (/^https?:\/\//i.test(url)) return url
  if (/^mailto:/i.test(url)) return url
  return '#'
}
</script>

<template>
  <section v-if="links.length" class="custom-links">
    <a
      v-for="link in links"
      :key="link.url"
      :href="sanitize(link.url)"
      target="_blank"
      rel="noopener noreferrer"
      class="custom-link glass-card"
    >
      <span v-if="link.icon" class="custom-icon" aria-hidden="true">{{ link.icon }}</span>
      <span class="custom-text">
        <span class="custom-title">{{ link.title }}</span>
        <span v-if="link.description" class="custom-description">{{ link.description }}</span>
      </span>
      <ExternalLink class="custom-external" :size="16" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.custom-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 28rem;
}

.custom-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  color: var(--color-text);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.custom-link:hover,
.custom-link:focus-visible {
  transform: translateY(-2px);
  border-color: var(--color-accent);
  box-shadow: 0 0 24px var(--color-glow);
  outline: none;
}

.custom-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.custom-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
}

.custom-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.custom-description {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.custom-external {
  color: var(--color-text-muted);
  flex-shrink: 0;
}
</style>

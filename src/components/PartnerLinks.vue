<script setup lang="ts">
interface PartnerLink {
  name: string
  url: string
  iconUrl: string
}

const partners: PartnerLink[] = [
  {
    name: 'cistiers.com',
    url: 'https://cistiers.com',
    iconUrl: 'https://www.google.com/s2/favicons?domain=cistiers.com&sz=64',
  },
  {
    name: 'cisprac.xyz',
    url: 'https://cisprac.xyz',
    iconUrl: 'https://www.google.com/s2/favicons?domain=cisprac.xyz&sz=64',
  },
]
</script>

<template>
  <section class="partners">
    <a
      v-for="partner in partners"
      :key="partner.url"
      :href="partner.url"
      target="_blank"
      rel="noopener noreferrer"
      class="partner glass-card"
    >
      <span class="partner-icon-wrap">
        <img class="partner-icon" :src="partner.iconUrl" :alt="partner.name" loading="lazy" />
      </span>
      <span class="partner-name">{{ partner.name }}</span>
      <span class="partner-shine" aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.partners {
  width: 100%;
  max-width: 28rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.partner {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border-radius: 0.85rem;
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.partner:hover,
.partner:focus-visible {
  transform: translateY(-2px);
  border-color: var(--color-accent);
  box-shadow: 0 0 22px var(--color-glow);
  outline: none;
}

.partner-icon-wrap {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 0.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.partner:hover .partner-icon-wrap {
  transform: rotate(-12deg) scale(1.1);
}

.partner-icon {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
}

.partner-name {
  font-family: 'Minecraftia', 'Monocraft', monospace;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  text-shadow: 0 0 12px var(--color-glow);
  transform: translateY(0.4rem);
}

.partner-shine {
  position: absolute;
  top: 0;
  left: -120%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent,
    rgba(255, 255, 255, 0.08),
    transparent
  );
  transform: skewX(-20deg);
  transition: left 0.7s ease;
  pointer-events: none;
}

.partner:hover .partner-shine {
  left: 130%;
}
</style>

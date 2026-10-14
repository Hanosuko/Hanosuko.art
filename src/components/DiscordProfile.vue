<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import type { SocialLink } from '@/types/profile'
import { useDiscordProfile } from '@/composables/useDiscordProfile'
import { useProgressiveImage } from '@/composables/useProgressiveImage'
import BrandIcon from '@/components/BrandIcon.vue'
import DiscordActivity from '@/components/DiscordActivity.vue'

// 👇 Discord ID — в src/config/profile.ts → discord. «Обо мне» — identity.bio, соцсети — social
const { identity, discord } = profile

const {
  displayName,
  username,
  avatarUrl,
  decoration,
  banner,
  bannerColor,
  clan,
  badges,
  createdAt,
  status,
  customStatus,
  activities,
  spotify,
} = useDiscordProfile(discord.userId)

const bannerSrc = useProgressiveImage(() => banner.value)
const decorationSrc = useProgressiveImage(() => decoration.value)

const name = computed(() => displayName.value ?? identity.nickname)
const avatar = computed(() => avatarUrl.value ?? identity.avatarUrl)

const STATUS_LABELS = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' } as const
const statusLabel = computed(() => (status.value ? STATUS_LABELS[status.value] : null))

const memberSince = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(
  createdAt,
)

const connections = computed(() => profile.social.filter((link) => link.url.trim().length > 0))

const sanitize = (url: string): string => (/^https?:\/\//i.test(url) ? url : '#')

// Ник из ссылки: t.me/hanosuko → hanosuko, tiktok.com/@hanosuko → hanosuko
const handleOf = (link: SocialLink): string => {
  if (link.handle) return link.handle
  try {
    const segment = new URL(link.url).pathname.split('/').filter(Boolean).pop()
    return segment ? decodeURIComponent(segment).replace(/^@/, '') : new URL(link.url).host
  } catch {
    return link.label ?? link.kind
  }
}

const hideBrokenImage = (event: Event): void => {
  ;(event.target as HTMLImageElement).style.visibility = 'hidden'
}
</script>

<template>
  <section class="dc glass-card" aria-label="Discord profile">
    <div class="dc-banner" :style="{ backgroundColor: bannerColor ?? undefined }" aria-hidden="true">
      <img v-if="bannerSrc" class="dc-banner-img" :src="bannerSrc" alt="" @error="hideBrokenImage" />
    </div>

    <div class="dc-header">
      <div class="dc-avatar">
        <img class="dc-avatar-img" :src="avatar" :alt="name" decoding="async" />
        <img v-if="decorationSrc" class="dc-decoration" :src="decorationSrc" alt="" aria-hidden="true" />
        <span
          v-if="status"
          class="dc-status"
          :class="`is-${status}`"
          role="img"
          :aria-label="statusLabel ?? undefined"
          :title="statusLabel ?? undefined"
        />
      </div>

      <div v-if="customStatus" class="dc-bubble">
        <img v-if="customStatus.emojiUrl" class="dc-bubble-emoji" :src="customStatus.emojiUrl" alt="" />
        <span v-else-if="customStatus.emoji">{{ customStatus.emoji }}</span>
        <span v-if="customStatus.text" class="dc-bubble-text">{{ customStatus.text }}</span>
      </div>

      <ul v-if="badges.length" class="dc-badges" aria-label="Badges">
        <li v-for="badge in badges" :key="badge.id" :title="badge.label">
          <img :src="badge.iconUrl" :alt="badge.label" />
        </li>
      </ul>
    </div>

    <div class="dc-panel">
      <h1 class="dc-name">{{ name }}</h1>
      <div class="dc-tagline">
        <span v-if="username">{{ username }}</span>
        <span v-if="clan" class="dc-clan" :title="`Server tag ${clan.tag}`">
          <img v-if="clan.badgeUrl" :src="clan.badgeUrl" alt="" />
          {{ clan.tag }}
        </span>
      </div>

      <div class="dc-divider" />

      <section class="dc-section">
        <h2 class="dc-heading">About me</h2>
        <p class="dc-bio">{{ identity.bio }}</p>
      </section>

      <section class="dc-section">
        <h2 class="dc-heading">Member since</h2>
        <p class="dc-since">
          <BrandIcon kind="discord" />
          <span>{{ memberSince }}</span>
        </p>
      </section>

      <section v-if="spotify || activities.length" class="dc-section dc-activities">
        <h2 class="dc-heading">Activity</h2>
        <DiscordActivity v-for="activity in activities" :key="activity.id" :activity="activity" />
        <DiscordActivity v-if="spotify" :spotify="spotify" />
      </section>

      <section v-if="connections.length" class="dc-section dc-connections-section">
        <h2 class="dc-heading">Connections</h2>
        <ul class="dc-connections">
          <li v-for="(link, index) in connections" :key="link.url" :style="{ '--delay': `${index * 50}ms` }">
            <a class="dc-connection" :href="sanitize(link.url)" target="_blank" rel="noopener noreferrer">
              <span class="dc-connection-icon"><BrandIcon :kind="link.kind" /></span>
              <span class="dc-connection-text">
                <span class="dc-connection-label">{{ link.label ?? link.kind }}</span>
                <span class="dc-connection-handle">{{ handleOf(link) }}</span>
              </span>
              <ExternalLink class="dc-connection-arrow" :size="14" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.dc {
  /* Цвет карточки под стеклом — им закрашены кольца вокруг аватара и статуса, как «вырез» */
  --dc-card: #1a1a1a;
  --dc-avatar: 6rem;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
}

.dc-banner {
  height: 9rem;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.dc-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dc-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: calc(var(--dc-avatar) / 2 + 0.75rem);
  padding: 0 1rem 0 1.1rem;
}

.dc-avatar {
  position: relative;
  width: calc(var(--dc-avatar) + 0.75rem);
  height: calc(var(--dc-avatar) + 0.75rem);
  margin-top: calc(var(--dc-avatar) / -2 - 0.375rem);
  padding: 0.375rem;
  border-radius: 9999px;
  background: var(--dc-card);
  flex-shrink: 0;
}

.dc-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  object-fit: cover;
  display: block;
  background: var(--color-background);
}

/* Украшение аватара больше самого аватара на 20%, как в Discord */
.dc-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--dc-avatar) * 1.2);
  height: calc(var(--dc-avatar) * 1.2);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.dc-status {
  position: absolute;
  right: 0.2rem;
  bottom: 0.2rem;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  border: 0.3rem solid var(--dc-card);
  box-sizing: border-box;
}

.dc-status.is-online {
  background: #23a55a;
}

/* Полумесяц, как у Discord */
.dc-status.is-idle {
  background: radial-gradient(circle at 25% 25%, var(--dc-card) 0 38%, #f0b232 39%);
}

.dc-status.is-dnd {
  background: #f23f43;
}

.dc-status.is-dnd::after {
  content: '';
  position: absolute;
  inset: 40% 20%;
  border-radius: 9999px;
  background: var(--dc-card);
}

.dc-status.is-offline {
  background: radial-gradient(circle, var(--dc-card) 0 32%, #80848e 33%);
}

/* Кастомный статус — «облачко мысли» справа от аватара, заходит на баннер.
   Обычный flex-элемент между аватаром и значками: ужимается, а не наезжает на них */
.dc-bubble {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  margin: -1.6rem auto 0 0.2rem;
  padding: 0.45rem 0.7rem;
  border-radius: 0.9rem;
  background: var(--dc-card);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  font-size: 0.75rem;
  line-height: 1.3;
}

.dc-bubble::before {
  content: '';
  position: absolute;
  left: -0.55rem;
  bottom: -0.2rem;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  background: var(--dc-card);
}

.dc-bubble-emoji {
  width: 1.1rem;
  height: 1.1rem;
}

.dc-bubble-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.dc-badges {
  list-style: none;
  flex-shrink: 0;
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.15rem;
  margin-top: 0.6rem;
  margin-bottom: 0;
  padding: 0.25rem 0.35rem;
  border-radius: 0.6rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dc-badges img {
  width: 1.35rem;
  height: 1.35rem;
  display: block;
}

.dc-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 0 0.75rem 0.75rem;
  padding: 1rem 1.1rem 1.15rem;
  border-radius: 1.1rem;
  background: rgba(255, 255, 255, 0.025);
}

.dc-name {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.dc-tagline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.dc-clan {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.1rem 0.45rem;
  border-radius: 0.4rem;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 700;
}

.dc-clan img {
  width: 0.9rem;
  height: 0.9rem;
}

.dc-divider {
  height: 1px;
  margin: 0.9rem 0 0.2rem;
  background: rgba(255, 255, 255, 0.07);
}

.dc-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.85rem;
}

.dc-heading {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.dc-bio,
.dc-since {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
}

.dc-bio {
  white-space: pre-line;
}

.dc-since {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.dc-since :deep(.brand-icon) {
  color: #8c9eff;
}

.dc-activities {
  gap: 0.85rem;
}

/* Соцсети прижаты к низу: если карточка выше содержимого, пустота остаётся над ними, а не под */
.dc-connections-section {
  margin-top: auto;
  padding-top: 0.85rem;
}

.dc-connections {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
}

@container (min-width: 19rem) {
  .dc-connections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.dc-connections li {
  animation: dc-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--delay, 0ms);
}

.dc-connection {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.035);
  color: var(--color-text);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.dc-connection:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 1px;
}

.dc-connection-icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 0.55rem;
  background: rgba(255, 255, 255, 0.06);
  font-size: 1.1rem;
}

.dc-connection-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  line-height: 1.25;
}

.dc-connection-label {
  font-size: 0.68rem;
  color: var(--color-text-muted);
}

.dc-connection-handle {
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dc-connection-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity 0.2s ease;
}

@media (hover: hover) {
  .dc-connection:hover {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-1px);
  }

  .dc-connection:hover .dc-connection-arrow {
    opacity: 1;
  }

  .dc-connection:hover .dc-connection-icon {
    animation: dc-jiggle 0.6s ease;
  }
}

/* На тач-экранах стрелка видна всегда — наведения нет */
@media (hover: none) {
  .dc-connection-arrow {
    opacity: 0.6;
  }
}

/* Узкая плитка (телефон) */
@container (max-width: 24rem) {
  .dc {
    --dc-avatar: 5rem;
  }

  .dc-banner {
    height: 7rem;
  }

  .dc-header {
    padding: 0 0.75rem 0 0.85rem;
  }

  .dc-badges {
    margin-top: 0.5rem;
  }

  .dc-panel {
    margin: 0 0.5rem 0.5rem;
    padding: 0.9rem 0.85rem 1rem;
  }

  .dc-name {
    font-size: 1.35rem;
  }

  .dc-connection {
    gap: 0.5rem;
    padding: 0.5rem 0.55rem;
  }

  .dc-connection-icon {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1rem;
  }

  /* В две колонки места мало — стрелку убираем, вся плашка и так ссылка */
  .dc-connection-arrow {
    display: none;
  }
}

@keyframes dc-pop {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@keyframes dc-jiggle {
  25% {
    transform: rotate(-10deg) scale(1.08);
  }
  50% {
    transform: rotate(7deg) scale(1.05);
  }
  75% {
    transform: rotate(-3deg) scale(1.06);
  }
}
</style>

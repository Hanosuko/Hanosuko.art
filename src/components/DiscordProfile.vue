<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import type { SocialLink } from '@/types/profile'
import { useDiscordProfile } from '@/composables/useDiscordProfile'
import { useProgressiveImage } from '@/composables/useProgressiveImage'
import { profileThemeTokens } from '@/utils/discordTheme'
import BrandIcon from '@/components/BrandIcon.vue'
import DiscordActivity from '@/components/DiscordActivity.vue'

// 👇 Всё про карточку — в src/config/profile.ts → discord. «Обо мне» — identity.bio, соцсети — social
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

// Тема Nitro из конфига → CSS-переменные карточки; без темы — тёмная стеклянная карточка сайта
const theme = discord.theme ? profileThemeTokens(discord.theme) : null
const themeStyle = theme
  ? {
      '--dc-bg': theme.background,
      '--dc-ring': theme.ring,
      '--dc-text': theme.text,
      '--dc-muted': theme.muted,
      '--dc-surface': theme.surface,
      '--dc-border': theme.border,
      '--dc-bubble': theme.bubble,
    }
  : undefined

const nameStyle = discord.nameStyle
const nameFont = nameStyle ? { fontFamily: `'${nameStyle.font}', serif` } : undefined

// Значки из конфига целиком заменяют автоматические (API знает только HypeSquad и Nitro)
const badgeList = computed(() => discord.badges ?? badges.value)

// «Коллекция игр»: три иконки, четвёртая затемнена и с «+N», как в Discord
const games = discord.games
const shownGames = games ? games.items.slice(0, games.more ? 3 : 4) : []
const moreGamesTile = games?.more ? (games.items[3] ?? null) : null

const STATUS_LABELS = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' } as const
const statusLabel = computed(() => (status.value ? STATUS_LABELS[status.value] : null))

const memberSince = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(
  createdAt,
)

const discordUrl = `https://discord.com/users/${discord.userId}`

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
  <section
    class="dc"
    :class="theme ? `is-themed is-${theme.mode}` : 'glass-card'"
    :style="themeStyle"
    aria-label="Discord profile"
  >
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

      <!-- Кастомный статус — «облачко мысли», как в Discord -->
      <div v-if="customStatus" class="dc-bubble">
        <img v-if="customStatus.emojiUrl" class="dc-bubble-emoji" :src="customStatus.emojiUrl" alt="" />
        <span v-else-if="customStatus.emoji">{{ customStatus.emoji }}</span>
        <span v-if="customStatus.text" class="dc-bubble-text">{{ customStatus.text }}</span>
      </div>
    </div>

    <div class="dc-body">
      <h1 class="dc-name" :class="{ 'is-toon': nameStyle?.effect === 'toon' }" :style="nameFont">{{ name }}</h1>

      <div class="dc-tagline">
        <span v-if="username">{{ username }}</span>
        <template v-if="discord.pronouns">
          <span aria-hidden="true">•</span>
          <span class="dc-pronouns">{{ discord.pronouns }}</span>
        </template>
        <span v-if="clan" class="dc-clan" :title="`Server tag ${clan.tag}`">
          <img v-if="clan.badgeUrl" :src="clan.badgeUrl" alt="" />
          {{ clan.tag }}
        </span>
      </div>

      <ul v-if="badgeList.length" class="dc-badges" aria-label="Badges">
        <li v-for="badge in badgeList" :key="badge.label" class="dc-badge" tabindex="0" :aria-label="badge.label">
          <img :src="badge.iconUrl" alt="" @error="hideBrokenImage" />
          <span class="dc-badge-tip" aria-hidden="true">{{ badge.label }}</span>
        </li>
      </ul>

      <a class="dc-open" :href="discordUrl" target="_blank" rel="noopener noreferrer">
        <BrandIcon kind="discord" />
        <span>Open in Discord</span>
      </a>

      <section class="dc-section">
        <h2 class="dc-heading">About me</h2>
        <p class="dc-bio">{{ identity.bio }}</p>
      </section>

      <div v-if="games" class="dc-games">
        <span class="dc-games-label">Game collection</span>
        <ul class="dc-games-list">
          <li v-for="game in shownGames" :key="game.name" :title="game.name">
            <img :src="game.iconUrl" :alt="game.name" loading="lazy" @error="hideBrokenImage" />
          </li>
          <li v-if="games.more" class="dc-games-more" :title="`+${games.more} more`">
            <img v-if="moreGamesTile" :src="moreGamesTile.iconUrl" alt="" loading="lazy" @error="hideBrokenImage" />
            <span>+{{ games.more }}</span>
          </li>
        </ul>
      </div>

      <section class="dc-section">
        <h2 class="dc-heading">Member since</h2>
        <p class="dc-text">{{ memberSince }}</p>
      </section>

      <section v-if="spotify || activities.length" class="dc-section">
        <h2 class="dc-heading">Activity</h2>
        <div class="dc-activities">
          <DiscordActivity v-for="activity in activities" :key="activity.id" :activity="activity" />
          <DiscordActivity v-if="spotify" :spotify="spotify" />
        </div>
      </section>

      <section v-if="connections.length" class="dc-section dc-connections-section">
        <h2 class="dc-heading">Connections</h2>
        <ul class="dc-connections">
          <li v-for="link in connections" :key="link.url">
            <a class="dc-connection" :href="sanitize(link.url)" target="_blank" rel="noopener noreferrer">
              <span class="dc-connection-icon"><BrandIcon :kind="link.kind" /></span>
              <span class="dc-connection-text">
                <span class="dc-connection-handle">{{ handleOf(link) }}</span>
                <span class="dc-connection-label">{{ link.label ?? link.kind }}</span>
              </span>
              <ArrowUpRight class="dc-connection-arrow" :size="15" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
/* Токены по умолчанию — тёмная карточка сайта; тема Nitro переопределяет их через style */
.dc {
  --dc-bg: transparent;
  --dc-ring: #1a1a1a;
  --dc-text: var(--color-text);
  --dc-muted: var(--color-text-muted);
  --dc-surface: rgba(255, 255, 255, 0.04);
  --dc-border: rgba(255, 255, 255, 0.07);
  --dc-bubble: #232323;
  --dc-avatar: 6rem;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
  color: var(--dc-text);
  /* Как в Discord: чистый гротеск вместо пиксельного шрифта сайта (gg sans не распространяется) */
  font-family: 'gg sans', 'Noto Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.dc.is-themed {
  background: var(--dc-bg);
  border: 1px solid var(--dc-border);
  box-shadow: 0 10px 40px -12px rgba(0, 0, 0, 0.7);
}

.dc-banner {
  aspect-ratio: 2.8 / 1;
  max-height: 11rem;
  background: rgba(127, 127, 127, 0.15);
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
  gap: 0.75rem;
  min-height: calc(var(--dc-avatar) / 2 + 0.5rem);
  padding: 0 1rem 0 1.1rem;
}

.dc-avatar {
  position: relative;
  width: calc(var(--dc-avatar) + 0.75rem);
  height: calc(var(--dc-avatar) + 0.75rem);
  margin-top: calc(var(--dc-avatar) / -2 - 0.375rem);
  padding: 0.375rem;
  border-radius: 9999px;
  background: var(--dc-ring);
  flex-shrink: 0;
}

.dc-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  object-fit: cover;
  display: block;
  background: var(--dc-surface);
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
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 9999px;
  border: 0.32rem solid var(--dc-ring);
  box-sizing: border-box;
}

.dc-status.is-online {
  background: #23a55a;
}

/* Полумесяц, как у Discord */
.dc-status.is-idle {
  background: radial-gradient(circle at 25% 25%, var(--dc-ring) 0 38%, #f0b232 39%);
}

.dc-status.is-dnd {
  background: #f23f43;
}

.dc-status.is-dnd::after {
  content: '';
  position: absolute;
  inset: 40% 20%;
  border-radius: 9999px;
  background: var(--dc-ring);
}

.dc-status.is-offline {
  background: radial-gradient(circle, var(--dc-ring) 0 32%, #80848e 33%);
}

/* Облачко мысли: плашка и два кружка в сторону аватара */
.dc-bubble {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  margin: -1.4rem 0 0 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 1rem;
  background: var(--dc-bubble);
  color: var(--dc-text);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  font-size: 0.85rem;
  line-height: 1.3;
}

.dc-bubble::before,
.dc-bubble::after {
  content: '';
  position: absolute;
  border-radius: 9999px;
  background: var(--dc-bubble);
}

.dc-bubble::before {
  left: 0.6rem;
  top: -0.45rem;
  width: 0.85rem;
  height: 0.85rem;
}

.dc-bubble::after {
  left: -0.35rem;
  top: -0.9rem;
  width: 0.45rem;
  height: 0.45rem;
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

.dc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0.6rem 1.25rem 1.25rem;
}

.dc-name {
  margin: 0;
  font-size: 1.95rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

/* Эффект toon из Discord: белая заливка, тёмный контур и тень со сдвигом */
.dc-name.is-toon {
  color: #f2f2f2;
  -webkit-text-stroke: 0.14em #161616;
  paint-order: stroke fill;
  text-shadow: 0.07em 0.07em 0 #161616;
  letter-spacing: 0.01em;
}

.dc-tagline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.45rem;
  margin-top: 0.35rem;
  font-size: 0.92rem;
  color: var(--dc-muted);
}

.dc-pronouns {
  overflow-wrap: anywhere;
}

.dc-clan {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  color: var(--dc-text);
  font-size: 0.78rem;
  font-weight: 700;
}

.dc-clan img {
  width: 0.95rem;
  height: 0.95rem;
}

.dc-badges {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin: 0.6rem 0 0;
  padding: 0;
}

.dc-badge {
  position: relative;
  outline: none;
}

.dc-badge img {
  display: block;
  width: 1.45rem;
  height: 1.45rem;
  object-fit: contain;
}

/* Подсказка над значком, как в Discord */
.dc-badge-tip {
  position: absolute;
  bottom: calc(100% + 0.45rem);
  left: 50%;
  z-index: 5;
  padding: 0.35rem 0.6rem;
  border-radius: 0.4rem;
  background: #111214;
  color: #f2f3f5;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 3px);
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.dc-badge:focus-visible .dc-badge-tip {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (hover: hover) {
  .dc-badge:hover .dc-badge-tip {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.dc-open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-top: 0.9rem;
  padding: 0.55rem 1rem;
  border-radius: 0.55rem;
  background: #5865f2;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  transition: background 0.2s ease;
}

.dc-open :deep(.brand-icon) {
  font-size: 1.1rem;
}

.dc-open:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

@media (hover: hover) {
  .dc-open:hover {
    background: #4752c4;
  }
}

.dc-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 1.1rem;
}

.dc-heading {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--dc-text);
}

.dc-bio,
.dc-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.4;
}

.dc-bio {
  white-space: pre-line;
}

.dc-games {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  background: var(--dc-surface);
}

.dc-games-label {
  font-size: 0.88rem;
  font-weight: 600;
}

.dc-games-list {
  list-style: none;
  display: flex;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
}

.dc-games-list li {
  position: relative;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 0.45rem;
  overflow: hidden;
  background: var(--dc-surface);
}

.dc-games-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dc-games-more img {
  filter: brightness(0.35);
}

.dc-games-more span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
}

.dc-activities {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--dc-surface);
}

/* Соцсети прижаты к низу: если карточка выше содержимого, пустота остаётся над ними, а не под */
.dc-connections-section {
  margin-top: auto;
  padding-top: 1.1rem;
}

.dc-connections {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.15rem 0.75rem;
}

@container (min-width: 19rem) {
  .dc-connections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Строка как в «Интеграциях» Discord: иконка в плашке, ник и стрелка */
.dc-connection {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.4rem 0.35rem 0;
  border-radius: 0.6rem;
  color: var(--dc-text);
}

.dc-connection:focus-visible {
  outline: 2px solid var(--dc-muted);
  outline-offset: 1px;
}

.dc-connection-icon {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
  border-radius: 0.6rem;
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  font-size: 1.05rem;
}

/* В светлой теме иконки на белых плашках, как в Discord */
.dc.is-light .dc-connection-icon {
  background: #fff;
}

.dc-connection-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  line-height: 1.25;
}

.dc-connection-handle {
  font-size: 0.92rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dc-connection-label {
  font-size: 0.72rem;
  color: var(--dc-muted);
}

.dc-connection-arrow {
  flex-shrink: 0;
  color: var(--dc-muted);
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

@media (hover: hover) {
  .dc-connection:hover .dc-connection-handle {
    text-decoration: underline;
  }

  .dc-connection:hover .dc-connection-arrow {
    opacity: 1;
  }
}

/* Узкая плитка (телефон) */
@container (max-width: 24rem) {
  .dc {
    --dc-avatar: 5rem;
  }

  .dc-header {
    padding: 0 0.75rem 0 0.85rem;
  }

  .dc-body {
    padding: 0.5rem 0.95rem 1.05rem;
  }

  .dc-name {
    font-size: 1.6rem;
  }

  .dc-games-list li {
    width: 2rem;
    height: 2rem;
  }

  .dc-connection-arrow {
    display: none;
  }
}
</style>

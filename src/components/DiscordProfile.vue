<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link2 } from 'lucide-vue-next'
import { ArrowRight, ArrowUpRight } from 'lucide'
import { MorphIcon } from 'morphicons/vue'
import { profile } from '@/config/profile'
import type { SocialLink } from '@/types/profile'
import { useDiscordProfile } from '@/composables/useDiscordProfile'
import { useProgressiveImage } from '@/composables/useProgressiveImage'
import { profileThemeTokens } from '@/utils/discordTheme'
import { connectionRowOf, type ConnectionRow } from '@/utils/discordConnections'
import BrandIcon from '@/components/BrandIcon.vue'
import DiscordActivity from '@/components/DiscordActivity.vue'
import ProfileEffect from '@/components/ProfileEffect.vue'

// 👇 Всё про карточку — в src/config/profile.ts → discord. «Обо мне» — identity.bio,
// интеграции — discord.connections, после них ссылки из social
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

const STATUS_LABELS = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' } as const
const statusLabel = computed(() => (status.value ? STATUS_LABELS[status.value] : null))

const dateFormat = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
const memberSince = dateFormat.format(createdAt)

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

const socialRow = (link: SocialLink): ConnectionRow => ({
  key: link.url,
  type: link.kind,
  kind: link.kind,
  name: handleOf(link),
  url: sanitize(link.url),
  since: null,
  stats: [],
})

// Сначала интеграции из Discord, потом ссылки из social на сервисы, которых среди них нет
const fromDiscord = (discord.connections ?? []).map(connectionRowOf)
const covered = new Set(fromDiscord.map((row) => row.type))
const connectionRows: ConnectionRow[] = [
  ...fromDiscord,
  ...profile.social.filter((link) => link.url.trim().length > 0 && !covered.has(link.kind)).map(socialRow),
]

// Ссылка интеграции под курсором: её стрелка поворачивается вправо
const hoveredConnection = ref<string | null>(null)

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
    <ProfileEffect v-if="discord.profileEffect" :effect="discord.profileEffect" />

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

      <section class="dc-section">
        <h2 class="dc-heading">About me</h2>
        <p class="dc-bio">{{ identity.bio }}</p>
      </section>

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

      <section v-if="connectionRows.length" class="dc-section dc-connections-section">
        <h2 class="dc-heading">Connections</h2>
        <ul class="dc-connections">
          <li v-for="row in connectionRows" :key="row.key" class="dc-connection">
            <span class="dc-connection-icon" :class="`is-${row.type}`">
              <BrandIcon v-if="row.kind" :kind="row.kind" />
              <Link2 v-else :size="18" aria-hidden="true" />
            </span>
            <div class="dc-connection-body">
              <a
                v-if="row.url"
                class="dc-connection-name"
                :href="row.url"
                target="_blank"
                rel="noopener noreferrer"
                @pointerenter="hoveredConnection = row.key"
                @pointerleave="hoveredConnection = null"
                @focus="hoveredConnection = row.key"
                @blur="hoveredConnection = null"
              >
                <span>{{ row.name }}</span>
                <MorphIcon
                  :icon="hoveredConnection === row.key ? ArrowRight : ArrowUpRight"
                  :size="16"
                  :stroke-width="2.4"
                  spring="snappy"
                  reduced-motion="user"
                />
              </a>
              <span v-else class="dc-connection-name">{{ row.name }}</span>
              <p v-if="row.since" class="dc-connection-line">Member since {{ dateFormat.format(row.since) }}</p>
              <p v-if="row.stats.length" class="dc-connection-stats">
                <span
                  v-for="stat in row.stats"
                  :key="`${stat.prefix ?? ''}${stat.title ?? ''}`"
                  class="dc-stat"
                  :class="{ 'has-icon': stat.iconUrl }"
                  :title="stat.title"
                >
                  <img v-if="stat.iconUrl" :src="stat.iconUrl" :alt="stat.title ?? ''" loading="lazy" @error="hideBrokenImage" />
                  <span v-if="stat.prefix">{{ stat.prefix }}</span>
                  <b>{{ stat.value }}</b>
                  <span v-if="stat.suffix">{{ stat.suffix }}</span>
                </span>
              </p>
            </div>
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
  --dc-avatar: 5.25rem;
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
  max-height: 9.5rem;
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
  padding: 0.5rem 1.1rem 1.1rem;
}

.dc-name {
  margin: 0;
  font-size: 1.7rem;
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
  margin-top: 0.3rem;
  font-size: 0.86rem;
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

.dc-section {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.9rem;
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
  font-size: 0.86rem;
  line-height: 1.4;
}

.dc-bio {
  white-space: pre-line;
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
  padding-top: 0.9rem;
}

.dc-connections {
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Строка как в «Интеграциях» Discord: иконка в плашке, ник со стрелкой и цифры под ним */
.dc-connection {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.dc-connection-icon {
  display: grid;
  place-items: center;
  width: 2.15rem;
  height: 2.15rem;
  flex-shrink: 0;
  border-radius: 0.6rem;
  background: var(--dc-surface);
  border: 1px solid var(--dc-border);
  font-size: 1.15rem;
}

/* В светлой теме — белые плашки и фирменные цвета, как в Discord */
.dc.is-light .dc-connection-icon {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  color: #111;
}

.dc.is-light .dc-connection-icon.is-twitch {
  color: #9146ff;
}

.dc.is-light .dc-connection-icon.is-xbox {
  color: #107c10;
}

.dc.is-light .dc-connection-icon.is-youtube {
  color: #ff0000;
}

.dc.is-light .dc-connection-icon.is-telegram {
  color: #229ed9;
}

.dc.is-light .dc-connection-icon.is-modrinth {
  color: #1bd96a;
}

.dc-connection-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
  /* Ник по центру иконки, даже если строк с цифрами нет */
  padding-top: 0.4rem;
}

.dc-connection-name {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  align-self: flex-start;
  max-width: 100%;
  color: var(--dc-text);
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.25;
}

.dc-connection-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dc-connection-name svg {
  flex-shrink: 0;
}

a.dc-connection-name:focus-visible {
  outline: 2px solid var(--dc-muted);
  outline-offset: 2px;
  border-radius: 0.3rem;
}

@media (hover: hover) {
  a.dc-connection-name:hover span {
    text-decoration: underline;
  }
}

.dc-connection-line,
.dc-connection-stats {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: var(--dc-text);
}

.dc-connection-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.75rem;
  margin-top: 0.15rem;
  color: var(--dc-muted);
}

.dc-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.dc-stat b {
  font-weight: 400;
}

/* Предметы игры: круглая иконка и жирное число, как в Discord */
.dc-stat.has-icon b {
  font-weight: 700;
  color: var(--dc-text);
}

.dc-stat img {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #fff;
  object-fit: cover;
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
    font-size: 1.55rem;
  }
}
</style>

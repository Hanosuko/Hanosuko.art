import type { DstnConnection } from '@/types/discord'
import type { SocialKind } from '@/types/profile'

// Интеграции Discord («Connections») → строки карточки: ссылка, иконка и цифры из metadata, как в самом Discord

export interface ConnectionStat {
  prefix?: string
  value: string
  suffix?: string
  iconUrl?: string
  title?: string
}

export interface ConnectionRow {
  key: string
  type: string
  // Иконка из BrandIcon; null — сервиса нет в наборе, рисуется простая ссылка
  kind: SocialKind | null
  name: string
  // У Epic Games и Xbox нет публичной страницы — Discord показывает их без ссылки
  url: string | null
  since: Date | null
  stats: ConnectionStat[]
}

const ICON_KINDS = new Set<string>(['epicgames', 'steam', 'tiktok', 'twitch', 'xbox', 'youtube', 'github'])

const PROFILE_URLS: Record<string, (account: DstnConnection) => string> = {
  steam: (account) => `https://steamcommunity.com/profiles/${account.id}`,
  tiktok: (account) => `https://www.tiktok.com/@${encodeURIComponent(account.name)}`,
  twitch: (account) => `https://www.twitch.tv/${encodeURIComponent(account.name)}`,
  youtube: (account) => `https://www.youtube.com/channel/${account.id}`,
  github: (account) => `https://github.com/${encodeURIComponent(account.name)}`,
  reddit: (account) => `https://www.reddit.com/user/${encodeURIComponent(account.name)}`,
  twitter: (account) => `https://x.com/${encodeURIComponent(account.name)}`,
  spotify: (account) => `https://open.spotify.com/user/${account.id}`,
  domain: (account) => `https://${account.name}`,
}

// Иконки игр, у которых Steam считает предметы инвентаря
const STEAM_ITEMS = [
  { key: 'item_count_dota2', title: 'Dota 2', iconUrl: 'https://cdn.discordapp.com/app-icons/356875988589740042/6b4b3fa4c83555d3008de69d33a60588.png?size=32' },
  { key: 'item_count_tf2', title: 'Team Fortress 2', iconUrl: 'https://cdn.discordapp.com/app-icons/356888577310851072/f903d1168b9f975761f53b91e1a20b26.png?size=32' },
]

const numberFormat = new Intl.NumberFormat('en-US')

const count = (value: string | boolean | undefined): string | null => {
  const parsed = Number(value)
  return value !== undefined && Number.isFinite(parsed) ? numberFormat.format(parsed) : null
}

const statsOf = (account: DstnConnection): ConnectionStat[] => {
  const metadata = account.metadata ?? {}
  const stats: ConnectionStat[] = []

  if (account.type === 'steam') {
    const games = count(metadata.game_count)
    if (games) stats.push({ prefix: 'Games:', value: games })
    for (const item of STEAM_ITEMS) {
      const items = count(metadata[item.key])
      if (items) stats.push({ value: items, suffix: items === '1' ? 'item' : 'items', iconUrl: item.iconUrl, title: item.title })
    }
  }

  if (account.type === 'tiktok') {
    const fields = [
      ['Followers:', metadata.follower_count],
      ['Following:', metadata.following_count],
      ['Likes:', metadata.likes_count],
    ] as const
    for (const [prefix, raw] of fields) {
      const value = count(raw)
      if (value) stats.push({ prefix, value })
    }
  }

  return stats
}

export const connectionRowOf = (account: DstnConnection): ConnectionRow => {
  const createdAt = account.metadata?.created_at
  const since = typeof createdAt === 'string' ? new Date(createdAt) : null
  return {
    key: `${account.type}:${account.id}`,
    type: account.type,
    kind: ICON_KINDS.has(account.type) ? (account.type as SocialKind) : null,
    name: account.name,
    url: PROFILE_URLS[account.type]?.(account) ?? null,
    since: since && !Number.isNaN(since.getTime()) ? since : null,
    stats: statsOf(account),
  }
}

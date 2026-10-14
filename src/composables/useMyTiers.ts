import { computed, ref, shallowRef } from 'vue'
import type {
  KitTier,
  MyTiersGuild,
  MyTiersGuildsResponse,
  MyTiersPlayer,
  TierPosition,
  UnrankedKit,
} from '@/types/mytiers'

// Очки за тир — как на mytiers.ru
const TIER_POINTS: Record<number, Record<TierPosition, number>> = {
  1: { HT: 60, LT: 45 },
  2: { HT: 30, LT: 20 },
  3: { HT: 10, LT: 6 },
  4: { HT: 4, LT: 3 },
  5: { HT: 2, LT: 1 },
}

// Цвет тира, если для кита не задан свой цвет
const TIER_FALLBACK_COLORS: Record<string, string> = {
  HT1: '#fbd769',
  LT1: '#d9af4d',
  HT2: '#9fc8f1',
  LT2: '#739fd0',
  HT3: '#e99c68',
  LT3: '#c17345',
  HT4: '#77a599',
  LT4: '#607f77',
  HT5: '#808bab',
  LT5: '#656c80',
}

const TIER_RE = /^(R)?(HT|LT)([1-5])$/i

interface ParsedTier {
  tier: number
  pos: TierPosition
  retired: boolean
}

const parseTier = (raw: string | undefined): ParsedTier | null => {
  const match = raw ? TIER_RE.exec(raw.trim()) : null
  if (!match) return null
  return {
    retired: Boolean(match[1]),
    pos: match[2].toUpperCase() as TierPosition,
    tier: Number(match[3]),
  }
}

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return (await response.json()) as T
}

export function useMyTiers(siteUrl: string, username: string, kitColors: Record<string, string>) {
  const player = shallowRef<MyTiersPlayer | null>(null)
  const guilds = shallowRef<MyTiersGuild[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const iconUrlFor = (guild: MyTiersGuild): string =>
    new URL(guild.logo_url ?? '/tier_icons/overall.svg', siteUrl).href

  const kits = computed(() => {
    const ranked: KitTier[] = []
    const unranked: UnrankedKit[] = []
    const current = player.value
    if (!current) return { ranked, unranked }

    for (const guild of guilds.value) {
      const parsed = parseTier(current[`${guild.slug}Tiers`]?.[0])
      if (!parsed) {
        unranked.push({ slug: guild.slug, name: guild.name, iconUrl: iconUrlFor(guild) })
        continue
      }
      const label = `${parsed.pos}${parsed.tier}`
      const peak = parseTier(current[`${guild.slug}PeakTiers`]?.[0])
      ranked.push({
        slug: guild.slug,
        name: guild.name,
        iconUrl: iconUrlFor(guild),
        discordUrl: guild.discord_url,
        color: kitColors[guild.slug] ?? TIER_FALLBACK_COLORS[label] ?? '#b1c0cc',
        ...parsed,
        peak: peak ? `${peak.pos}${peak.tier}` : null,
        points: TIER_POINTS[parsed.tier][parsed.pos],
      })
    }

    // guilds уже отсортированы по sort_order, а sort стабильный
    ranked.sort((a, b) => b.points - a.points)
    return { ranked, unranked }
  })

  const fetchProfile = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const api = new URL('/api/', siteUrl)
      const [playerPayload, guildsPayload] = await Promise.all([
        getJson<MyTiersPlayer>(new URL(`players/${encodeURIComponent(username)}`, api).href),
        getJson<MyTiersGuildsResponse>(new URL('guilds', api).href),
      ])
      guilds.value = [...guildsPayload.guilds].sort((a, b) => a.sort_order - b.sort_order)
      player.value = playerPayload
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'unknown error'
      error.value = message
      console.warn('[mytiers] fetch failed:', message)
    } finally {
      isLoading.value = false
    }
  }

  const avatarUrl = new URL(`/api/avatar/${encodeURIComponent(username)}?s=256`, siteUrl).href
  const profileUrl = new URL(`/player/${encodeURIComponent(username)}`, siteUrl).href

  return { player, kits, isLoading, error, fetchProfile, avatarUrl, profileUrl }
}

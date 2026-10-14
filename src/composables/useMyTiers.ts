import { computed, ref, shallowRef } from 'vue'
import type { MyTiersGuild, MyTiersGuildsResponse, MyTiersPlayer } from '@/types/mytiers'
import type { MyTiersSettings } from '@/types/profile'
import type { KitTier, TierProfile, TierSourceState, UnrankedKit } from '@/types/tiers'
import { localKitIcon, parseTier, sortByPoints, tierColor, tierLabel, tierPoints } from '@/utils/tiers'

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return (await response.json()) as T
}

// MyTiers отдаёт CORS, поэтому данные берутся прямо из браузера
export function useMyTiers(settings: MyTiersSettings): TierSourceState {
  const player = shallowRef<MyTiersPlayer | null>(null)
  const guilds = shallowRef<MyTiersGuild[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const iconUrlFor = (guild: MyTiersGuild): string =>
    localKitIcon('mytiers', guild.slug) ?? new URL(guild.logo_url ?? '/tier_icons/overall.svg', settings.siteUrl).href

  const profile = computed<TierProfile | null>(() => {
    const current = player.value
    if (!current) return null

    const ranked: KitTier[] = []
    const unranked: UnrankedKit[] = []
    for (const guild of guilds.value) {
      const parsed = parseTier(current[`${guild.slug}Tiers`]?.[0])
      if (!parsed) {
        unranked.push({ slug: guild.slug, name: guild.name, iconUrl: iconUrlFor(guild) })
        continue
      }
      const peak = parseTier(current[`${guild.slug}PeakTiers`]?.[0])
      ranked.push({
        slug: guild.slug,
        name: guild.name,
        iconUrl: iconUrlFor(guild),
        color: settings.kitColors[guild.slug] ?? tierColor(parsed),
        ...parsed,
        peak: peak ? tierLabel(peak) : null,
        points: tierPoints(parsed),
      })
    }

    return {
      nickname: current.nickname,
      rank: current.rank > 0 ? current.rank : null,
      points: current.overallScore,
      kits: [...sortByPoints(ranked), ...unranked],
    }
  })

  const load = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const api = new URL('/api/', settings.siteUrl)
      const [playerPayload, guildsPayload] = await Promise.all([
        getJson<MyTiersPlayer>(new URL(`players/${encodeURIComponent(settings.username)}`, api).href),
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

  const profileUrl = new URL(`/player/${encodeURIComponent(settings.username)}`, settings.siteUrl).href

  return { profile, isLoading, error, profileUrl, load }
}

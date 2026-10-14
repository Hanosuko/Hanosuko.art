import { computed, ref, shallowRef } from 'vue'
import type { CistiersProfileResponse } from '@/types/cistiers'
import type { CistiersSettings } from '@/types/profile'
import type { KitTier, TierProfile, TierSourceState, UnrankedKit } from '@/types/tiers'
import { localKitIcon, parseTier, sortByPoints, tierColor } from '@/utils/tiers'

// CISTiers не отдаёт CORS, поэтому данные идут через наш прокси /api/cistiers (server/cistiers.js)
export function useCistiers(settings: CistiersSettings): TierSourceState {
  const data = shallowRef<CistiersProfileResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const profile = computed<TierProfile | null>(() => {
    const current = data.value
    if (!current) return null

    const ranked: KitTier[] = []
    const unranked: UnrankedKit[] = []
    for (const kit of current.kits) {
      const iconUrl = localKitIcon('cistiers', kit.slug) ?? kit.iconUrl ?? ''
      const parsed = parseTier(kit.tier)
      if (!parsed) {
        unranked.push({ slug: kit.slug, name: kit.name, iconUrl })
        continue
      }
      ranked.push({
        slug: kit.slug,
        name: kit.name,
        iconUrl,
        discordUrl: kit.discordUrl,
        color: kit.color ?? tierColor(parsed),
        ...parsed,
        peak: null,
        points: kit.points,
      })
    }

    return {
      nickname: current.nickname,
      rank: current.rank,
      points: current.points,
      ranked: sortByPoints(ranked),
      unranked,
    }
  })

  const load = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const url = `${settings.apiUrl}?username=${encodeURIComponent(settings.username)}`
      const response = await fetch(url, { headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error(`cistiers proxy responded ${response.status}`)
      data.value = (await response.json()) as CistiersProfileResponse
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'unknown error'
      error.value = message
      console.warn('[cistiers] fetch failed:', message)
    } finally {
      isLoading.value = false
    }
  }

  const profileUrl = new URL(`/player/${encodeURIComponent(settings.username)}`, settings.siteUrl).href

  return { profile, isLoading, error, profileUrl, load }
}

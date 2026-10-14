import type { ComputedRef, Ref } from 'vue'

// Общая модель тиров: карточка рисует MyTiers и CISTiers одинаково

export type TierSource = 'mytiers' | 'cistiers'

export type TierPosition = 'HT' | 'LT'

export interface KitTier {
  slug: string
  name: string
  iconUrl: string
  color: string
  tier: number
  pos: TierPosition
  retired: boolean
  peak: string | null
  points: number
}

export interface UnrankedKit {
  slug: string
  name: string
  iconUrl: string
}

export interface TierProfile {
  nickname: string
  rank: number | null
  points: number
  ranked: KitTier[]
  unranked: UnrankedKit[]
}

export interface TierSourceState {
  profile: ComputedRef<TierProfile | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  profileUrl: string
  load: () => Promise<void>
}

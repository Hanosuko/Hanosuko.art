export type CistiersKit =
  | 'vanilla'
  | 'sword'
  | 'netherite'
  | 'dpot'
  | 'uhc'
  | 'smp'
  | 'op'
  | 'mace'

export type CistiersTierBadge =
  | 'ht1' | 'lt1'
  | 'ht2' | 'lt2'
  | 'ht3' | 'lt3'
  | 'ht4' | 'lt4'
  | 'ht5' | 'lt5'
  | 'rht1' | 'rlt1'
  | 'rht2' | 'rlt2'
  | 'rht3' | 'rlt3'

export interface CistiersCurrentTier {
  kit: CistiersKit | string
  tier: CistiersTierBadge | string
  points: number
}

export interface CistiersBattle {
  score: string
  comment: string
  opponent: string
}

export interface CistiersTierHistoryEntry {
  id: string
  tier: string
  kit: string
  comment: string
  battles: CistiersBattle[] | null
  date: string
  points: number
}

export interface CistiersResponse {
  type: string
  nickname: string
  customization: Record<string, unknown>
  avatar_url: string
  tier_stats: {
    total_points: number
    current_tiers: CistiersCurrentTier[]
    tier_history: CistiersTierHistoryEntry[]
  }
  is_restricted: boolean
  rank_position: number
  id: string
  created_at: string
  discord_id: string
}

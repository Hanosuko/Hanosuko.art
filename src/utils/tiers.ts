import type { KitTier, TierPosition } from '@/types/tiers'

// Очки за тир — одинаковые на MyTiers и CISTiers
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

// 'HT3', 'lt5', 'RHT1' (R — retired)
const TIER_RE = /^(R)?(HT|LT)([1-5])$/i

export interface ParsedTier {
  tier: number
  pos: TierPosition
  retired: boolean
}

export const parseTier = (raw: string | null | undefined): ParsedTier | null => {
  const match = raw ? TIER_RE.exec(raw.trim()) : null
  if (!match) return null
  return {
    retired: Boolean(match[1]),
    pos: match[2].toUpperCase() as TierPosition,
    tier: Number(match[3]),
  }
}

export const tierLabel = (parsed: ParsedTier): string => `${parsed.pos}${parsed.tier}`

export const tierPoints = (parsed: ParsedTier): number => TIER_POINTS[parsed.tier][parsed.pos]

export const tierColor = (parsed: ParsedTier): string =>
  TIER_FALLBACK_COLORS[tierLabel(parsed)] ?? '#b1c0cc'

// Сначала самые дорогие тиры; sort стабильный, поэтому при равенстве сохраняется порядок китов
export const sortByPoints = (kits: KitTier[]): KitTier[] => kits.sort((a, b) => b.points - a.points)

// Ответ нашего прокси /api/cistiers (server/cistiers.js) поверх публичного API CISTiers

export interface CistiersKit {
  slug: string
  name: string
  iconUrl: string | null
  color: string | null
  discordUrl: string | null
  tier: string | null
  points: number
}

export interface CistiersProfileResponse {
  nickname: string
  points: number
  rank: number | null
  totalPlayers: number
  updatedAt: string | null
  kits: CistiersKit[]
}

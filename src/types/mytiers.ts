// Ответы публичного API https://mytiers.ru/api

export interface MyTiersGuild {
  slug: string
  frontend_id: string
  name: string
  logo_url: string | null
  discord_url: string | null
  sort_order: number
}

export interface MyTiersGuildsResponse {
  success: boolean
  guilds: MyTiersGuild[]
}

// Тиры лежат в полях `${slug}Tiers` и `${slug}PeakTiers`, например swordTiers: ['LT3']
export interface MyTiersPlayer {
  nickname: string
  rank: number
  overallScore: number
  discordId: string | null
  [field: `${string}Tiers`]: string[] | undefined
}

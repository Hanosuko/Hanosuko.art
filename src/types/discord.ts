// Discord-профиль собирается из двух источников:
// dcdn.dstn.to — полный профиль: баннер, клан, значки, интеграции (japi.rest — запасной вариант без значков и интеграций);
// Lanyard — статус и активности в реальном времени (нужно зайти на discord.gg/lanyard).

export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline'

export interface DiscordAvatarDecoration {
  asset: string
}

export interface DiscordClan {
  identity_guild_id: string | null
  identity_enabled?: boolean
  tag: string | null
  badge: string | null
}

// https://japi.rest/discord/v1/user/:id → data
export interface JapiUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
  banner: string | null
  banner_color: string | null
  public_flags: number
  public_flags_array?: string[]
  avatar_decoration_data: DiscordAvatarDecoration | null
  primary_guild?: DiscordClan | null
}

export interface JapiResponse {
  data: JapiUser
}

// https://dcdn.dstn.to/profile/:id — то же, что видит клиент Discord в профиле
export interface DstnConnection {
  type: string
  id: string
  name: string
  verified: boolean
  // Значения приходят строками: game_count, follower_count и т.д.
  metadata?: Record<string, string | boolean>
}

export interface DstnBadge {
  id: string
  description: string
  icon: string
}

export interface DstnProfile {
  user: JapiUser
  connected_accounts?: DstnConnection[]
  badges?: DstnBadge[]
}

export interface LanyardActivity {
  id: string
  name: string
  type: number
  state?: string
  details?: string
  url?: string
  application_id?: string
  timestamps?: { start?: number; end?: number }
  assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string }
  emoji?: { name: string; id?: string; animated?: boolean }
}

export interface LanyardSpotify {
  track_id: string | null
  timestamps: { start: number; end: number }
  song: string
  artist: string
  album: string
  album_art_url: string | null
}

export interface LanyardUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
  public_flags?: number
  avatar_decoration_data: DiscordAvatarDecoration | null
  primary_guild?: DiscordClan | null
}

export interface LanyardPresence {
  discord_user: LanyardUser
  discord_status: DiscordStatus
  activities: LanyardActivity[]
  listening_to_spotify: boolean
  spotify: LanyardSpotify | null
  active_on_discord_desktop: boolean
  active_on_discord_mobile: boolean
  active_on_discord_web: boolean
}

export interface LanyardResponse {
  success: boolean
  data?: LanyardPresence
  error?: { code: string; message: string }
}

export interface DiscordBadge {
  id: string
  label: string
  iconUrl: string
}

export interface DiscordCustomStatus {
  text: string | null
  emoji: string | null
  emojiUrl: string | null
}

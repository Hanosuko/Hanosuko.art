export type SocialKind =
  | 'telegram'
  | 'discord'
  | 'github'
  | 'tiktok'
  | 'youtube'
  | 'minecraft'
  | 'namemc'
  | 'modrinth'

export interface SocialLink {
  kind: SocialKind
  url: string
  label?: string
}

export interface CustomLink {
  title: string
  url: string
  description?: string
  icon?: string
  enabled: boolean
}

export interface ThemeColors {
  background: string
  surface: string
  text: string
  textMuted: string
  accent: string
  glow: string
}

export interface BackgroundSettings {
  variant: 'gradient' | 'particles' | 'static'
  imageUrl?: string
}

export interface AudioSettings {
  volume: number
  shuffle: boolean
  autoplay: boolean
}

export interface TierColor {
  text: string
  shadow: string
}

export type TierColors = Record<string, TierColor>

export interface CistiersSettings {
  apiUrl: string
  username: string
  tierDiscordUrl: string
  tierDiscordUrls: Record<string, string>
  tierTableBaseUrl: string
  tierRenders: Record<string, string>
  tierColors: TierColors
}

export interface FeatureFlags {
  audioPlayer: boolean
  viewCounter: boolean
  tiers: boolean
  setup: boolean
  gallery: boolean
}

export interface GallerySettings {
  title: string
  photos: string[]
}

export interface SetupSpecItem {
  label: string
  value: string
}

export interface SetupSettings {
  photoUrl: string
  title: string
  description: string
  specs: SetupSpecItem[]
}

export interface Profile {
  identity: {
    nickname: string
    avatarUrl: string
    bio: string
  }
  theme: ThemeColors
  background: BackgroundSettings
  social: SocialLink[]
  customLinks: CustomLink[]
  features: FeatureFlags
  audio: AudioSettings
  cistiers: CistiersSettings
  setup: SetupSettings
  gallery: GallerySettings
}

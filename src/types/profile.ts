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
  // Ник в карточке; по умолчанию берётся из последней части ссылки
  handle?: string
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

export interface MyTiersSettings {
  username: string
  siteUrl: string
  kitColors: Record<string, string>
}

export interface DiscordSettings {
  userId: string
}

export interface ServerSettings {
  name: string
  address: string
  websiteUrl?: string
}

export interface CistiersSettings {
  username: string
  apiUrl: string
  siteUrl: string
}

export interface PartnerLink {
  name: string
  url: string
  iconUrl: string
}

export interface FeatureFlags {
  audioPlayer: boolean
  viewCounter: boolean
  tiers: boolean
  setup: boolean
  gallery: boolean
  serverStatus: boolean
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

export interface Identity {
  nickname: string
  avatarUrl: string
  bio: string
  siteUrl: string
}

export interface Profile {
  identity: Identity
  discord: DiscordSettings
  theme: ThemeColors
  background: BackgroundSettings
  social: SocialLink[]
  customLinks: CustomLink[]
  features: FeatureFlags
  audio: AudioSettings
  mytiers: MyTiersSettings
  cistiers?: CistiersSettings
  partners: PartnerLink[]
  server: ServerSettings
  setup: SetupSettings
  gallery: GallerySettings
}

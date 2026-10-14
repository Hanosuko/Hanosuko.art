export type SocialKind =
  | 'telegram'
  | 'discord'
  | 'github'
  | 'tiktok'
  | 'youtube'
  | 'minecraft'
  | 'namemc'
  | 'modrinth'
  | 'steam'
  | 'epicgames'
  | 'twitch'
  | 'xbox'

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

export interface DiscordBadgeConfig {
  label: string
  iconUrl: string
}

// Слой эффекта профиля — поля как в Discord (collectibles-products → items[].effects[])
export interface ProfileEffectLayer {
  src: string
  // Через сколько мс после старта показать и сколько он играет
  start: number
  duration: number
  loop?: boolean
  // Пауза между повторами петли
  loopDelay?: number
  zIndex?: number
}

export interface ProfileEffect {
  title: string
  // Статичная картинка вместо анимации при prefers-reduced-motion
  reducedMotionSrc?: string
  layers: ProfileEffectLayer[]
}

export interface DiscordSettings {
  userId: string
  // Цвета темы профиля Nitro («Тема и баннер»): основной сверху, акцент снизу. Без них — тёмная карточка сайта
  theme?: { primary: string; accent: string }
  // Строка после юзернейма (в Discord — поле «Местоимения»)
  pronouns?: string
  // Стиль отображаемого имени: шрифт и эффект toon (белая заливка, контур и тень)
  nameStyle?: { font: string; effect: 'toon' | 'none' }
  // Свои значки вместо тех, что приходят из API
  badges?: DiscordBadgeConfig[]
  // Эффект профиля — анимация поверх карточки
  profileEffect?: ProfileEffect
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

import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import type {
  DiscordBadge,
  DiscordCustomStatus,
  JapiResponse,
  JapiUser,
  LanyardActivity,
  LanyardPresence,
  LanyardResponse,
} from '@/types/discord'
import type { DiscordMedia } from '@/types/profile'

const CDN = 'https://cdn.discordapp.com'
const LANYARD_REST = 'https://api.lanyard.rest/v1/users/'
const LANYARD_SOCKET = 'wss://api.lanyard.rest/socket'
const JAPI = 'https://japi.rest/discord/v1/user/'
const DISCORD_EPOCH = 1420070400000n

// Значки из битового поля public_flags (официальная документация Discord) + Nitro от japi.rest
const FLAG_BADGES: { bit: number; id: string; label: string; icon: string }[] = [
  { bit: 0, id: 'staff', label: 'Discord Staff', icon: '5e74e9b61934fc1f67c65515d1f7e60d' },
  { bit: 1, id: 'partner', label: 'Partnered Server Owner', icon: '3f9748e53446a137a052f3454e2de41e' },
  { bit: 18, id: 'moderator', label: 'Moderator Programs Alumni', icon: 'fee1624003e2fee35cb398e125dc479b' },
  { bit: 2, id: 'hypesquad', label: 'HypeSquad Events', icon: 'bf01d1073931f921909045f3a39fd264' },
  { bit: 6, id: 'bravery', label: 'HypeSquad Bravery', icon: '8a88d63823d8a71cd5e390baa45efa02' },
  { bit: 7, id: 'brilliance', label: 'HypeSquad Brilliance', icon: '011940fd013da3f7fb926e4a1cd2e618' },
  { bit: 8, id: 'balance', label: 'HypeSquad Balance', icon: '3aa41de486fa12454c3761e8e223442e' },
  { bit: 3, id: 'bughunter', label: 'Discord Bug Hunter', icon: '2717692c7dca7289b35297368a940dd0' },
  { bit: 14, id: 'bughunter-gold', label: 'Discord Bug Hunter', icon: '848f79194d4be5ff5f81505cbd0ce1e6' },
  { bit: 22, id: 'active-developer', label: 'Active Developer', icon: '6bdc42827a38498929a4920da12695d9' },
  { bit: 17, id: 'bot-developer', label: 'Early Verified Bot Developer', icon: '6df5892e0f35b051f8b61eace34f4967' },
  { bit: 9, id: 'early-supporter', label: 'Early Supporter', icon: '7060786766c9c840eb3019e725d2b358' },
]
const NITRO_BADGE = { id: 'nitro', label: 'Nitro', icon: '2ba85e8026a8614b640c2837bcdfe21b' }

const badgeIconUrl = (icon: string): string => `${CDN}/badge-icons/${icon}.png`

// Анимированные ассеты Discord начинаются с a_
const isAnimated = (hash: string): boolean => hash.startsWith('a_')

export const avatarUrlFor = (userId: string, hash: string, size = 256): string =>
  `${CDN}/avatars/${userId}/${hash}.${isAnimated(hash) ? 'gif' : 'png'}?size=${size}`

export const activityImageUrl = (activity: LanyardActivity, key: 'large_image' | 'small_image'): string | null => {
  const image = activity.assets?.[key]
  if (!image) return null
  if (image.startsWith('mp:')) return `https://media.discordapp.net/${image.slice(3)}`
  if (image.startsWith('spotify:')) return `https://i.scdn.co/image/${image.slice(8)}`
  if (!activity.application_id) return null
  return `${CDN}/app-assets/${activity.application_id}/${image}.png`
}

// Дата регистрации зашита в сам ID (snowflake)
const createdAtOf = (userId: string): Date => new Date(Number((BigInt(userId) >> 22n) + DISCORD_EPOCH))

// media — локальные копии картинок: они важнее CDN, который без VPN не грузится
export function useDiscordProfile(userId: string, media: DiscordMedia = {}) {
  const user = shallowRef<JapiUser | null>(null)
  const presence = shallowRef<LanyardPresence | null>(null)

  const loadUser = async (): Promise<void> => {
    try {
      const response = await fetch(`${JAPI}${userId}`)
      if (!response.ok) throw new Error(`japi.rest responded ${response.status}`)
      user.value = ((await response.json()) as JapiResponse).data
    } catch (caught) {
      console.warn('[discord] profile fetch failed:', caught instanceof Error ? caught.message : caught)
    }
  }

  // --- Lanyard: сначала REST, потом WebSocket для обновлений в реальном времени ---
  let socket: WebSocket | null = null
  let heartbeat: number | undefined
  let reconnectTimer: number | undefined
  let reconnectDelay = 2000
  let disposed = false

  const connect = (): void => {
    socket = new WebSocket(LANYARD_SOCKET)
    socket.addEventListener('message', (event) => {
      let message: { op: number; d?: { heartbeat_interval?: number } & Partial<LanyardPresence> }
      try {
        message = JSON.parse(String(event.data))
      } catch {
        return
      }
      if (message.op === 1 && message.d?.heartbeat_interval) {
        socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }))
        window.clearInterval(heartbeat)
        heartbeat = window.setInterval(() => socket?.send(JSON.stringify({ op: 3 })), message.d.heartbeat_interval)
        reconnectDelay = 2000
      } else if (message.op === 0 && message.d?.discord_status) {
        presence.value = message.d as LanyardPresence
      }
    })
    socket.addEventListener('close', () => {
      window.clearInterval(heartbeat)
      if (disposed) return
      reconnectTimer = window.setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, 60_000)
    })
  }

  const loadPresence = async (): Promise<void> => {
    try {
      const response = await fetch(`${LANYARD_REST}${userId}`)
      const payload = (await response.json()) as LanyardResponse
      // user_not_monitored — пользователь ещё не зашёл на discord.gg/lanyard
      if (!payload.success || !payload.data) return
      presence.value = payload.data
      if (!disposed) connect()
    } catch (caught) {
      console.warn('[discord] presence fetch failed:', caught instanceof Error ? caught.message : caught)
    }
  }

  onMounted(() => {
    void loadUser()
    void loadPresence()
  })

  onBeforeUnmount(() => {
    disposed = true
    window.clearInterval(heartbeat)
    window.clearTimeout(reconnectTimer)
    socket?.close()
  })

  // --- Производные данные для карточки: живые данные Lanyard важнее, japi.rest — запасной вариант ---
  const liveUser = computed(() => presence.value?.discord_user ?? null)

  const displayName = computed(() => liveUser.value?.global_name ?? user.value?.global_name ?? null)
  const username = computed(() => liveUser.value?.username ?? user.value?.username ?? null)

  const avatarUrl = computed(() => {
    if (media.avatar) return media.avatar
    const hash = liveUser.value?.avatar ?? user.value?.avatar
    return hash ? avatarUrlFor(userId, hash) : null
  })

  const decoration = computed(() => {
    if (media.decoration) return media.decoration
    const asset = (liveUser.value?.avatar_decoration_data ?? user.value?.avatar_decoration_data)?.asset
    if (!asset) return null
    const base = `${CDN}/avatar-decoration-presets/${asset}.png?size=240`
    return { static: `${base}&passthrough=false`, animated: `${base}&passthrough=true` }
  })

  const banner = computed(() => {
    if (media.banner) return media.banner
    const hash = user.value?.banner
    if (!hash) return null
    const base = `${CDN}/banners/${userId}/${hash}`
    return {
      static: `${base}.png?size=600`,
      animated: isAnimated(hash) ? `${base}.webp?size=600&animated=true` : null,
    }
  })

  const bannerColor = computed(() => user.value?.banner_color ?? null)

  const clan = computed(() => {
    const guild = liveUser.value?.primary_guild ?? user.value?.primary_guild
    if (!guild?.tag) return null
    const badgeUrl =
      media.clanBadge ??
      (guild.identity_guild_id && guild.badge
        ? `${CDN}/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=32`
        : null)
    return { tag: guild.tag, badgeUrl, guildId: guild.identity_guild_id }
  })

  const badges = computed<DiscordBadge[]>(() => {
    const flags = liveUser.value?.public_flags ?? user.value?.public_flags ?? 0
    const owned = FLAG_BADGES.filter((badge) => (flags & (1 << badge.bit)) !== 0).map(({ id, label, icon }) => ({
      id,
      label,
      icon,
    }))
    // Nitro не входит в public_flags — его определяет japi.rest
    if (user.value?.public_flags_array?.includes('NITRO')) owned.push(NITRO_BADGE)
    return owned.map(({ id, label, icon }) => ({ id, label, iconUrl: badgeIconUrl(icon) }))
  })

  const createdAt = createdAtOf(userId)

  const status = computed(() => presence.value?.discord_status ?? null)

  const customStatus = computed<DiscordCustomStatus | null>(() => {
    const custom = presence.value?.activities.find((activity) => activity.type === 4)
    if (!custom || (!custom.state && !custom.emoji)) return null
    const emoji = custom.emoji
    return {
      text: custom.state ?? null,
      emoji: emoji && !emoji.id ? emoji.name : null,
      emojiUrl: emoji?.id ? `${CDN}/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=48` : null,
    }
  })

  // Всё, кроме кастомного статуса; Spotify рисуется отдельно, поэтому его тоже убираем
  const activities = computed(() =>
    (presence.value?.activities ?? []).filter(
      (activity) => activity.type !== 4 && !(activity.type === 2 && activity.name === 'Spotify'),
    ),
  )

  const spotify = computed(() => (presence.value?.listening_to_spotify ? presence.value.spotify : null))

  return {
    displayName,
    username,
    avatarUrl,
    decoration,
    banner,
    bannerColor,
    clan,
    badges,
    createdAt,
    status,
    customStatus,
    activities,
    spotify,
  }
}

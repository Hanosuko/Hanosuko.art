// Профиль Discord (japi.rest) и статус (Lanyard) через наш сервер — на случай, если без VPN
// браузер до этих сервисов не достучится. Ответы те же, что у самих сервисов, только с кешем.
// Модуль общий: его использует server/index.js и dev-плагин Vite (vite-plugins/discord-dev-api.ts).

const JAPI = 'https://japi.rest/discord/v1/user/'
const LANYARD = 'https://api.lanyard.rest/v1/users/'
const USER_TTL_MS = 10 * 60 * 1000
const PRESENCE_TTL_MS = 10_000
const TIMEOUT_MS = 8_000

// Тот же ID, что profile.discord.userId; другой — через переменную DISCORD_USER_ID.
// Чужие ID не проксируем, чтобы сервер не стал открытым прокси
export const DEFAULT_USER_ID = '835533218869936168'

const cached = (url, ttl) => {
  let entry = null
  let pending = null

  const load = async () => {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`${url} responded ${response.status}`)
    return response.json()
  }

  return async () => {
    if (entry && Date.now() - entry.at < ttl) return entry.body
    // Одновременные запросы ждут один и тот же ответ
    pending ??= load()
      .then((body) => {
        entry = { at: Date.now(), body }
        return body
      })
      .catch((error) => {
        console.warn('[discord]', error instanceof Error ? error.message : error)
        // Сервис лёг — лучше старые данные, чем никаких
        if (entry) return entry.body
        throw error
      })
      .finally(() => {
        pending = null
      })
    return pending
  }
}

export const createDiscordClient = ({ userId = DEFAULT_USER_ID } = {}) => {
  const getUser = cached(`${JAPI}${userId}`, USER_TTL_MS)
  const getPresence = cached(`${LANYARD}${userId}`, PRESENCE_TTL_MS)

  const handle = async (kind, id) => {
    if (id !== userId) return { status: 404, body: { error: 'unknown user' } }
    try {
      return { status: 200, body: await (kind === 'user' ? getUser() : getPresence()) }
    } catch {
      return { status: 502, body: { error: 'upstream unavailable' } }
    }
  }

  return { handle }
}

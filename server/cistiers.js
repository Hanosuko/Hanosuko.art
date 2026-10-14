// CISTiers: публичный API из https://cistiers.com/docs — конфиг тирлистов и CDN-дамп всех игроков.
// Из браузера его не вызвать (нет CORS), поэтому ходим с сервера и кешируем на час, как просит их cache-control.
// Модуль общий: его использует server/index.js и dev-плагин Vite (vite-plugins/cistiers-dev-api.ts).

const CONFIG_URL = 'https://cistiers.com/api/config'
const DUMP_URL = 'https://cdn.cistiers.com/api/dump.json'
const CACHE_TTL_MS = 60 * 60 * 1000
const USERNAME_RE = /^[A-Za-z0-9_.]{2,32}$/

// CISTiers блокирует безымянные User-Agent и просит указать проект и контакт
export const DEFAULT_USER_AGENT = 'link-profile/1.0 (+https://github.com/Hanosuko/Hanosuko.art)'

// CDN CISTiers иногда не отвечает на первое соединение — одна повторная попытка
const getJson = async (url, userAgent, attempts = 2) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': userAgent },
        signal: AbortSignal.timeout(30_000),
      })
      if (!response.ok) throw new Error(`${url} responded ${response.status}`)
      return await response.json()
    } catch (error) {
      if (attempt >= attempts) throw error
    }
  }
}

const buildSnapshot = (config, dump) => {
  const tierPoints = config.tier_points ?? {}
  const players = new Map()
  const allPoints = []

  for (const [nickname, entry] of Object.entries(dump.data ?? {})) {
    const tiers = entry.tiers ?? {}
    const points = Object.values(tiers).reduce((sum, tier) => sum + (tierPoints[tier] ?? 0), 0)
    players.set(nickname.toLowerCase(), { nickname, tiers, points })
    allPoints.push(points)
  }
  allPoints.sort((a, b) => b - a)

  return {
    tierlists: (config.tierlists ?? []).filter((list) => list.is_active),
    tierPoints,
    players,
    allPoints,
    updatedAt: dump.meta?.last_updated ?? null,
    expiresAt: Date.now() + CACHE_TTL_MS,
  }
}

// Место = 1 + число игроков, у которых очков строго больше (allPoints отсортирован по убыванию)
const rankOf = (allPoints, points) => {
  let low = 0
  let high = allPoints.length
  while (low < high) {
    const mid = (low + high) >> 1
    if (allPoints[mid] > points) low = mid + 1
    else high = mid
  }
  return low + 1
}

export const createCistiersClient = ({ userAgent = DEFAULT_USER_AGENT } = {}) => {
  let snapshot = null
  let pending = null

  const refresh = () => {
    pending ??= Promise.all([getJson(CONFIG_URL, userAgent), getJson(DUMP_URL, userAgent)])
      .then(([config, dump]) => (snapshot = buildSnapshot(config, dump)))
      .finally(() => {
        pending = null
      })
    return pending
  }

  const getSnapshot = async () => {
    if (!snapshot) return refresh()
    // Устаревший снимок отдаём сразу, а свежий подтягиваем в фоне — посетитель не ждёт CDN
    if (snapshot.expiresAt <= Date.now()) refresh().catch(() => {})
    return snapshot
  }

  // Ответ для GET /api/cistiers?username=...
  const handle = async (rawUsername) => {
    const username = String(rawUsername ?? '').trim()
    if (!USERNAME_RE.test(username)) return { status: 400, body: { error: 'invalid_username' } }

    let snap
    try {
      snap = await getSnapshot()
    } catch {
      return { status: 502, body: { error: 'upstream_failed' } }
    }

    const player = snap.players.get(username.toLowerCase())
    if (!player) return { status: 404, body: { error: 'not_found' } }

    return {
      status: 200,
      body: {
        nickname: player.nickname,
        points: player.points,
        rank: player.points > 0 ? rankOf(snap.allPoints, player.points) : null,
        totalPlayers: snap.allPoints.length,
        updatedAt: snap.updatedAt,
        kits: snap.tierlists.map((list) => {
          const tier = player.tiers[list.name] ?? null
          return {
            slug: list.name,
            name: list.display_name,
            iconUrl: list.icon || null,
            color: list.color || null,
            tier,
            points: tier ? (snap.tierPoints[tier] ?? 0) : 0,
          }
        }),
      },
    }
  }

  // Загрузить снимок заранее, чтобы первый посетитель не ждал скачивания дампа
  const warmUp = () => refresh().catch(() => {})

  return { handle, warmUp }
}

import type { Connect, Plugin } from 'vite'

const ALLOWED_USERNAME = /^[A-Za-z0-9_]{2,32}$/
const UPSTREAM_BASE = 'https://cistiers.com/api/profile'
const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  expiresAt: number
  body: string
}

const cache = new Map<string, CacheEntry>()

const handler: Connect.SimpleHandleFunction = async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const username = url.searchParams.get('username')?.trim() ?? ''

  res.setHeader('access-control-allow-origin', '*')
  res.setHeader('content-type', 'application/json; charset=utf-8')

  if (!ALLOWED_USERNAME.test(username)) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'invalid_username' }))
    return
  }

  const cached = cache.get(username)
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader('x-cache', 'HIT')
    res.end(cached.body)
    return
  }

  try {
    const upstream = await fetch(`${UPSTREAM_BASE}/${encodeURIComponent(username)}`, {
      headers: { accept: 'application/json' },
    })
    if (!upstream.ok) {
      res.statusCode = 502
      res.end(JSON.stringify({ error: 'upstream_failed', status: upstream.status }))
      return
    }
    const body = await upstream.text()
    cache.set(username, { body, expiresAt: Date.now() + CACHE_TTL_MS })
    res.setHeader('x-cache', 'MISS')
    res.end(body)
  } catch {
    res.statusCode = 502
    res.end(JSON.stringify({ error: 'fetch_failed' }))
  }
}

export const tiersDevApiPlugin = (): Plugin => ({
  name: 'hanosuko:tiers-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/tiers', handler)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/tiers', handler)
  },
})

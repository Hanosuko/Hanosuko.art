import express from 'express'
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '127.0.0.1'
const DB_PATH = process.env.DB_PATH ?? './data/views.sqlite'
const IP_SALT = process.env.IP_SALT ?? 'change-me-in-production'
const TIERS_UPSTREAM = 'https://cistiers.com/api/profile'
const TIERS_USERNAME_RE = /^[A-Za-z0-9_]{2,32}$/
const TIERS_CACHE_TTL_MS = 5 * 60 * 1000

mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS views (
    ip_hash TEXT NOT NULL,
    day TEXT NOT NULL,
    PRIMARY KEY (ip_hash, day)
  );
`)

const insertView = db.prepare('INSERT OR IGNORE INTO views (ip_hash, day) VALUES (?, ?)')
const countViews = db.prepare('SELECT COUNT(*) AS total FROM views')

const getTotal = () => Number(countViews.get().total)

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket.remoteAddress ?? '0.0.0.0'
}

const hashIp = (ip) => createHash('sha256').update(`${IP_SALT}:${ip}`).digest('hex')

const today = () => new Date().toISOString().slice(0, 10)

const tiersCache = new Map()

const fetchTiers = async (username) => {
  const cached = tiersCache.get(username)
  if (cached && Date.now() - cached.fetchedAt < TIERS_CACHE_TTL_MS) {
    return { payload: cached.payload, status: 200, cache: 'HIT' }
  }
  const upstream = await fetch(`${TIERS_UPSTREAM}/${encodeURIComponent(username)}`, {
    headers: { accept: 'application/json' },
  })
  if (!upstream.ok) {
    return { payload: { error: 'upstream_failed', status: upstream.status }, status: 502, cache: 'MISS' }
  }
  const payload = await upstream.json()
  tiersCache.set(username, { payload, fetchedAt: Date.now() })
  return { payload, status: 200, cache: 'MISS' }
}

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 'loopback')
app.use(express.json({ limit: '4kb' }))

app.get('/api/views', (_req, res) => {
  res.set('cache-control', 'no-store')
  res.json({ total: getTotal() })
})

app.post('/api/views', (req, res) => {
  const ip = getClientIp(req)
  insertView.run(hashIp(ip), today())
  res.set('cache-control', 'no-store')
  res.json({ total: getTotal() })
})

app.get('/api/tiers', async (req, res) => {
  const username = String(req.query.username ?? '').trim()
  if (!TIERS_USERNAME_RE.test(username)) {
    res.status(400).set('cache-control', 'no-store').json({ error: 'invalid_username' })
    return
  }
  try {
    const { payload, status, cache } = await fetchTiers(username)
    res.status(status)
    res.set('x-cache', cache)
    if (status === 200) {
      res.set('cache-control', 'public, max-age=60, stale-while-revalidate=600')
    } else {
      res.set('cache-control', 'no-store')
    }
    res.json(payload)
  } catch {
    res.status(502).set('cache-control', 'no-store').json({ error: 'fetch_failed' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, HOST, () => {
  console.log(`[link-profile-api] listening on ${HOST}:${PORT}`)
})

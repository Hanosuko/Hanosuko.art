import express from 'express'
import Database from 'better-sqlite3'
import { createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createCistiersClient } from './cistiers.js'

const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '127.0.0.1'
const DB_PATH = process.env.DB_PATH ?? './data/views.sqlite'
const IP_SALT = process.env.IP_SALT

if (!IP_SALT) {
  throw new Error('IP_SALT must be set before starting the API server')
}

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

const cistiers = createCistiersClient({ userAgent: process.env.CISTIERS_USER_AGENT || undefined })

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

app.get('/api/cistiers', async (req, res) => {
  const { status, body } = await cistiers.handle(req.query.username)
  res
    .status(status)
    .set('cache-control', status === 200 ? 'public, max-age=300' : 'no-store')
    .json(body)
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, HOST, () => {
  console.log(`[link-profile-api] listening on ${HOST}:${PORT}`)
  void cistiers.warmUp()
})

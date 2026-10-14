import type { Connect, Plugin } from 'vite'
import { createCistiersClient } from '../server/cistiers.js'

const client = createCistiersClient({ userAgent: process.env.CISTIERS_USER_AGENT || undefined })

const handler: Connect.SimpleHandleFunction = async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const { status, body } = await client.handle(url.searchParams.get('username'))
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

// В dev и preview /api/cistiers отвечает сам Vite — запускать server/ ради тиров не нужно
export const cistiersDevApiPlugin = (): Plugin => ({
  name: 'link-profile:cistiers-dev-api',
  configureServer(server) {
    void client.warmUp()
    server.middlewares.use('/api/cistiers', handler)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/cistiers', handler)
  },
})

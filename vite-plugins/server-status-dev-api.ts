import type { Connect, Plugin } from 'vite'
import { createServerStatusClient } from '../server/minecraft.js'

const client = createServerStatusClient({ address: process.env.MC_SERVER_ADDRESS || undefined })

const handler: Connect.SimpleHandleFunction = async (req, res) => {
  const fresh = new URL(req.url ?? '/', 'http://localhost').searchParams.get('fresh') === '1'
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(await client.get({ fresh })))
}

// В dev и preview /api/server отвечает сам Vite — запускать server/ ради онлайна не нужно
export const serverStatusDevApiPlugin = (): Plugin => ({
  name: 'link-profile:server-status-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/server', handler)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/server', handler)
  },
})

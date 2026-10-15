import type { Connect, Plugin } from 'vite'
import { createDiscordClient } from '../server/discord.js'

const client = createDiscordClient({ userId: process.env.DISCORD_USER_ID || undefined })

const handlerFor =
  (kind: 'user' | 'presence'): Connect.SimpleHandleFunction =>
  async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const { status, body } = await client.handle(kind, url.searchParams.get('id'))
    res.statusCode = status
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(body))
  }

// В dev и preview /api/discord/* отвечает сам Vite — запускать server/ ради профиля не нужно
export const discordDevApiPlugin = (): Plugin => ({
  name: 'link-profile:discord-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/discord/user', handlerFor('user'))
    server.middlewares.use('/api/discord/presence', handlerFor('presence'))
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/discord/user', handlerFor('user'))
    server.middlewares.use('/api/discord/presence', handlerFor('presence'))
  },
})

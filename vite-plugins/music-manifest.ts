import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const AUDIO_EXTENSIONS = new Set(['.mp3', '.ogg', '.wav', '.m4a', '.flac', '.opus'])

interface MusicTrackEntry {
  src: string
  title: string
}

const buildManifest = async (musicDir: string): Promise<MusicTrackEntry[]> => {
  try {
    const entries = await fs.readdir(musicDir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'en'))
      .map((entry) => ({
        src: `/music/${entry.name}`,
        title: path.parse(entry.name).name.replace(/[_-]+/g, ' ').trim(),
      }))
  } catch {
    return []
  }
}

const writeManifest = async (musicDir: string): Promise<MusicTrackEntry[]> => {
  const tracks = await buildManifest(musicDir)
  await fs.writeFile(path.join(musicDir, 'manifest.json'), JSON.stringify(tracks, null, 2), 'utf8')
  return tracks
}

export const musicManifestPlugin = (): Plugin => {
  let musicDir = ''
  return {
    name: 'hanosuko:music-manifest',
    apply: () => true,
    async configResolved(config) {
      musicDir = path.resolve(config.root, 'public/music')
      await fs.mkdir(musicDir, { recursive: true })
      await writeManifest(musicDir)
    },
    configureServer(server) {
      const refresh = async (): Promise<void> => {
        await writeManifest(musicDir)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(musicDir)
      server.watcher.on('add', (file) => {
        if (file.startsWith(musicDir)) void refresh()
      })
      server.watcher.on('unlink', (file) => {
        if (file.startsWith(musicDir)) void refresh()
      })
    },
  }
}

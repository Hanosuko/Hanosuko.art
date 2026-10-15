import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { HtmlTagDescriptor, Plugin } from 'vite'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { identity } from '../src/config/identity'

// Превью ссылки для Telegram, Discord и т.д.: картинка 1200×630 и мета-теги собираются
// из src/config/identity.ts при каждой сборке — менять руками ничего не нужно.

const WIDTH = 1200
const HEIGHT = 630
const OG_FILE = 'og.png'

interface OgNode {
  type: string
  props: Record<string, unknown>
}

const el = (type: string, style: Record<string, unknown>, children?: unknown, attrs: Record<string, unknown> = {}): OgNode => ({
  type,
  props: { style, children, ...attrs },
})

// satori не умеет WebP — у Discord CDN та же картинка есть в PNG.
// Путь от корня сайта (/discord/avatar.png) читается из public/
const loadImage = async (url: string, root: string): Promise<string | null> => {
  try {
    if (url.startsWith('/')) {
      const type = url.endsWith('.png') ? 'image/png' : /\.jpe?g$/.test(url) ? 'image/jpeg' : null
      if (!type) return null
      return `data:${type};base64,${(await readFile(path.join(root, 'public', url))).toString('base64')}`
    }
    const response = await fetch(url.replace(/\.webp(?=$|\?)/, '.png'), { signal: AbortSignal.timeout(10_000) })
    const type = response.headers.get('content-type') ?? ''
    if (!response.ok || !/^image\/(png|jpeg)/.test(type)) return null
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
  } catch {
    return null
  }
}

const renderOgImage = async (root: string): Promise<Buffer> => {
  const [regular, bold, avatar] = await Promise.all([
    readFile(path.join(root, 'src/assets/fonts/Monocraft.ttf')),
    readFile(path.join(root, 'src/assets/fonts/Monocraft-Bold.ttf')),
    loadImage(identity.avatarUrl, root),
  ])

  const avatarNode = avatar
    ? el('img', { width: 280, height: 280, borderRadius: 9999, border: '8px solid #262626' }, undefined, {
        src: avatar,
        width: 280,
        height: 280,
      })
    : el(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 280,
          height: 280,
          borderRadius: 9999,
          background: '#262626',
          fontSize: 140,
          fontWeight: 700,
        },
        identity.nickname.slice(0, 1).toUpperCase(),
      )

  const tree = el(
    'div',
    {
      display: 'flex',
      width: WIDTH,
      height: HEIGHT,
      background: '#121212',
      backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.09), transparent 60%)',
      color: '#f5f5f5',
      fontFamily: 'Monocraft',
    },
    el(
      'div',
      {
        display: 'flex',
        flex: 1,
        margin: 48,
        alignItems: 'center',
        gap: 64,
        padding: '0 72px',
        borderRadius: 40,
        border: '2px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(28, 28, 28, 0.7)',
      },
      [
        avatarNode,
        el('div', { display: 'flex', flexDirection: 'column', flex: 1 }, [
          el('div', { fontSize: 96, fontWeight: 700, letterSpacing: -2 }, identity.nickname),
          ...identity.bio
            .split('\n')
            .map((line) => el('div', { marginTop: 14, fontSize: 38, color: '#a3a3a3' }, line)),
          el('div', { display: 'flex', alignItems: 'center', gap: 16, marginTop: 56, fontSize: 32, color: '#e5e5e5' }, [
            el('div', { width: 14, height: 14, borderRadius: 9999, background: '#e5e5e5' }),
            new URL(identity.siteUrl).host,
          ]),
        ]),
      ],
    ),
  )

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Monocraft', data: regular, weight: 400, style: 'normal' },
      { name: 'Monocraft', data: bold, weight: 700, style: 'normal' },
    ],
  })
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
}

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const metaTags = (): HtmlTagDescriptor[] => {
  const description = identity.bio.split('\n').join(' · ')
  const url = new URL('/', identity.siteUrl).href
  const image = new URL(`/${OG_FILE}`, identity.siteUrl).href
  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' })
  return [
    meta({ name: 'description', content: description }),
    meta({ property: 'og:type', content: 'profile' }),
    meta({ property: 'og:site_name', content: identity.nickname }),
    meta({ property: 'og:title', content: identity.nickname }),
    meta({ property: 'og:description', content: description }),
    meta({ property: 'og:url', content: url }),
    meta({ property: 'og:image', content: image }),
    meta({ property: 'og:image:width', content: String(WIDTH) }),
    meta({ property: 'og:image:height', content: String(HEIGHT) }),
    meta({ property: 'og:image:alt', content: `${identity.nickname} — ${description}` }),
    meta({ name: 'twitter:card', content: 'summary_large_image' }),
    meta({ name: 'twitter:title', content: identity.nickname }),
    meta({ name: 'twitter:description', content: description }),
    meta({ name: 'twitter:image', content: image }),
  ]
}

export const ogImagePlugin = (): Plugin => {
  let root = process.cwd()
  let cached: Promise<Buffer> | null = null
  const getImage = (): Promise<Buffer> => (cached ??= renderOgImage(root))

  return {
    name: 'link-profile:og-image',
    configResolved(config) {
      root = config.root
    },
    transformIndexHtml(html) {
      return {
        html: html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(identity.nickname)}</title>`),
        tags: metaTags(),
      }
    },
    // В dev картинку можно посмотреть по адресу /og.png
    configureServer(server) {
      server.middlewares.use(`/${OG_FILE}`, (_req, res, next) => {
        getImage()
          .then((png) => {
            res.setHeader('content-type', 'image/png')
            res.end(png)
          })
          .catch(next)
      })
    },
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: OG_FILE, source: await getImage() })
    },
  }
}

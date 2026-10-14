# Hanosuko.art

Personal link-in-bio site built with Vue 3, TypeScript, Vite, Tailwind CSS, and a small optional Node API.

The page is a responsive bento grid: a Discord-style profile with live status, Minecraft tiers from [MyTiers](https://mytiers.ru) and [CISTiers](https://cistiers.com), a Minecraft server status tile, music, photos, and setup. Everything is configured in two small config files.

## Features

- Bento grid layout: 12 columns on desktop, 2 on tablet, 1 on phones
- Discord profile card: banner, avatar decoration, badges, server tag, live status, custom status, games and Spotify
- Tiers card with MyTiers / CISTiers tabs, hover tooltips in the style of each site
- Minecraft server status: online players, colored MOTD, copy-IP button
- Link preview (Open Graph) image generated at build time from the config
- Music player with an auto-generated `public/music/manifest.json`
- Photo gallery and PC setup tiles
- Mobile-first details: safe-area insets, touch-friendly controls, no sticky hover effects
- Optional backend for the view counter and the CISTiers proxy

## Requirements

- Node.js 18+
- npm

## Development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. In dev the CISTiers proxy is served by Vite itself, so the whole page works without starting `server/` (only the view counter needs it).

Useful commands:

```bash
npm run type-check
npm run build
npm run preview
```

## Customization

Two config files:

- `src/config/identity.ts` — nickname, fallback avatar, "About me" text, site URL. It is separate because the build reads it too: the link preview image and meta tags are generated from it.
- `src/config/profile.ts` — everything else:
  - Discord user ID
  - theme colors and background
  - social links (shown as Connections in the Discord card) and custom links
  - enabled tiles (`features`)
  - MyTiers username and kit colors, CISTiers username
  - Minecraft server address
  - partner buttons
  - setup photo and specs, photo gallery

## Layout

The grid is defined in `src/App.vue`:

```text
desktop (lg, ≥1024px)               tablet (md, ≥768px)       phone
┌───────────┬──────────────────┐    ┌──────────┬──────────┐   ┌──────────┐
│  Discord  │      tiers       │    │ Discord  │  tiers   │   │ Discord  │
│  profile  │ MyTiers/CISTiers │    │          │          │   │ tiers    │
├──────────┬┴─────────┬────────┤    ├──────────┼──────────┤   │ music    │
│  music   │  server  │partners│    │  music   │  server  │   │ server   │
├──────────┴┬─────────┴────────┤    ├──────────┴──────────┤   │ partners │
│  gallery  │      setup       │    │      partners       │   │ gallery  │
└───────────┴──────────────────┘    ├──────────┬──────────┤   │ setup    │
                                    │ gallery  │  setup   │   └──────────┘
                                    └──────────┴──────────┘
```

Tile widths are plain Tailwind classes (`col-span-12 md:col-span-6 lg:col-span-7`). To add a new block, create a component whose root is a card (for example `class="glass-card"`) and append it to the end of the grid:

```vue
<MyBlock class="col-span-12 md:col-span-6 lg:col-span-4" />
```

Every tile is a CSS container (`container-type: inline-size`), so components adapt to the width of their own cell with `@container` queries instead of viewport media queries. The same component looks right in a wide desktop cell and in a narrow phone column.

## Discord Profile

The profile card is built from the Discord user ID (`profile.discord.userId`) and two public APIs that work straight from the browser:

| Data | Source | Updates |
| --- | --- | --- |
| Status, device, custom status, games, Spotify | [Lanyard](https://github.com/Phineas/lanyard) (REST + WebSocket) | live |
| Avatar, avatar decoration, display name, server tag | Lanyard, with japi.rest as fallback | live |
| Banner, badges (HypeSquad, Nitro, …) | [japi.rest](https://japi.rest) | on page load |
| Member since | computed from the ID itself | — |
| About me | `identity.bio` | manual |
| Connections | `profile.social` | manual |

**Lanyard only tracks users who joined its Discord server.** Join [discord.gg/lanyard](https://discord.gg/lanyard) once — until then the card works, but without status and activities.

Discord does not expose "About me", profile theme colors, profile effects, or connections through any public API, so those come from the config.

Animated banners and decorations load after their static versions and are skipped entirely with `prefers-reduced-motion`.

## Tiers: MyTiers and CISTiers

The tiers card has two tabs. MyTiers is the default; CISTiers loads when its tab is opened for the first time. Remove `profile.cistiers` to keep only MyTiers.

**MyTiers** — loaded straight from the browser, the API sends `Access-Control-Allow-Origin: *`:

- `GET https://mytiers.ru/api/players/{nickname}` — rank, points, current and peak tier per kit
- `GET https://mytiers.ru/api/guilds` — kit list, order, icons, and Discord links
- `https://mytiers.ru/api/avatar/{nickname}?s=256` — skin render for the avatar and banner (used by both tabs)

New kits added on MyTiers appear automatically. Tile colors per kit are set in `profile.mytiers.kitColors` (keyed by kit slug); kits without a color use the tier color.

**CISTiers** — its [public API](https://cistiers.com/docs) has no CORS, so the browser calls our proxy `GET /api/cistiers?username=...` (`server/cistiers.js`):

- downloads `https://cistiers.com/api/config` (kits, colors, icons, points per tier) and the CDN player dump `https://cdn.cistiers.com/api/dump.json`
- caches both for an hour, as their `cache-control` asks; a stale snapshot is served instantly while a fresh one loads in the background
- computes points and the overall place among all players
- in production it runs in `server/`, in `npm run dev` / `npm run preview` the same module is served by Vite

CISTiers blocks generic User-Agents and asks for a project name and contact. Set yours in `server/.env`:

```bash
CISTIERS_USER_AGENT="MySite/1.0 (+https://example.com; contact@example.com)"
```

Hovering a tile shows a tooltip in the style of the current tab's site: MyTiers — tier name and points above the tile (with a Peak note when the peak was higher), CISTiers — kit icon, name, and points following the cursor.

## Minecraft Server Status

The server tile (`profile.server`) shows online/max players, the version, and the server MOTD with Minecraft color codes (including hex colors), plus a copy-IP button and a website link. Data comes from [api.mcsrvstat.us](https://api.mcsrvstat.us) in the browser and refreshes every 2.5 minutes. Turn it off with `features.serverStatus`.

## Link Preview

`vite-plugins/og-image.ts` renders a 1200×630 `og.png` (avatar, nickname, bio, site host) with [satori](https://github.com/vercel/satori) and [resvg](https://github.com/yisibl/resvg-js) on every build, and adds `description`, `og:*`, and `twitter:*` meta tags from `src/config/identity.ts`. In dev the image is available at `http://localhost:5173/og.png`.

`og:image` must be an absolute URL, so keep `identity.siteUrl` pointing to the real domain.

## Music

Put your audio files in:

```text
public/music/
```

Supported extensions: `.mp3`, `.ogg`, `.wav`, `.m4a`, `.flac`, `.opus`.

`vite-plugins/music-manifest.ts` automatically generates:

```text
public/music/manifest.json
```

Do not publish copyrighted tracks unless you have the right to distribute them.

## Photos

Put personal photos in:

```text
public/photos/
```

or bundle template-safe assets through `src/assets/photos/`.

## Optional Backend

The `server/` folder contains a small Express API:

- `GET /api/health`
- `GET /api/views`
- `POST /api/views`
- `GET /api/cistiers?username=...`

Views are stored in SQLite through `better-sqlite3`.

Local backend setup:

```bash
cd server
npm install
cp .env.example .env
npm start
```

Then proxy `/api/*` to `127.0.0.1:3000` in your production web server, or use the included deploy examples as a starting point.

## Deployment

For static-only hosting, deploy the `dist/` folder after:

```bash
npm run build
```

Static hosting covers everything except the view counter and the CISTiers tab — for those, also deploy `server/` and run it behind Nginx/Caddy/systemd. Example configs are in `deploy/`.

`deploy.sh` is intentionally generic and expects environment variables:

```bash
REMOTE_HOST=example.com REMOTE_USER=deploy REMOTE_ROOT=/var/www/my-site ./deploy.sh
```

## Open Source Notes

This repository intentionally ignores:

- `node_modules/`
- `dist/`
- `.env` files

Before publishing, run:

```bash
git status --short
git diff --cached --stat
```

and make sure you are not committing private media, secrets, or server credentials.

## License

MIT

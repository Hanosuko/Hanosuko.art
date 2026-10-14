# Hanosuko.art

Personal link-in-bio site built with Vue 3, TypeScript, Vite, Tailwind CSS, and a small optional Node API.

The page is a responsive bento layout: a Discord-style profile with live status, Minecraft tiers from [MyTiers](https://mytiers.ru) and [CISTiers](https://cistiers.com), a Minecraft server status tile, music, photos, and setup. Everything is configured in two small config files.

## Features

- Bento layout: two independent columns of tiles with their own heights on desktop and tablet, one column on phones
- Discord profile card: banner, avatar decoration, profile effect, badges, server tag, live status, custom status, activities and Spotify, connections with Steam and TikTok stats
- Tiers card with MyTiers / CISTiers tabs, hover tooltips in the style of each site
- Minecraft server status: online players and a website button
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
  - Discord user ID, profile theme, name style, profile effect
  - site colors and background
  - extra social links (added after the Discord connections) and custom links
  - enabled tiles (`features`)
  - MyTiers username and kit colors, CISTiers username
  - Minecraft server address
  - partner pills
  - setup photo and specs, photo gallery

## Layout

The layout is defined in `src/App.vue`. It is not a grid with aligned rows: there are two independent columns, and every tile keeps its natural height, so tiles of different sizes sit next to each other.

```text
desktop and tablet (≥768px)              phone
┌──────────────┬──────────────┐          ┌──────────┐
│              │    tiers     │          │ Discord  │
│   Discord    │              │          │ tiers    │
│   profile    ├───────┬──────┤          │ pills    │
│              │cisprac│mytier│          │ music    │
│              ├───────┴──────┤          │ server   │
│              │    server    │          │ photos   │
├──────────────┼──────────────┤          │ setup    │
│    music     │              │          └──────────┘
├──────────────┤    setup     │
│    photos    │              │
└──────────────┴──────────────┘
```

The bottoms of the columns line up because the last tile of each column (photos on the left, setup on the right) grows to fill the shorter column: the photo collage or the setup photo gets taller instead of leaving empty space.

On phones the columns turn into one stream (`display: contents`), and the order is set with Tailwind `order-*` classes on each tile. To add a new block, create a component whose root is a card (for example `class="glass-card"`), put it into a column above its last tile (the last one is the one that stretches), and give it an `order-*` class for its place in the phone stream, renumbering the others if needed:

```vue
<MyBlock class="order-5" />
```

Every tile is a CSS container (`container-type: inline-size`), so components adapt to the width of their own cell with `@container` queries instead of viewport media queries. The same component looks right in a desktop column and in a narrow phone column.

## Discord Profile

The profile card is built from the Discord user ID (`profile.discord.userId`) and public APIs that work straight from the browser:

| Data | Source | Updates |
| --- | --- | --- |
| Status, device, custom status, games, Spotify | [Lanyard](https://github.com/Phineas/lanyard) (REST + WebSocket) | live |
| Avatar, avatar decoration, display name, server tag | Lanyard, with the full profile as fallback | live |
| Banner, all badges, connections (with Steam and TikTok stats) | [dcdn.dstn.to](https://dcdn.dstn.to) full profile, [japi.rest](https://japi.rest) as fallback | on page load |
| Member since | computed from the ID itself | — |
| About me | `identity.bio` | manual |
| Profile theme, name style, profile effect | `profile.discord` | manual |
| Extra links after the connections | `profile.social` | manual |

**Lanyard only tracks users who joined its Discord server.** Join [discord.gg/lanyard](https://discord.gg/lanyard) once — until then the card works, but without status and activities.

Connections are shown like in Discord: an icon tile, the account name with an arrow when the service has a public page (Epic Games and Xbox have none), and stats from Discord: Steam member date, games and Dota 2 / TF2 items, TikTok followers, following and likes. The numbers are the ones Discord stores for the connection, so they update when Discord refreshes them. Links from `profile.social` are added after the connections; a link whose service is already connected in Discord (for example `tiktok`) is hidden and only shows up if the full profile fails to load. If dstn.to is down, japi.rest still gives the banner, but badges fall back to HypeSquad and Nitro and the connections section shows only `profile.social`.

Animated banners and decorations load after their static versions and are skipped entirely with `prefers-reduced-motion`.

## Profile Effect

The animation over the Discord card (`profile.discord.profileEffect`) is a Discord profile effect, played with Discord's own timings. The current one is "Let's Play" («Поиграем?»): the intro plays once after the "click to me" screen is closed, then a short loop repeats every few seconds.

The effect files are APNG images in `public/effects/`. They are served from the site itself because the player fetches each file once and creates a new blob URL for every run, so the animation restarts from the first frame. With `prefers-reduced-motion` or data saver on, a static frame (`reducedMotionSrc`) is shown instead.

To use a different effect:

1. Open `https://dcdn.dstn.to/profile/<your Discord ID>` and copy `user_profile.profile_effect.sku_id`.
2. Open `https://discord.com/api/v9/collectibles-products/<sku_id>`. In `items[0]` you get `reducedMotionSrc` and the `effects` list: `src`, `start`, `duration`, `loop`, `loopDelay`, `zIndex` for every layer.
3. Download every `src` and `reducedMotionSrc` into `public/effects/<name>/` and copy the numbers into `profileEffect.layers`.

Remove `profileEffect` to turn the effect off.

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

The server tile (`profile.server`) is a short row: the server icon, online status, online/max players with a bar, and a button to `websiteUrl` (in a narrow tile only the globe icon is left). Data comes from [api.mcsrvstat.us](https://api.mcsrvstat.us) in the browser and refreshes every 2.5 minutes. Turn it off with `features.serverStatus`.

The partner pills (`profile.partners`) sit under the tiers card in one row.

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

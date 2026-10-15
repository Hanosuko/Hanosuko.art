# Hanosuko.art

Personal link-in-bio site built with Vue 3, TypeScript, Vite, Tailwind CSS, and a small optional Node API.

The page is a responsive bento layout: a Discord-style profile with live status, Minecraft tiers from [MyTiers](https://mytiers.ru) and [CISTiers](https://cistiers.com), a Minecraft server status tile, music, photos, and setup. Everything is configured in two small config files.

## Features

- Bento layout: two independent columns of tiles with their own heights on desktop and tablet, one column on phones
- Discord profile card: banner, avatar decoration, profile effect, badges with Discord-style hover cards, server tag, live status, custom status, activities and Spotify, connections with TikTok stats
- Animated icons ([morphicons](https://www.morphicons.com)): play/pause, mute, copy IP, hover effects
- Tiers card with MyTiers / CISTiers tabs, each styled like its own site, with its font and hover tooltips; kit icons and logos are stored in the project
- Minecraft server status as a row from the in-game server list: MOTD, live online count in the game font, selection on click, tooltip on the ping icon
- Link preview (Open Graph) image generated at build time from the config
- Music player with an auto-generated `public/music/manifest.json`
- Photo bento for up to 6 photos and a PC setup tile
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
  - Discord user ID, profile theme, name style, badges, connections, profile effect
  - site colors and background
  - extra social links (added after the Discord connections) and custom links
  - enabled tiles (`features`)
  - MyTiers username and kit colors, CISTiers username
  - Minecraft server address (copied by the IP button) and logo
  - partner pills
  - setup photo and specs, photo gallery

## Layout

The layout is defined in `src/App.vue`. It has two rows, each with two groups of tiles: Discord and the music player | tiers, partner pills and the server on top; photos | setup at the bottom. Inside a group every tile keeps its natural height, so tiles of different sizes sit next to each other.

```text
desktop and tablet (≥768px)              phone
┌──────────────┬──────────────┐          ┌──────────┐
│              │    tiers     │          │ Discord  │
│   Discord    │              │          │ tiers    │
│   profile    ├───────┬──────┤          │ pills    │
│              │cisprac│mytier│          │ music    │
├──────────────┼───────┴──────┤          │ server   │
│    music     │    server    │          │ photos   │
├──────────────┼──────────────┤          │ setup    │
│    photos    │    setup     │          └──────────┘
└──────────────┴──────────────┘
```

The edges line up because the last tile of each group grows to match the other group in its row: the server tile stretches down to the bottom of the music player, so the photos and the setup start on one line, and the photo collage grows to the bottom of the setup.

On phones the groups turn into one stream (`display: contents`), and the order is set with Tailwind `order-*` classes on each tile. To add a new block, create a component whose root is a card (for example `class="glass-card"`), put it into a group above its last tile (the last one is the one that stretches), and give it an `order-*` class for its place in the phone stream, renumbering the others if needed:

```vue
<MyBlock class="order-5" />
```

Every tile is a CSS container (`container-type: inline-size`), so components adapt to the width of their own cell with `@container` queries instead of viewport media queries. The same component looks right in a desktop column and in a narrow phone column.

## Discord Profile

The profile card is built from the Discord user ID (`profile.discord.userId`) and public APIs. japi.rest and Lanyard are called through our backend first (`GET /api/discord/user?id=` and `/api/discord/presence?id=`, `server/discord.js`, cached for 10 minutes and 10 seconds), because without a VPN the browser may not reach them from Russia; if the backend doesn't answer, the browser calls them directly. Live updates come from the Lanyard WebSocket; if it doesn't open within 10 seconds, the status is polled through the backend every 30 seconds instead. The backend proxies only one user ID (`DISCORD_USER_ID`, by default the one in `server/discord.js`), so it can't be used as an open proxy. In dev and preview Vite answers these routes itself.

| Data | Source | Updates |
| --- | --- | --- |
| Status, device, custom status, games, Spotify | [Lanyard](https://github.com/Phineas/lanyard) (REST + WebSocket) | live |
| Avatar, banner, avatar decoration, server tag icon, badge icons | local copies in `src/assets/discord/`, `public/discord/avatar.png` and `src/assets/badges/icons/` (`profile.discord.media`) | manual |
| Display name, server tag | Lanyard, with the full profile as fallback | live |
| HypeSquad and Nitro badges (when `badges` is not set) | [japi.rest](https://japi.rest) | on page load |
| Full badge list with hover tooltips, connections (with TikTok stats) | `profile.discord.badges`, `profile.discord.connections` | manual |
| Member since | computed from the ID itself | — |
| About me | `identity.bio` | manual |
| Profile theme, name style, profile effect | `profile.discord` | manual |
| Extra links after the connections | `profile.social` | manual |

**Lanyard only tracks users who joined its Discord server.** Join [discord.gg/lanyard](https://discord.gg/lanyard) once — until then the card works, but without status and activities.

### Discord images

`cdn.discordapp.com` doesn't open in Russia without a VPN, so the avatar, banner, decoration and server tag icon are stored in the project and set in `profile.discord.media` — they always win over what the API returns. They are in `src/assets/discord/` (the build adds a hash to the names, so they are cached for a year and a new file shows up right away); only the avatar is in `public/discord/`, because the link preview (`identity.avatarUrl`) is rendered from it too. Remove a field and the card falls back to the Discord CDN. After changing them in Discord, download them again (from somewhere the CDN opens). The hashes are in `https://japi.rest/discord/v1/user/<id>` → `data`:

```sh
C=https://cdn.discordapp.com U=<user id>
curl -o public/discord/avatar.png                  "$C/avatars/$U/<avatar>.png?size=256"
curl -o src/assets/discord/banner.png              "$C/banners/$U/<banner>.png?size=600"
curl -o src/assets/discord/banner.webp             "$C/banners/$U/<banner>.webp?size=600&animated=true"
curl -o src/assets/discord/decoration.png          "$C/avatar-decoration-presets/<avatar_decoration_data.asset>.png?size=240&passthrough=false"
curl -o src/assets/discord/decoration-animated.png "$C/avatar-decoration-presets/<avatar_decoration_data.asset>.png?size=240&passthrough=true"
curl -o src/assets/discord/clan-badge.png          "$C/clan-badges/<primary_guild.identity_guild_id>/<primary_guild.badge>.png?size=32"
```

Badge icons from `profile.discord.badges` are in `src/assets/badges/icons/` (`$C/badge-icons/<hash>.png`).

Discord has no public API for connections or for the full badge list (the API gives only HypeSquad and Nitro), so both are listed in the config. Connections are shown like in Discord: an icon tile, the account name with an arrow when there is a `url` (Discord shows Epic Games and Xbox without one), and stats under the name. The `metadata` keys are the same as in Discord: `created_at`, `game_count`, `item_count_dota2`, `item_count_tf2` for Steam, `follower_count`, `following_count`, `likes_count` for TikTok. The numbers are updated by hand. TikTok blocks requests from servers with an anti-bot page, so they can't be fetched automatically; the official way is the [TikTok Display API](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info), which needs a TikTok developer app authorized by the account owner. Links from `profile.social` are added after the connections, except for services that are already in `connections`.

Animated banners and decorations load after their static versions and are skipped entirely with `prefers-reduced-motion`.

### Server tag card

Clicking the server tag next to the username (MyTL) opens a server card like in Discord: banner, icon, name, tag, online and member counts, and the founding date (computed from the server ID). Discord has no public API for other servers, so the name, icon, banner colors, and counts are set in `profile.discord.guild`; without it the tag is a plain pill. The «Go to Server» button doesn't navigate anywhere — the label slides away and «Maybe next time :)» slides in, then it switches back. The card closes on a second click on the tag, a click elsewhere, or Esc.

### Badge tooltips

Hovering a badge shows a tooltip like in Discord. The kind is set per badge in `profile.discord.badges`:

- no `tooltip` — a dark tooltip with the badge `label` (HypeSquad, Completed a Quest, Originally known as…); long text wraps
- `tooltip: { kind: 'detail', title, text }` — a dark tooltip with the badge icon on the left (Last Meadow Online / Level 44 Reached)
- `tooltip: { kind: 'card', theme, imageUrl, eyebrow?, title, text? }` — a card with a big image: `light` (Orbs), `dark` (Gifting) or `nitro` (light with a golden tint, the title is followed by NITRO). The big images are stored in `src/assets/badges/`

The tooltip is rendered into `<body>`, so the card never clips it. Near the edge of the screen it moves inward while the arrow stays above the badge, and it opens below the badge when there is no room above. On phones it opens on tap and closes on a tap elsewhere; with a keyboard it opens on focus.

## Profile Effect

The animation over the Discord card (`profile.discord.profileEffect`) is a Discord profile effect, played with Discord's own timings. The current one is "Let's Play" («Поиграем?»): the intro plays once after the "click to me" screen is closed, then a short loop repeats every few seconds.

The effect files are APNG images in `src/assets/effects/`. They are served from the site itself because the player fetches each file once and creates a new blob URL for every run, so the animation restarts from the first frame. With `prefers-reduced-motion` or data saver on, a static frame (`reducedMotionSrc`) is shown instead.

To use a different effect:

1. Find the effect in the Discord Shop and copy its SKU from the item link (`…/shop#itemSkuId=<sku_id>`).
2. Open `https://discord.com/api/v9/collectibles-products/<sku_id>`. In `items[0]` you get `reducedMotionSrc` and the `effects` list: `src`, `start`, `duration`, `loop`, `loopDelay`, `zIndex` for every layer.
3. Download every `src` and `reducedMotionSrc` into `src/assets/effects/<name>/`, import them in `src/config/profile.ts` and copy the numbers into `profileEffect.layers`.

Remove `profileEffect` to turn the effect off.

## Tiers: MyTiers and CISTiers

The tiers card has two tabs. MyTiers is the default; CISTiers loads when its tab is opened for the first time. Remove `profile.cistiers` to keep only MyTiers.

**MyTiers** — loaded straight from the browser, the API sends `Access-Control-Allow-Origin: *`:

- `GET https://mytiers.ru/api/players/{nickname}` — rank, points, current and peak tier per kit
- `GET https://mytiers.ru/api/guilds` — kit list and order
- `https://mytiers.ru/api/avatar/{nickname}?s=256` — skin render for the avatar and banner (used by both tabs)

New kits added on MyTiers appear automatically. Tile colors per kit are set in `profile.mytiers.kitColors` (keyed by kit slug); kits without a color use the tier color.

Kit icons and the tab logos are not loaded from the tier sites — they are stored in the project and picked up by kit slug: `src/assets/tiers/mytiers/<slug>.svg`, `src/assets/tiers/cistiers/<slug>.webp`, and `src/assets/tiers/*-logo.*` for the tabs. A kit that appears on a site later and has no file yet falls back to the site's icon until you add one.

**CISTiers** — its [public API](https://cistiers.com/docs) has no CORS, so the browser calls our proxy `GET /api/cistiers?username=...` (`server/cistiers.js`):

- downloads `https://cistiers.com/api/config` (kits, colors, icons, points per tier) and the CDN player dump `https://cdn.cistiers.com/api/dump.json`
- caches both for an hour, as their `cache-control` asks; a stale snapshot is served instantly while a fresh one loads in the background
- computes points and the overall place among all players
- in production it runs in `server/`, in `npm run dev` / `npm run preview` the same module is served by Vite

CISTiers blocks generic User-Agents and asks for a project name and contact. Set yours in `server/.env`:

```bash
CISTIERS_USER_AGENT="MySite/1.0 (+https://example.com; contact@example.com)"
```

Each tab looks like its own site:

- **MyTiers** — tilted kit icons and the tier in the kit color, text in [Geist](https://vercel.com/font); ranked kits first, sorted by points
- **CISTiers** — tiles as in a cistiers.com profile: the kit color over a dark gradient, the icon straight above the tier, untested kits dimmed with a dash, kits in the site's order; text in [Open Sans](https://fonts.google.com/specimen/Open+Sans)

Both fonts are self-hosted in `src/assets/fonts/` (variable fonts, latin, latin-ext, and cyrillic as separate files, so the browser downloads only what it needs). Tab labels always use their own font, so switching tabs doesn't change their width. Tiles of both tabs have the same size, so the card height doesn't jump.

Tiles are not links: hovering lifts a tile and shows a tooltip in the style of the current tab's site (MyTiers — tier name and points above the tile, with a Peak note when the peak was higher; CISTiers — kit icon, name, and points following the cursor), a click only presses it. Under the grid there is one wide button to the profile on the open tab's site.

## Animated Icons

Icons that change state morph into each other with a spring instead of jumping ([morphicons](https://www.morphicons.com)): play ↔ pause and volume ↔ mute in the player, a music note that turns into an audio wave while a track plays, copy ↔ check on the server copy-IP button, the connection arrow turning right on hover, and a blinking eye next to the view counter. With `prefers-reduced-motion` the icons swap instantly and the eye does not blink.

morphicons takes icon data, not components: static icons come from `lucide-vue-next`, morphing ones from the `lucide` data package. Keep both at the same version so the icons match:

```vue
<script setup lang="ts">
import { Check, Copy } from 'lucide'
import { MorphIcon } from 'morphicons/vue'
</script>

<template>
  <MorphIcon :icon="copied ? Check : Copy" :size="16" spring="bouncy" reduced-motion="user" />
</template>
```

## Minecraft Server Status

The server tile (`profile.server`) looks like the server's row in the Minecraft multiplayer list: icon, name, MOTD, ping icon and the online count.

- The row is a game screenshot at GUI scale 2 (610×72): `motd.image` with a transparent background for the normal state and `motd.selectedImage` (white frame on black, like a selected server in the game) after a click. A click anywhere else, Tab or Esc returns the normal state; a second click on the row does too. Both images are in `src/assets/server/`. The normal one was made from the selected one: the frame removed and the black background made transparent, so both states show exactly the same MOTD (obfuscated `§k` characters differ between screenshots otherwise).
- The online count («45/991») is drawn on top in the top right corner, like in the game: in the game font, with the same vertical gradient and shadow, 13 px left of the ping icon (`src/utils/minecraftText.ts`). The digits 4, 5, 9, 1 and «/» were taken pixel by pixel from a game screenshot; 0, 2, 3, 6, 7 and 8 were not on it and are drawn in the same style — fix any of them right in the glyph table. While the server hasn't answered or is offline the count is hidden.
- Hovering the count or the ping icon shows `motd.tooltipImage` next to the cursor, like a game tooltip (on phones — tap, it hides on the next tap). `motd.tooltipText` is the same text for screen readers.
- The row is drawn on a canvas so it can't be dragged or saved by a long press. Its size is picked so that one game GUI pixel is a whole number of screen pixels (610 px wide on desktop, 305 px on phones), otherwise the pixels would come out uneven. If the coordinates of the ping icon change in a new screenshot, update the constants at the top of `ServerStatus.vue`.

Data comes from our `GET /api/server` (`server/minecraft.js`): the backend pings the server itself over the Minecraft Server List Ping protocol (SRV record first, then port 25565) and caches the answer for 30 seconds; the tile refreshes every 30 seconds. It's faster than [api.mcsrvstat.us](https://api.mcsrvstat.us), which caches for 5 minutes and is often slow without a VPN from Russia — mcsrvstat.us is only used when the backend doesn't answer. In dev and preview Vite answers `/api/server` itself. The pinged address is `cisprac.xyz` by default (`server/minecraft.js`); set `MC_SERVER_ADDRESS` (`host` or `host:port`) for another server. Turn the tile off with `features.serverStatus`.

- `address` — the IP players connect to; its online count is shown
- `motd` — the three images and the tooltip text described above

The partner pills (`profile.partners`) sit under the tiers card in one row; their icons are the same logos stored in the project.

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

Photos live in `src/assets/photos/` as WebP: the build adds a hash to their names, so browsers cache them for a year and a replaced photo shows up right away. The cells are a few hundred pixels wide, so 1440 px on the long side is plenty. Convert a new photo with `cwebp` (`brew install webp`):

```sh
cwebp -q 80 -m 6 -metadata none -resize 1440 0 photo.jpg -o src/assets/photos/photo1.webp   # landscape
cwebp -q 80 -m 6 -metadata none -resize 0 1440 photo.jpg -o src/assets/photos/photo4.webp   # portrait
```

A file in `public/photos/` also works (`photoUrl` falls back to it), but without the hash it is cached for a week under the same name.

The gallery (`profile.gallery.photos`) is a bento for up to 6 photos: the 1st is wide on top, the 2nd and 3rd are squares on the left, the 4th is tall on the right (good for a vertical photo), the 5th and 6th fill the bottom row. The layout adapts to the number of photos, and a photo whose file is missing is skipped, so there are never empty or broken cells. Two extra places are already in the config: `photo5.webp` and `photo6.webp`.

The setup photo frame takes the proportions of the photo itself, so a new setup photo is never cropped.

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

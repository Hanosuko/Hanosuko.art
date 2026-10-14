# Hanosuko.art

Personal link-in-bio site built with Vue 3, TypeScript, Vite, Tailwind CSS, and a small optional Node API for the view counter.

The project is designed as a customizable profile page: social links, partners, custom buttons, music, photos, setup, and Minecraft tiers from [MyTiers](https://mytiers.ru) all live in one config file and are laid out as a responsive bento grid.

## Features

- Vue 3 Composition API with `<script setup>`
- Theme and profile configuration in `src/config/profile.ts`
- Bento grid layout: 12 columns on desktop, 2 on tablet, 1 on phones
- Social links, partners, custom links, setup, photo gallery
- MyTiers profile card: rank, points, tier per kit, skin render
- Music player with an auto-generated `public/music/manifest.json`
- Mobile-first details: safe-area insets, touch-friendly controls, no sticky hover effects
- Optional backend for view counting
- Vite production build to `dist/`

## Requirements

- Node.js 18+
- npm

## Development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

Useful commands:

```bash
npm run type-check
npm run build
npm run preview
```

## Customization

Most site content is configured in:

```text
src/config/profile.ts
```

Edit that file to change:

- nickname, avatar, and bio
- theme colors and background
- social links and custom links
- enabled sections (`features`)
- MyTiers username and kit colors
- partner buttons
- setup photo and specs
- photo gallery paths

## Layout

The page is a bento grid defined in `src/App.vue`:

```text
desktop (lg, ≥1024px)          tablet (md, ≥768px)     phone
┌──────────┬───────────────┐   ┌─────────┬─────────┐   ┌─────────┐
│ profile  │               │   │ profile │ MyTiers │   │ profile │
│ music    │    MyTiers    │   │ music   │         │   │ music   │
│ partners │               │   │ partners│         │   │ partners│
├──────────┼───────────────┤   ├─────────┼─────────┤   │ MyTiers │
│ gallery  │     setup     │   │ gallery │  setup  │   │ gallery │
└──────────┴───────────────┘   └─────────┴─────────┘   │ setup   │
                                                       └─────────┘
```

Tile widths are plain Tailwind classes (`col-span-12 md:col-span-6 lg:col-span-7`). To add a new block, create a component whose root is a card (for example `class="glass-card"`) and append it to the end of the grid:

```vue
<MyBlock class="col-span-12 md:col-span-6 lg:col-span-4" />
```

Every tile is a CSS container (`container-type: inline-size`), so components adapt to the width of their own cell with `@container` queries instead of viewport media queries. The same component looks right in a wide desktop cell and in a narrow phone column.

## MyTiers

The tiers card loads data straight from the public MyTiers API in the browser — no proxy is needed (the API sends `Access-Control-Allow-Origin: *`):

- `GET https://mytiers.ru/api/players/{nickname}` — rank, points, current and peak tier per kit
- `GET https://mytiers.ru/api/guilds` — kit list, order, icons, and Discord links
- `https://mytiers.ru/api/avatar/{nickname}?s=256` — skin render for the avatar and banner

New kits added on MyTiers appear automatically. Tile colors per kit are set in `profile.mytiers.kitColors` (keyed by kit slug); kits without a color use the tier color.

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

It uses SQLite through `better-sqlite3`.

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

For the view counter, also deploy `server/` and run it behind Nginx/Caddy/systemd. Example configs are in `deploy/`.

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

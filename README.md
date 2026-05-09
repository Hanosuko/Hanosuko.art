# Hanosuko.art

Personal link-in-bio site built with Vue 3, TypeScript, Vite, Tailwind CSS, and a small optional Node API for views and CISTiers proxying.

The project is designed as a customizable profile page: social links, custom buttons, music, photos, setup panel, and Minecraft tiers all live in one config file.

## Features

- Vue 3 Composition API with `<script setup>`
- Theme and profile configuration in `src/config/profile.ts`
- Social links, custom links, setup panel, photo gallery
- Music player with an auto-generated `public/music/manifest.json`
- Optional backend for view counting and `/api/tiers`
- CISTiers profile block with local development proxy
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
- enabled sections
- CISTiers username and links
- setup panel text
- photo gallery paths

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

Real music files are ignored by Git on purpose. Do not publish copyrighted tracks unless you have the right to distribute them.

## Photos

Put personal photos in:

```text
public/photos/
```

or bundle template-safe assets through `src/assets/photos/`.

Real photos in `public/photos/` are ignored by Git on purpose.

## Optional Backend

The `server/` folder contains a small Express API:

- `GET /api/health`
- `GET /api/views`
- `POST /api/views`
- `GET /api/tiers?username=...`

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

For the view counter and tiers proxy, also deploy `server/` and run it behind Nginx/Caddy/systemd. Example configs are in `deploy/`.

`deploy.sh` is intentionally generic and expects environment variables:

```bash
REMOTE_HOST=example.com REMOTE_USER=deploy REMOTE_ROOT=/var/www/my-site ./deploy.sh
```

## Open Source Notes

This repository intentionally ignores:

- `node_modules/`
- `dist/`
- real music files in `public/music/`
- real photos in `public/photos/`
- `.env` files

Before publishing, run:

```bash
git status --short
git diff --cached --stat
```

and make sure you are not committing private media, secrets, or server credentials.

## License

MIT

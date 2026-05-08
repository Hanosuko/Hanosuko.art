# Hanosuko.art

Личный link-in-bio сайт `Hanosuko` на Vue 3 + TypeScript + Vite + Tailwind.
Тёмная aesthetic, glassmorphism, анимированный фон, иконки соцсетей, кастомные ссылки, опциональный аудиоплеер, счётчик просмотров и блок Minecraft-тиров с [cistiers.com](https://cistiers.com).

## Стек
- Vue 3 (Composition API, `<script setup>`)
- TypeScript (strict)
- Vite 6
- Tailwind CSS 3
- lucide-vue-next (иконки UI)

## Структура
```
src/
  assets/          шрифты и иконки китов (опционально)
  components/      AnimatedBackground, ProfileCard, SocialLinks, CustomLinks,
                   CistiersProfile, MusicPlayer, ViewCounter
  composables/     useTiers, useThemeVars
  config/
    profile.ts     ← ВСЯ КАСТОМИЗАЦИЯ ЗДЕСЬ
  types/           profile.ts, cistiers.ts
  App.vue
  main.ts
  style.css
```

## Установка и запуск

Требуется Node.js ≥ 18.

```bash
npm install
npm run dev          # dev сервер: http://localhost:5173
npm run type-check   # vue-tsc
npm run build        # production билд в dist/
npm run preview      # превью продакшен сборки
```

## Кастомизация

**Всё настраивается в одном файле:** [`src/config/profile.ts`](src/config/profile.ts).

В нём есть русскоязычные маркеры-комментарии (👇), указывающие где править:
- ник, био, аватар
- цвета темы (accent, glow, фон)
- тип фона (gradient / particles / static)
- ссылки на соцсети (telegram, discord, github, tiktok, youtube, minecraft)
- кастомные ссылки (любой список с описаниями и иконками-эмодзи)
- настройки аудиоплеера и cistiers
- feature-флаги: что показывать, а что прятать

## Деплой

### Vercel
1. `npm i -g vercel && vercel` (или подключи репо в дашборде).
2. Build command: `npm run build`. Output dir: `dist`.
3. В Domains добавь `Hanosuko.art` → следуй DNS-инструкциям Vercel (A / CNAME).

### Netlify
1. New site → Import from Git → выбери репо.
2. Build: `npm run build`, publish dir: `dist`.
3. Domain settings → Add custom domain `Hanosuko.art`.

### Cloudflare Pages
1. Workers & Pages → Create → connect Git.
2. Framework preset: Vite. Build: `npm run build`. Output: `dist`.
3. Custom domains → `Hanosuko.art`.

## Известные ограничения

- **CORS на cistiers API.** Браузер может блокировать прямой запрос к `cistiers.com`. Если блок — заведи прокси (Vercel Edge Function / Cloudflare Worker), который тянет JSON и возвращает с CORS-заголовками, и поменяй `cistiers.apiUrl` в конфиге.
- **Шрифт Minecraft Five.** Положи `.woff2` файл в `src/assets/fonts/` и раскомментируй `@font-face` в `src/style.css`. Без этого fallback на system-ui.
- **Тиры китов.** Иконки сейчас грузятся напрямую с `storage.cistiers.com`. Чтобы убрать внешнюю зависимость — скачай 8 PNG в `src/assets/tier-icons/` (см. README в папке) и поменяй пути в `CistiersProfile.vue`.
- **View counter.** Сейчас просто число из конфига (`fakeValue`). Чтобы подключить реальный — замени тело `ViewCounter.vue` запросом к counterapi.dev / собственному endpoint.
- **Discord avatar.** Hash аватара меняется когда ты меняешь аватарку в Discord — придётся обновлять URL в конфиге вручную.

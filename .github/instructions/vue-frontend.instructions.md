---
name: 'Vue 3 + TypeScript (Hanosuko.art)'
description: 'Hanosuko.art frontend conventions — applies to all Vue/TS source files'
applyTo: 'src/**/*.{vue,ts}'
---

# Vue 3 + TypeScript Rules

## Architecture
- Composition API only, `<script setup lang="ts">` во всех `.vue`.
- Все данные профиля (ник, аватар, bio, ссылки, цвета, фон, фич-флаги) — только в `src/config/profile.ts`. Хардкоды в компонентах запрещены.
- Типы — в `src/types/`, переиспользуются через импорт. Никакого дублирования интерфейсов.
- Composables (`use*`) — в `src/composables/`. Любая работа с внешним API (cistiers, view counter) выносится в composable.
- Глобальные стили и CSS-переменные — в `src/styles/`. Тема пробрасывается через `--color-*` custom properties, инициализируется из конфига при старте.
- Без backend, без серверных роутов, без SSR. Только статика для деплоя на хостинг под `Hanosuko.art`.
- **Стили**: Tailwind CSS — основной инструмент для layout/spacing/responsive. Scoped `<style>` в компонентах — для сложных эффектов (glassmorphism, neon glow, animated background, keyframe-анимации) и `@font-face`.
- **Иконки**: `lucide-vue-next` для нейтральных (`MessageCircle`, `Music`, `Eye`...). Для брендов соцсетей (Telegram, Discord, GitHub, TikTok, YouTube) — inline SVG с official path data, потому что lucide их не покрывает или покрывает неточно.

## TypeScript
- `strict: true` в `tsconfig.json`. Никаких `any`, `as any`, `// @ts-ignore` без письменного обоснования рядом.
- `defineProps<{...}>()` и `defineEmits<{...}>()` — type-only, не runtime.
- Конфиг профиля — `as const` + явный тип `Profile`.
- Внешние ответы API типизируй через интерфейс (`CistiersResponse`, `DiscordAvatar`...), не доверяй `unknown` без валидации.

## Конфиг профиля (`src/config/profile.ts`)
- Один экспорт-default объект `profile: Profile`.
- Маркеры-комментарии **на русском** перед каждой секцией: «// 👇 меняй ник здесь», «// 👇 цвета темы», «// 👇 ссылки на соцсети», «// 👇 включить/выключить аудио-плеер».
- Поля сгруппированы: `identity` (nick, avatarUrl, bio), `theme` (colors, background), `social[]`, `customLinks[]`, `features` (audioPlayer, viewCounter, tiers), `audio` (track URL, autoplay), `tiers` (apiUrl, username).
- Ссылки соцсетей — массив объектов `{ id: 'telegram' | 'discord' | 'github' | 'tiktok' | 'youtube' | 'minecraft' | string, url: string, label?: string }`. Иконка резолвится по `id`.

## Компоненты
- Один компонент = одна ответственность. Если файл больше ~150 строк — повод декомпозировать.
- `<style scoped>` обязателен (или CSS-модуль). Глобальные стили — только в `src/styles/`.
- Состояния `loading`, `error`, `empty`, `success` — обязательны для всего, что подгружает данные.
- Условный рендер опциональных фич — через `v-if="config.features.xxx"`, не через комментирование кода.
- Анимации иконок — CSS `transition` / `@keyframes`, без heavy JS.

## Внешние интеграции
- **Discord avatar**: рендерится из `profile.identity.avatarUrl` как `<img>` с `loading="lazy"` и `alt`.
- **cistiers API** (`https://cistiers.com/api/profile/{username}`): только GET, через `fetch` в `useTiers()`. Обрабатывай 4xx/5xx и сетевые ошибки.
- Внешние ссылки — `target="_blank"` + `rel="noopener noreferrer"` всегда.

## Безопасность
- Никогда не используй `v-html` с внешними данными.
- Не подставляй URL из конфига в `:href` без проверки на `http(s)://` или `mailto:` (фильтруй `javascript:`).
- Никаких токенов/секретов в коде. `VITE_*` env попадают в bundle — туда только публичные значения.

## Self-Documenting Code
- Zero comments policy. **Исключение**: маркеры на русском, указывающие пользователю на конфиг.
  - В `src/config/profile.ts` — перед каждой секцией («// 👇 меняй ник здесь», «// 👇 цвета темы»).
  - В компонентах допустимо, если настройка важна для пользователя: «// 👇 URL трека меняй в src/config/profile.ts → audio.trackUrl».
  - Маркеры всегда указывают **куда идти в конфиг**, а не объясняют код.
- Длинные понятные имена: `fetchTiersFromCistiers`, не `getData`.
- Early returns в guard clauses.
- Маленькие функции с одной ответственностью.

## Anti-patterns to avoid
- ❌ Options API (`export default { data() { ... } }`) — используем только Composition.
- ❌ Прямой `document.getElementById` / DOM-манипуляции — используй `ref` и шаблонные `ref="..."`.
- ❌ Хардкод цветов/ника/ссылок в компонентах.
- ❌ `any` в любом виде.
- ❌ Большие god-компоненты, делающие fetch + state + рендер сразу — выноси fetch в composable.
- ❌ Inline SVG, скопированные по 5 раз — заверни в `<SocialIcon :id="...">`.
- ❌ Глобальные стили без `:root`/`html`/`body` scope.
- ❌ Использование `process.env.*` (Vite — это `import.meta.env.*`).

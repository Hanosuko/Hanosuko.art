import type { Identity } from '@/types/profile'

// 👇 ОСНОВНАЯ ЛИЧНАЯ ИНФА — ник, аватар, описание, адрес сайта.
// Отдельным файлом, потому что её читает и сборка: из неё рисуется превью ссылки (OG-картинка)
// и мета-теги для Telegram/Discord. Остальные настройки — в profile.ts.
export const identity: Identity = {
  nickname: 'Hanosuko',
  // 👇 АВАТАР: запасной, если Discord недоступен, и для превью ссылки (Discord CDN или любой другой URL)
  avatarUrl: 'https://cdn.discordapp.com/avatars/835533218869936168/906b3b525961914f00002aa737631332.webp',
  // 👇 «ОБО МНЕ»: для следующей строки используй \n
  bio: 'CISPractice Owner\nMyTiers OP Manager',
  // 👇 АДРЕС САЙТА — нужен для ссылок в превью (og:url, og:image)
  siteUrl: 'https://hanosuko.art',
}

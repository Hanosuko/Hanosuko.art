import type { Identity } from '@/types/profile'

// 👇 ОСНОВНАЯ ЛИЧНАЯ ИНФА — ник, аватар, описание, адрес сайта.
// Отдельным файлом, потому что её читает и сборка: из неё рисуется превью ссылки (OG-картинка)
// и мета-теги для Telegram/Discord. Остальные настройки — в profile.ts.
export const identity: Identity = {
  nickname: 'Hanosuko',
  // 👇 АВАТАР: запасной, если Discord недоступен, и для превью ссылки (файл из public/ или любой URL)
  avatarUrl: '/discord/avatar.png',
  // 👇 «ОБО МНЕ»: для следующей строки используй \n
  bio: 'CISPractice Owner\nMyTiers OP Manager',
  // 👇 АДРЕС САЙТА — нужен для ссылок в превью (og:url, og:image)
  siteUrl: 'https://hanosuko.art',
}

import type { Profile } from '@/types/profile'
import { identity } from './identity'

const photoAssets = import.meta.glob('/src/assets/photos/*.{avif,gif,jpeg,jpg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const photoUrl = (filename: string): string =>
  photoAssets[`/src/assets/photos/${filename}`] ?? `/photos/${filename}`

export const profile: Profile = {
  // 👇 НИК, АВАТАР, «ОБО МНЕ» И АДРЕС САЙТА — в src/config/identity.ts
  identity,

  // 👇 DISCORD-ПРОФИЛЬ: аватар, баннер, украшение, значки и клан подтягиваются по ID.
  // Статус, игры и Spotify в реальном времени — через Lanyard: зайди один раз на discord.gg/lanyard.
  // «Обо мне» — это identity.bio, «Connections» — список social ниже.
  discord: {
    userId: '835533218869936168',
    // 👇 ТЕМА ПРОФИЛЯ NITRO — два цвета из Discord → «Тема и баннер». Убери theme — карточка станет тёмной
    theme: { primary: '#c0c0ba', accent: '#000000' },
    pronouns: 'https://hanosuko.art',
    // 👇 НИК: шрифт (из src/style.css) и эффект toon — белые буквы с контуром и тенью
    nameStyle: { font: 'Almendra', effect: 'toon' },
    // 👇 ЗНАЧКИ в порядке Discord. Иконки: cdn.discordapp.com/badge-icons/<хеш>.png,
    // хеши ищи на github.com/mezotv/discord-badges. Без этого списка — только HypeSquad и Nitro из API
    badges: [
      { label: 'Nitro · Bronze', iconUrl: 'https://cdn.discordapp.com/badge-icons/4f33c4a9c64ce221936bd256c356f91f.png' },
      { label: 'HypeSquad Brilliance', iconUrl: 'https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png' },
      { label: 'Originally known as hanosuko', iconUrl: 'https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png' },
      { label: 'Completed a Quest', iconUrl: 'https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png' },
      { label: 'Last Meadow Online', iconUrl: '/badges/last-meadow.png' },
      { label: 'Orbs Apprentice', iconUrl: 'https://cdn.discordapp.com/badge-icons/83d8a1eb09a8d64e59233eec5d4d5c2d.png' },
      { label: 'Nitro Gifting · Patron', iconUrl: 'https://cdn.discordapp.com/badge-icons/ac305d1b9481f312ce4419e7f8296558.png' },
    ],
    // 👇 КОЛЛЕКЦИЯ ИГР: иконки — cdn.discordapp.com/app-icons/<id игры>/<хеш>.png
    games: {
      items: [
        { name: 'Minecraft', iconUrl: 'https://cdn.discordapp.com/app-icons/1402418491272986635/166fbad351ecdd02d11a3b464748f66b.png?size=96' },
        { name: 'Dota 2', iconUrl: 'https://cdn.discordapp.com/app-icons/356875988589740042/6b4b3fa4c83555d3008de69d33a60588.png?size=96' },
        { name: 'Mafia', iconUrl: 'https://cdn.discordapp.com/app-icons/1402416623675244716/ce1788c93938051c191daf0634021246.png?size=96' },
        { name: 'Mafia II', iconUrl: 'https://cdn.discordapp.com/app-icons/425443244285886494/4c58f02d685fd245fc4411c1195dbc87.png?size=96' },
      ],
      more: 16,
    },
  },

  // 👇 ЦВЕТА ТЕМЫ — все цвета сайта берутся отсюда
  theme: {
    background: '#121212',
    surface: 'rgba(41, 41, 41, 0.55)',
    text: '#f5f5f5',
    textMuted: '#a3a3a3',
    accent: '#e5e5e5',
    glow: 'rgba(229, 229, 229, 0.35)',
  },

  // 👇 ФОН: 'gradient' — анимированный градиент, 'particles' — частицы, 'static' — однотонный
  background: {
    variant: 'static',
    // imageUrl: 'https://...', // опционально, для статичного фона-картинки
  },

  // 👇 ССЫЛКИ НА СОЦСЕТИ (блок Connections) — добавляй/удаляй свободно. kind определяет иконку,
  // handle — ник под названием (если не указан, берётся из ссылки).
  social: [
    { kind: 'telegram', url: 'https://t.me/hanosuko', label: 'Telegram' },
    { kind: 'discord', url: 'https://discord.com/users/835533218869936168', label: 'Discord', handle: 'hanosuko' },
    { kind: 'github', url: 'https://github.com/hanosuko', label: 'GitHub' },
    { kind: 'tiktok', url: 'https://tiktok.com/@hanosuko', label: 'TikTok' },
    { kind: 'youtube', url: 'https://youtube.com/@hanosuko', label: 'YouTube' },
    { kind: 'namemc', url: 'https://namemc.com/profile/Hanosuko', label: 'NameMC' },
    { kind: 'modrinth', url: 'https://modrinth.com/user/hanosuko', label: 'Modrinth' },
  ],

  // 👇 КАСТОМНЫЕ ССЫЛКИ — любые произвольные. enabled: false скрывает ссылку.
  customLinks: [
    {
      title: 'Personal site',
      url: 'https://Hanosuko.art',
      description: 'this page',
      enabled: false,
    },
  ],

  // 👇 ПЕРЕКЛЮЧАТЕЛИ: true — блок виден, false — скрыт (tiers — карточка MyTiers)
  features: {
    audioPlayer: true,
    viewCounter: true,
    tiers: true,
    setup: true,
    gallery: true,
    serverStatus: true,
  },

  // 👇 АУДИО-ПЛЕЕР: треки берутся автоматически из public/music/.
  // Просто положи туда песню — они появятся в плеере. Здесь только настройки поведения.
  audio: {
    volume: 0.4,
    shuffle: false,
    autoplay: true,
  },

  // 👇 БЛОК MYTIERS: тиры, ранг и скин тянутся напрямую из https://mytiers.ru/api.
  // Меняй username на свой ник на mytiers.ru. Список китов и их иконки берутся с сайта.
  mytiers: {
    username: 'Hanosuko',
    siteUrl: 'https://mytiers.ru',
    // 👇 ЦВЕТ ПЛИТКИ КАЖДОГО КИТА (ключ — slug кита из mytiers.ru/api/guilds).
    // Если кита нет в списке — плитка красится в цвет тира.
    kitColors: {
      sword: '#539eff',
      op: '#4fd1b0',
      netherpot: '#b753ff',
      dpot: '#ff5050',
      crystal: '#a96bff',
      uhc: '#e93a3d',
      mace: '#7c7c96',
      diaop: '#5375ff',
      axe: '#5cceff',
      smp: '#8d8da3',
    },
  },

  // 👇 ВКЛАДКА CISTIERS в карточке тиров. Тиры берутся из публичного API cistiers.com
  // через наш сервер (/api/cistiers): у CISTiers нет CORS, напрямую из браузера нельзя.
  // В dev отвечает сам Vite. Удали этот блок — останется только MyTiers.
  cistiers: {
    username: 'Hanosuko',
    apiUrl: '/api/cistiers',
    siteUrl: 'https://cistiers.com',
  },

  // 👇 СТАТУС MINECRAFT-СЕРВЕРА: онлайн, MOTD и кнопка «скопировать IP».
  // Данные — с api.mcsrvstat.us (обновляются раз в 2,5 минуты). Выключить — features.serverStatus.
  server: {
    name: 'CISPractice',
    address: 'cisprac.xyz',
    websiteUrl: 'https://cisprac.xyz',
  },

  // 👇 ПАРТНЁРЫ — кнопки-плашки рядом с плеером
  partners: [
    {
      name: 'mytiers.ru',
      url: 'https://mytiers.ru',
      iconUrl: 'https://mytiers.ru/favicon-32x32.png',
    },
    {
      name: 'cisprac.xyz',
      url: 'https://cisprac.xyz',
      iconUrl: 'https://www.google.com/s2/favicons?domain=cisprac.xyz&sz=64',
    },
  ],

  // 👇 БЛОК «MY SETUP»: плитка с фото сетапа и списком комплектующих.
  // Место и ширина плитки в бенто-сетке — в src/App.vue.
  // Фото класть в src/assets/photos/setup.jpg или public/photos/setup.jpg.
  // Добавляй/убирай пункты в specs свободно — верстка подхватит.
  setup: {
    photoUrl: photoUrl('setup.jpg'),
    title: 'My Setup',
    description: 'My current PC build and peripherals.',
    specs: [
      { label: 'CPU',         value: 'Intel i3-10100F' },
      { label: 'GPU',         value: 'NVIDIA GTX 1660 SUPER 6 GB' },
      { label: 'RAM',         value: '16 GB DDR4 3200 MHz' },
      { label: 'Storage',     value: '960 GB SSD Kingston A400' },
      { label: 'Laptop',      value: 'MacBook Pro 16 M2 Pro 1 TB' },
      { label: 'Monitor 1',   value: '23.8" ARDOR AF24H1 180 Hz' },
      { label: 'Monitor 2',   value: '27" AOC i2769Vm 60 Hz' },
      { label: 'Keyboard',    value: 'Red Square Keyrox TKL' },
      { label: 'Mouse',       value: 'VXE R1 SE+' },
      { label: 'Headset',     value: 'Fifine H16' },
      { label: 'Microphone',  value: 'Fifine K669B' },
      { label: 'Webcam',      value: 'KEYRON KQ4M3FA1 2560×1440' },
    ],
  },

  // 👇 ГАЛЕРЕЯ: плитка-коллаж из 4 фото.
  // Место и ширина плитки в бенто-сетке — в src/App.vue.
  // Файлы можно положить в src/assets/photos/ или public/photos/.
  gallery: {
    title: 'me :]',
    photos: [
      photoUrl('photo1.jpg'),
      photoUrl('photo2.jpg'),
      photoUrl('photo3.jpg'),
      photoUrl('photo4.jpg'),
    ],
  },
}

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

  // 👇 DISCORD-ПРОФИЛЬ: аватар, баннер, украшение, значки, клан и интеграции (Steam, TikTok…)
  // подтягиваются по ID. Статус, игры и Spotify в реальном времени — через Lanyard: зайди один раз на discord.gg/lanyard.
  // «Обо мне» — это identity.bio, к интеграциям добавляются ссылки из social ниже.
  discord: {
    userId: '835533218869936168',
    // 👇 ТЕМА ПРОФИЛЯ NITRO — два цвета из Discord → «Тема и баннер». Убери theme — карточка станет тёмной
    theme: { primary: '#cecdc8', accent: '#000000' },
    pronouns: 'https://hanosuko.art',
    // 👇 НИК: шрифт (из src/style.css) и эффект toon — белые буквы с контуром и тенью
    nameStyle: { font: 'Almendra', effect: 'toon' },
    // 👇 ЭФФЕКТ ПРОФИЛЯ «Поиграем?» (Let's Play) — анимация поверх карточки, тайминги как в Discord.
    // Файлы лежат в public/effects/. Как достать другой эффект — в README, раздел «Profile Effect»
    profileEffect: {
      title: "Let's Play",
      reducedMotionSrc: '/effects/lets-play/static.png',
      layers: [
        { src: '/effects/lets-play/intro.png', start: 0, duration: 4904, zIndex: 110 },
        { src: '/effects/lets-play/loop.png', start: 7906, duration: 4906, loop: true, loopDelay: 3000, zIndex: 100 },
      ],
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

  // 👇 ССЫЛКИ НА СОЦСЕТИ — встают в блок Connections после интеграций Discord. kind определяет иконку,
  // handle — ник (если не указан, берётся из ссылки). Если такая интеграция уже есть в Discord (tiktok, youtube),
  // ссылка из этого списка скрывается и показывается, только когда профиль Discord не загрузился.
  social: [
    { kind: 'telegram', url: 'https://t.me/hanosuko', label: 'Telegram' },
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

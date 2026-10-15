import type { Profile } from '@/types/profile'
import { identity } from './identity'
import mytiersLogo from '@/assets/tiers/mytiers-logo.svg'

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

  // 👇 DISCORD-ПРОФИЛЬ: аватар, баннер, украшение и клан подтягиваются по ID.
  // Статус, игры и Spotify в реальном времени — через Lanyard: зайди один раз на discord.gg/lanyard.
  // «Обо мне» — это identity.bio, после интеграций идут ссылки из social ниже.
  discord: {
    userId: '835533218869936168',
    // 👇 АВАТАР, БАННЕР, УКРАШЕНИЕ И ЗНАЧОК ТЕГА — копии из Discord в public/discord/.
    // Discord CDN без VPN в РФ не открывается, поэтому картинки лежат у нас. Сменил аватар или
    // украшение в Discord — перекачай файл (как — в README, раздел «Discord images»)
    media: {
      avatar: '/discord/avatar.png',
      banner: { static: '/discord/banner.png', animated: '/discord/banner.webp' },
      decoration: { static: '/discord/decoration.png', animated: '/discord/decoration-animated.png' },
      clanBadge: '/discord/clan-badge.png',
    },
    // 👇 ТЕМА ПРОФИЛЯ NITRO — два цвета из Discord → «Тема и баннер». Убери theme — карточка станет тёмной
    theme: { primary: '#cecdc8', accent: '#000000' },
    pronouns: 'https://hanosuko.art',
    // 👇 НИК: шрифт (из src/style.css) и эффект toon — белые буквы с контуром и тенью
    nameStyle: { font: 'Almendra', effect: 'toon' },
    // 👇 ЗНАЧКИ в порядке Discord. Иконки лежат в public/badges/icons/ — скачаны с
    // cdn.discordapp.com/badge-icons/<хеш>.png, хеши ищи на github.com/mezotv/discord-badges. Без этого списка — только HypeSquad и Nitro из API.
    // Подсказка при наведении как в Discord: без tooltip — тёмная с текстом label,
    // kind: 'detail' — с иконкой слева, kind: 'card' — карточка с большой картинкой (лежат в public/badges/)
    badges: [
      {
        label: 'Gold Nitro, subscriber since Jan 23, 2026',
        iconUrl: '/badges/icons/nitro-gold.png',
        tooltip: { kind: 'card', theme: 'nitro', imageUrl: '/badges/nitro-gold.svg', title: 'Gold', text: 'Subscriber since 1/23/26' },
      },
      { label: 'HypeSquad Brilliance', iconUrl: '/badges/icons/hypesquad-brilliance.png' },
      { label: 'Originally known as metemx7echosis#9897', iconUrl: '/badges/icons/legacy-username.png' },
      { label: 'Completed a Quest', iconUrl: '/badges/icons/quest.png' },
      {
        label: 'Last Meadow Online: Level 44 Reached',
        iconUrl: '/badges/icons/last-meadow.png',
        tooltip: { kind: 'detail', title: 'Last Meadow Online', text: 'Level 44 Reached' },
      },
      {
        label: 'Orbs: Apprentice',
        iconUrl: '/badges/icons/orbs-apprentice.png',
        tooltip: { kind: 'card', theme: 'light', imageUrl: '/badges/orbs-apprentice.webp', eyebrow: 'Orbs', title: 'Apprentice' },
      },
      {
        label: 'Gifting: Patron',
        iconUrl: '/badges/icons/gifting-patron.png',
        tooltip: { kind: 'card', theme: 'dark', imageUrl: '/badges/gifting-patron.png', eyebrow: 'Gifting', title: 'Patron' },
      },
    ],
    // 👇 ИНТЕГРАЦИИ (Connections) в порядке Discord. Публичного API у Discord для них нет, поэтому вручную.
    // url не указан — ник без стрелки. Цифры TikTok сверены с tiktok.com/@hanosuko 14.10.2026
    connections: [
      {
        type: 'tiktok',
        name: 'hanosuko',
        url: 'https://www.tiktok.com/@hanosuko',
        metadata: { follower_count: 6763, following_count: 97, likes_count: 463917 },
      },
      { type: 'youtube', name: 'Hanosuko', url: 'https://www.youtube.com/channel/UCOOGHlOMbu1w6lRph7bP_Jg' },
    ],
    // 👇 КАРТОЧКА СЕРВЕРА по клику на тег MyTL, как в Discord. У Discord нет открытого API для чужих
    // серверов, поэтому название, иконка, баннер и цифры — вручную; дата основания считается из ID сервера.
    // Кнопка «Go to Server» никуда не ведёт — только анимация «Maybe next time»
    guild: {
      name: 'MyTiers - Высший Стафф',
      iconUrl: '/brands/mytl-guild.webp',
      banner: ['#d94d47', '#f0a092'],
      online: 3,
      members: 43,
    },
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
  // handle — ник (если не указан, берётся из ссылки). Сервисы, которые уже есть в discord.connections, пропускаются.
  social: [
    { kind: 'telegram', url: 'https://t.me/hanosuko', label: 'Telegram' },
    { kind: 'github', url: 'https://github.com/hanosuko', label: 'GitHub' },
    { kind: 'namemc', url: 'https://namemc.com/profile/Hanosuko', label: 'NameMC' },
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
  // Меняй username на свой ник на mytiers.ru. Список китов берётся с сайта, а иконки лежат в проекте:
  // src/assets/tiers/mytiers/<slug кита>.svg (новый кит без файла получит иконку с сайта)
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
  // Иконки китов — src/assets/tiers/cistiers/<slug кита>.webp, логотипы вкладок — src/assets/tiers/
  cistiers: {
    username: 'Hanosuko',
    apiUrl: '/api/cistiers',
    siteUrl: 'https://cistiers.com',
  },

  // 👇 СТАТУС MINECRAFT-СЕРВЕРА: плитка с логотипом, «IP: address» и полоской онлайна.
  // Онлайн пингует наш сервер (/api/server, раз в 30 секунд), запасной вариант — api.mcsrvstat.us.
  // Адрес для /api/server задаётся в server/minecraft.js или переменной MC_SERVER_ADDRESS. Выключить — features.serverStatus.
  // Логотип — фавикон www.cisprac.xyz, лежит в public/brands/
  server: {
    name: 'CISPractice',
    address: 'cisprac.xyz',
    logoUrl: '/brands/cispractice.webp',
    // 👇 Полоска заполнена целиком при стольких игроках (слотов 991, но столько не бывает)
    barMax: 300,
  },

  // 👇 ПАРТНЁРЫ — короткие плашки в ряд под карточкой тиров. Иконки — те же логотипы, что лежат в проекте
  partners: [
    {
      name: 'cisprac.xyz',
      url: 'https://cisprac.xyz',
      iconUrl: '/brands/cispractice.webp',
    },
    {
      name: 'mytiers.ru',
      url: 'https://mytiers.ru',
      iconUrl: mytiersLogo,
    },
  ],

  // 👇 БЛОК «MY SETUP»: плитка с фото сетапа и списком комплектующих.
  // Место и ширина плитки в бенто-сетке — в src/App.vue.
  // Фото класть в src/assets/photos/setup.webp (как пережать — в README, раздел «Photos»).
  // Добавляй/убирай пункты в specs свободно — верстка подхватит.
  setup: {
    photoUrl: photoUrl('setup.webp'),
    title: 'My Setup',
    description: 'My current PC build and peripherals.',
    specs: [
      { label: 'CPU',         value: 'Intel i3-10100F' },
      { label: 'GPU',         value: 'NVIDIA GTX 1660 SUPER 6 GB' },
      { label: 'RAM',         value: '16 GB DDR4 3200 MHz' },
      { label: 'Storage',     value: '960 GB SSD Kingston A400' },
      { label: 'Laptop',      value: 'MacBook Pro 16 M2 Pro 1 TB' },
      { label: 'Monitor',     value: '23.8" ARDOR AF24H1 180 Hz' },
      { label: 'Keyboard',    value: 'Red Square Keyrox TKL' },
      { label: 'Mouse',       value: 'VXE R1 SE+' },
      { label: 'Mousepad',    value: 'Ardor Parton Purple XL' },
      { label: 'Headset',     value: 'Fifine H16' },
      { label: 'Microphone',  value: 'Fifine K669B' },
      { label: 'Webcam',      value: 'KEYRON KQ4M3FA1 2560×1440' },
    ],
  },

  // 👇 ГАЛЕРЕЯ: плитка-бенто до 6 фото: 1-е — широкое сверху, 2-е и 3-е — квадраты слева,
  // 4-е — высокое справа (под вертикальное фото), 5-е и 6-е — нижний ряд. Раскладка сама
  // подстраивается под число фото. Фото лежат в src/assets/photos/ в WebP (как пережать — в README,
  // раздел «Photos»): так они в разы легче и кешируются на год. Фото без файла просто не показывается.
  gallery: {
    title: 'me :]',
    photos: [
      photoUrl('photo1.webp'),
      photoUrl('photo2.webp'),
      photoUrl('photo3.webp'),
      photoUrl('photo4.webp'),
      photoUrl('photo5.webp'),
      photoUrl('photo6.webp'),
    ],
  },
}

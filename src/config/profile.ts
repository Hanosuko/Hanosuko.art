import type { Profile } from '@/types/profile'

const photoAssets = import.meta.glob('/src/assets/photos/*.{avif,gif,jpeg,jpg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const photoUrl = (filename: string): string =>
  photoAssets[`/src/assets/photos/${filename}`] ?? `/photos/${filename}`

export const profile: Profile = {
  // 👇 ОСНОВНАЯ ЛИЧНАЯ ИНФА — ник, аватар, статус
  identity: {
    nickname: 'Hanosuko',
    // 👇 АВАТАР: вставь сюда URL картинки (Discord CDN или любой другой)
    avatarUrl:
      'https://cdn.discordapp.com/avatars/835533218869936168/906b3b525961914f00002aa737631332.webp',
    // 👇 BIO/СТАТУС: коротко о себе.
    bio: 'CISTiers Network Administrator\nCISPractice Owner',
  },

  // 👇 ЦВЕТА ТЕМЫ — все цвета сайта берутся отсюда (CSS-переменные)
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

  // 👇 ССЫЛКИ НА СОЦСЕТИ — добавляй/удаляй элементы свободно. kind определяет иконку.
  social: [
    { kind: 'telegram', url: 'https://t.me/hanosuko', label: 'Telegram' },
    { kind: 'discord', url: 'https://discord.com/users/835533218869936168', label: 'Discord' },
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

  // 👇 ФИЧИ-ПЕРЕКЛЮЧАТЕЛИ: true — блок виден, false — скрыт
  features: {
    audioPlayer: true,
    viewCounter: true,
    tiers: true,
    setup: true,
    gallery: true,
  },

  // 👇 АУДИО-ПЛЕЕР: треки берутся автоматически из public/music/.
  // Просто положи туда mp3 — они появятся в плеере. Здесь только настройки поведения.
  audio: {
    volume: 0.4,
    shuffle: false,
    autoplay: true,
  },

  // 👇 БЛОК CISTIERS: тиры тянутся через /api/tiers (edge-прокси с кешем 5 мин).
  // Меняй username на свой ник на cistiers.com.
  // tierDiscordUrl — куда ведёт кнопка в модалке кита.
  // tierRenders — картинки рендеров, пока заглушки из /tier-icons/.
  // Просто положи свои PNG в public/tier-icons/ с теми же именами — подменятся.
  cistiers: {
    apiUrl: '/api/tiers',
    username: 'Hanosuko',
    tierDiscordUrl: 'https://discord.gg/cistiers',
    // 👇 ДИСКОРД-ССЫЛКИ НА КАЖДЫЙ ТИР — кнопка в модалке ведёт сюда.
    // Если для кита нет своей ссылки — используется tierDiscordUrl выше.
    tierDiscordUrls: {
      vanilla:   'https://discord.gg/rf2SwgNmxf',
      sword:     'https://discord.gg/bTN5mrgDAY',
      netherite: 'https://discord.gg/brW5taABUV',
      dpot:      'https://discord.gg/vnbk7PrR3x',
      uhc:       'https://discord.gg/rYYXjmHcXP',
      smp:       'https://discord.gg/sXjXEmeVUr',
      op:        'https://discord.gg/v9J7aPHhvb',
      mace:      'https://discord.gg/nK3WgBkJ9K',
    },
    tierTableBaseUrl: 'https://cistiers.com/table/',
    tierRenders: {
      vanilla: '/tier-icons/vanilla.png',
      sword: '/tier-icons/sword.png',
      netherite: '/tier-icons/netherite.png',
      dpot: '/tier-icons/dpot.png',
      uhc: '/tier-icons/uhc.png',
      smp: '/tier-icons/smp.png',
      op: '/tier-icons/op.png',
      mace: '/tier-icons/mace.png',
    },
    // 👇 ЦВЕТА ТИРОВ — здесь меняй цвет и тень каждого тира.
    // text — цвет букв, shadow — цвет тени (как в Minecraft chat).
    tierColors: {
      ht1:     { text: '#E8BA3A', shadow: '#392d0e' },
      lt1:     { text: '#D5B355', shadow: '#342b15' },
      ht2:     { text: '#C4D3E7', shadow: '#303338' },
      lt2:     { text: '#A0A7B2', shadow: '#27282b' },
      ht3:     { text: '#F89F5A', shadow: '#3d2716' },
      lt3:     { text: '#C67B42', shadow: '#301e10' },
      ht4:     { text: '#81749A', shadow: '#201d26' },
      lt4:     { text: '#655B79', shadow: '#19161e' },
      ht5:     { text: '#8F82A8', shadow: '#232029' },
      lt5:     { text: '#655B79', shadow: '#19161e' },
      retired: { text: '#A2D6FF', shadow: '#27343e' },
    },
  },

  // 👇 БЛОК «MY SETUP» СПРАВА: фото сетапа + список комплектующих.
  // Фото можно положить в src/assets/photos/setup.jpg или public/photos/setup.jpg.
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

  // 👇 ЛЕВАЯ ФОТО-ПАНЕЛЬ: коллаж из 4 фото слева.
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

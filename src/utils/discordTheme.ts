// Тема профиля Discord Nitro: два цвета (основной сверху, акцент снизу) дают градиент,
// поверх которого лежит полупрозрачная вуаль. Светлый основной цвет — светлая тема с тёмным текстом
// и наоборот, как в самом Discord.

export interface ProfileThemeColors {
  primary: string
  accent: string
}

export interface ProfileThemeTokens {
  mode: 'light' | 'dark'
  background: string
  ring: string
  text: string
  muted: string
  surface: string
  border: string
  bubble: string
}

type Rgb = [number, number, number]

const VEIL_ALPHA = 0.6

const toRgb = (hex: string): Rgb => {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? [...value].map((char) => char + char).join('') : value
  return [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16)) as Rgb
}

const toHex = (rgb: Rgb): string => `#${rgb.map((part) => Math.round(part).toString(16).padStart(2, '0')).join('')}`

const mix = (from: Rgb, to: Rgb, amount: number): Rgb =>
  from.map((part, index) => part + (to[index] - part) * amount) as Rgb

export const profileThemeTokens = (theme: ProfileThemeColors): ProfileThemeTokens => {
  const primary = toRgb(theme.primary)
  const [red, green, blue] = primary
  const isLight = (0.299 * red + 0.587 * green + 0.114 * blue) / 255 > 0.5
  const veil: Rgb = isLight ? [255, 255, 255] : [0, 0, 0]
  const veilCss = `rgba(${veil.join(', ')}, ${VEIL_ALPHA})`

  return {
    mode: isLight ? 'light' : 'dark',
    background: `linear-gradient(${veilCss}, ${veilCss}), linear-gradient(${theme.primary}, ${theme.accent})`,
    // Кольца вокруг аватара и статуса — цвет верха карточки, чтобы выглядели как вырез
    ring: toHex(mix(primary, veil, VEIL_ALPHA)),
    text: isLight ? '#060607' : '#f2f3f5',
    muted: isLight ? '#45464b' : '#b5bac1',
    surface: isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.22)',
    border: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    bubble: isLight ? '#fffdef' : '#232428',
  }
}

// Разбор MOTD Minecraft-сервера с §-кодами в цветные отрезки — без v-html и чужого HTML

export interface MotdSegment {
  text: string
  color: string | null
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
}

type MotdStyle = Omit<MotdSegment, 'text'>

const RESET: MotdStyle = { color: null, bold: false, italic: false, underline: false, strike: false }

const COLORS: Record<string, string> = {
  '0': '#000000',
  '1': '#0000aa',
  '2': '#00aa00',
  '3': '#00aaaa',
  '4': '#aa0000',
  '5': '#aa00aa',
  '6': '#ffaa00',
  '7': '#aaaaaa',
  '8': '#555555',
  '9': '#5555ff',
  a: '#55ff55',
  b: '#55ffff',
  c: '#ff5555',
  d: '#ff55ff',
  e: '#ffff55',
  f: '#ffffff',
}

const HEX_RE = /^[0-9a-f]{6}$/i

export const parseMotdLine = (raw: string): MotdSegment[] => {
  const line = raw.trim()
  const segments: MotdSegment[] = []
  let style: MotdStyle = { ...RESET }
  let text = ''

  const flush = (): void => {
    if (text) segments.push({ text, ...style })
    text = ''
  }

  for (let i = 0; i < line.length; i++) {
    if (line[i] !== '§' || i + 1 >= line.length) {
      text += line[i]
      continue
    }
    const code = line[i + 1].toLowerCase()

    // §#RRGGBB — hex-цвет
    if (code === '#' && HEX_RE.test(line.slice(i + 2, i + 8))) {
      flush()
      style = { ...RESET, color: `#${line.slice(i + 2, i + 8)}` }
      i += 7
      continue
    }

    // §x§R§R§G§G§B§B — hex-цвет в формате BungeeCord
    const bungeeHex = code === 'x' ? line.slice(i + 2, i + 14).replaceAll('§', '') : ''
    if (HEX_RE.test(bungeeHex)) {
      flush()
      style = { ...RESET, color: `#${bungeeHex}` }
      i += 13
      continue
    }

    flush()
    // Как в игре: цветовой код сбрасывает форматирование; §k (обфускация) рисуем обычным текстом
    if (COLORS[code]) style = { ...RESET, color: COLORS[code] }
    else if (code === 'l') style = { ...style, bold: true }
    else if (code === 'o') style = { ...style, italic: true }
    else if (code === 'n') style = { ...style, underline: true }
    else if (code === 'm') style = { ...style, strike: true }
    else if (code === 'r') style = { ...RESET }
    i += 1
  }

  flush()

  // Пробелы по краям строки (ими центрируют MOTD в игре) сбивают выравнивание на сайте
  while (segments.length && !segments[0].text.trim()) segments.shift()
  while (segments.length && !segments[segments.length - 1].text.trim()) segments.pop()
  if (segments.length) {
    segments[0].text = segments[0].text.trimStart()
    segments[segments.length - 1].text = segments[segments.length - 1].text.trimEnd()
  }
  return segments
}

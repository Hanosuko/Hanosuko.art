import { onBeforeUnmount, onMounted } from 'vue'

const FORWARD_INTERVAL_MS = 220
const REVERSE_INTERVAL_MS = 160
const HOLD_FULL_MS = 1400
const HOLD_EMPTY_MS = 600

export const useAnimatedTitle = (text: string): void => {
  let timeoutId: number | undefined

  const schedule = (fn: () => void, delay: number): void => {
    timeoutId = window.setTimeout(fn, delay)
  }

  const grow = (length: number): void => {
    document.title = length === 0 ? '\u00A0' : text.slice(0, length)
    if (length >= text.length) {
      schedule(() => shrink(text.length - 1), HOLD_FULL_MS)
      return
    }
    schedule(() => grow(length + 1), FORWARD_INTERVAL_MS)
  }

  const shrink = (length: number): void => {
    document.title = length <= 0 ? '\u00A0' : text.slice(0, length)
    if (length <= 0) {
      schedule(() => grow(1), HOLD_EMPTY_MS)
      return
    }
    schedule(() => shrink(length - 1), REVERSE_INTERVAL_MS)
  }

  onMounted(() => {
    grow(0)
  })

  onBeforeUnmount(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId)
  })
}

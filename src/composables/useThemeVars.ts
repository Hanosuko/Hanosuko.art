import { onMounted } from 'vue'
import type { ThemeColors } from '@/types/profile'

export function useThemeVars(theme: ThemeColors) {
  const apply = (): void => {
    const root = document.documentElement
    root.style.setProperty('--color-background', theme.background)
    root.style.setProperty('--color-surface', theme.surface)
    root.style.setProperty('--color-text', theme.text)
    root.style.setProperty('--color-text-muted', theme.textMuted)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-glow', theme.glow)
  }

  onMounted(apply)
}

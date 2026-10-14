import { computed, ref, watch } from 'vue'

export interface ProgressiveSource {
  static: string
  animated: string | null
}

// Сначала лёгкая статичная картинка, анимированная подменяет её, когда догрузится.
// При prefers-reduced-motion анимация не грузится вовсе.
export function useProgressiveImage(source: () => ProgressiveSource | null) {
  const animatedReady = ref<string | null>(null)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  watch(
    source,
    (value) => {
      animatedReady.value = null
      const target = value?.animated
      if (!target || reduceMotion) return
      const image = new Image()
      image.onload = () => {
        if (source()?.animated === target) animatedReady.value = target
      }
      image.src = target
    },
    { immediate: true },
  )

  return computed(() => animatedReady.value ?? source()?.static ?? null)
}

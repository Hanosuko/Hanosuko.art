import { ref } from 'vue'

export function useViewCounter(endpoint: string) {
  const total = ref<number | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const register = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
      if (!response.ok) throw new Error(`views responded ${response.status}`)
      const payload = (await response.json()) as { total?: number }
      if (typeof payload.total === 'number') total.value = payload.total
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return { total, error, isLoading, register }
}

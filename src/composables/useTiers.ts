import { ref, shallowRef } from 'vue'
import type { CistiersResponse } from '@/types/cistiers'

export function useTiers(apiUrl: string, username: string) {
  const data = shallowRef<CistiersResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchTiers = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const url = apiUrl.includes('?')
        ? `${apiUrl}&username=${encodeURIComponent(username)}`
        : `${apiUrl}?username=${encodeURIComponent(username)}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`tiers proxy responded ${response.status}`)
      }
      const payload = (await response.json()) as CistiersResponse
      data.value = payload
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'unknown error'
      error.value = message
      console.warn('[tiers] fetch failed:', message)
    } finally {
      isLoading.value = false
    }
  }

  return { data, isLoading, error, fetchTiers }
}

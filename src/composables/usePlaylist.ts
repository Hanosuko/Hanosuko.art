import { ref, shallowRef } from 'vue'

export interface PlaylistTrack {
  src: string
  title: string
}

export function usePlaylist(manifestUrl: string) {
  const tracks = shallowRef<PlaylistTrack[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const load = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(manifestUrl, { cache: 'no-store' })
      if (!response.ok) throw new Error(`manifest responded ${response.status}`)
      const payload = (await response.json()) as PlaylistTrack[]
      tracks.value = Array.isArray(payload) ? payload : []
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'unknown error'
      tracks.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { tracks, isLoading, error, load }
}

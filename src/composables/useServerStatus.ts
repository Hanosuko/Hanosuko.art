import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

// Ответ https://api.mcsrvstat.us/3/<адрес> (только нужные поля)
export interface ServerStatusResponse {
  online: boolean
  icon?: string
  players?: { online: number; max: number }
}

// mcsrvstat.us кеширует ответ на 5 минут — чаще опрашивать нет смысла
const REFRESH_MS = 150_000

export function useServerStatus(address: string) {
  const status = shallowRef<ServerStatusResponse | null>(null)
  const error = ref<string | null>(null)
  let lastLoaded = 0
  let timer: number | undefined

  const load = async (): Promise<void> => {
    try {
      const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`)
      if (!response.ok) throw new Error(`mcsrvstat responded ${response.status}`)
      status.value = (await response.json()) as ServerStatusResponse
      error.value = null
      lastLoaded = Date.now()
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : 'unknown error'
    }
  }

  // Вернулись на вкладку после перерыва — обновить сразу, не дожидаясь таймера
  const onVisibility = (): void => {
    if (document.visibilityState === 'visible' && Date.now() - lastLoaded > REFRESH_MS) void load()
  }

  onMounted(() => {
    void load()
    timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, REFRESH_MS)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibility)
  })

  return { status, error, reload: load }
}

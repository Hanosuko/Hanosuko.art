import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

// Ответ /api/server и https://api.mcsrvstat.us/3/<адрес> (только нужные поля, формат одинаковый)
export interface ServerStatusResponse {
  online: boolean
  icon?: string
  players?: { online: number; max: number }
}

// Наш /api/server пингует сервер сам и держит ответ 30 секунд
const REFRESH_MS = 30_000

const getStatus = async (url: string): Promise<ServerStatusResponse> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(8_000) })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return (await response.json()) as ServerStatusResponse
}

export function useServerStatus(address: string) {
  const status = shallowRef<ServerStatusResponse | null>(null)
  const error = ref<string | null>(null)
  let lastLoaded = 0
  let timer: number | undefined

  const load = async (): Promise<void> => {
    try {
      // Свой API быстрее и работает без VPN; mcsrvstat.us — запасной, если бэкенд не запущен
      status.value = await getStatus('/api/server').catch(() =>
        getStatus(`https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`),
      )
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

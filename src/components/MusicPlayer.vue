<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Music, Pause, Play, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import { usePlaylist } from '@/composables/usePlaylist'

// 👇 Треки берутся из public/music/. Настройки плеера — в src/config/profile.ts → audio
const settings = profile.audio

const { tracks, load, error: manifestError } = usePlaylist('/music/manifest.json')

const audioElement = ref<HTMLAudioElement | null>(null)
const currentIndex = ref(0)
const isPlaying = ref(false)
const isMuted = ref(false)
const isShuffle = ref(settings.shuffle)
const currentTime = ref(0)
const duration = ref(0)
const playOrder = ref<number[]>([])
const orderPosition = ref(0)
const volumeLevel = ref(settings.volume)
const volumeOpen = ref(false)
let pendingAutoplay = false
let autoplayUnlock: (() => void) | null = null
let shouldPlayOnSwitch = false

const currentTrack = computed(() => tracks.value[currentIndex.value] ?? null)
const hasTracks = computed(() => tracks.value.length > 0)

const buildOrder = (): void => {
  const indexes = tracks.value.map((_, index) => index)
  if (isShuffle.value && indexes.length > 1) {
    for (let i = indexes.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
    }
    const currentPos = indexes.indexOf(currentIndex.value)
    if (currentPos > 0) {
      ;[indexes[0], indexes[currentPos]] = [indexes[currentPos], indexes[0]]
    }
    orderPosition.value = 0
  } else {
    orderPosition.value = Math.max(0, indexes.indexOf(currentIndex.value))
  }
  playOrder.value = indexes
}

const advance = (delta: number): void => {
  if (!playOrder.value.length) return
  const length = playOrder.value.length
  const nextPosition = orderPosition.value + delta
  if (isShuffle.value && length > 1 && (nextPosition < 0 || nextPosition >= length)) {
    const previousIndex = currentIndex.value
    const fresh = tracks.value.map((_, index) => index)
    for (let i = fresh.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[fresh[i], fresh[j]] = [fresh[j], fresh[i]]
    }
    if (fresh[0] === previousIndex) {
      ;[fresh[0], fresh[1]] = [fresh[1], fresh[0]]
    }
    playOrder.value = fresh
    orderPosition.value = 0
    currentIndex.value = fresh[0] ?? 0
    return
  }
  orderPosition.value = (nextPosition + length) % length
  currentIndex.value = playOrder.value[orderPosition.value] ?? 0
}

const playCurrent = async (): Promise<void> => {
  const element = audioElement.value
  if (!element) return
  try {
    await element.play()
    isPlaying.value = true
  } catch {
    isPlaying.value = false
  }
}

const togglePlay = (): void => {
  const element = audioElement.value
  if (!element || !hasTracks.value) return
  if (element.paused) {
    void playCurrent()
    return
  }
  element.pause()
  isPlaying.value = false
}

const next = (): void => {
  shouldPlayOnSwitch = true
  advance(1)
}

const prev = (): void => {
  const element = audioElement.value
  if (element && element.currentTime > 3) {
    element.currentTime = 0
    if (element.paused) void playCurrent()
    return
  }
  shouldPlayOnSwitch = true
  advance(-1)
}

const toggleShuffle = (): void => {
  isShuffle.value = !isShuffle.value
  buildOrder()
}

const toggleMute = (): void => {
  const element = audioElement.value
  if (!element) return
  element.muted = !element.muted
  isMuted.value = element.muted
}

const onTimeUpdate = (): void => {
  const element = audioElement.value
  if (!element) return
  currentTime.value = element.currentTime
}

const onLoadedMetadata = (): void => {
  const element = audioElement.value
  if (!element) return
  duration.value = Number.isFinite(element.duration) ? element.duration : 0
}

const onEnded = (): void => {
  next()
}

const seekFromEvent = (event: MouseEvent): void => {
  const element = audioElement.value
  if (!element || !duration.value) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  element.currentTime = ratio * duration.value
  currentTime.value = element.currentTime
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

watch(currentTrack, (track) => {
  const element = audioElement.value
  if (!element || !track) return
  const wasPlaying = shouldPlayOnSwitch || isPlaying.value || !element.paused
  shouldPlayOnSwitch = false
  element.src = track.src
  element.load()
  currentTime.value = 0
  if (wasPlaying) void playCurrent()
})

watch(volumeLevel, (value) => {
  const element = audioElement.value
  if (!element) return
  element.volume = value
  if (value > 0 && element.muted) {
    element.muted = false
    isMuted.value = false
  }
})

onMounted(async () => {
  await load()
  if (!tracks.value.length) return
  if (tracks.value.length > 1) {
    currentIndex.value = Math.floor(Math.random() * tracks.value.length)
  }
  buildOrder()
  const element = audioElement.value
  if (!element) return
  element.volume = volumeLevel.value
  element.src = currentTrack.value?.src ?? ''
  if (!settings.autoplay) return

  try {
    await element.play()
    isPlaying.value = true
    return
  } catch {
    pendingAutoplay = true
  }

  const unlock = (): void => {
    if (!pendingAutoplay) return
    pendingAutoplay = false
    void playCurrent()
  }
  autoplayUnlock = unlock
  window.addEventListener('pointerdown', unlock, { once: true, passive: true })
  window.addEventListener('keydown', unlock, { once: true })
  window.addEventListener('touchstart', unlock, { once: true, passive: true })
})

onBeforeUnmount(() => {
  audioElement.value?.pause()
  if (autoplayUnlock) {
    window.removeEventListener('pointerdown', autoplayUnlock)
    window.removeEventListener('keydown', autoplayUnlock)
    window.removeEventListener('touchstart', autoplayUnlock)
  }
})
</script>

<template>
  <section v-if="hasTracks" class="player glass-card">
    <audio
      ref="audioElement"
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />

    <header class="player-head">
      <Music :size="16" class="player-music" :class="{ spinning: isPlaying }" aria-hidden="true" />
      <span class="player-title">{{ currentTrack?.title ?? 'No track' }}</span>
      <span class="equalizer" :class="{ active: isPlaying }" aria-hidden="true">
        <span class="eq-bar" />
        <span class="eq-bar" />
        <span class="eq-bar" />
        <span class="eq-bar" />
      </span>
    </header>

    <div class="player-progress" @click="seekFromEvent">
      <div class="player-progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <div class="player-time">
      <span>{{ formatTime(currentTime) }}</span>
      <span>{{ formatTime(duration) }}</span>
    </div>
    <div class="player-controls">
      <button
        type="button"
        class="player-button"
        :class="{ active: isShuffle }"
        aria-label="Toggle shuffle"
        @click="toggleShuffle"
      >
        <Shuffle :size="16" aria-hidden="true" />
      </button>
      <button type="button" class="player-button" aria-label="Previous track" @click="prev">
        <SkipBack :size="16" aria-hidden="true" />
      </button>
      <button type="button" class="player-button primary" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePlay">
        <Pause v-if="isPlaying" :size="18" aria-hidden="true" />
        <Play v-else :size="18" aria-hidden="true" />
      </button>
      <button type="button" class="player-button" aria-label="Next track" @click="next">
        <SkipForward :size="16" aria-hidden="true" />
      </button>
      <div
        class="volume-wrapper"
        @pointerenter="volumeOpen = true"
        @pointerleave="volumeOpen = false"
      >
        <button
          type="button"
          class="player-button volume-button"
          :class="{ active: volumeOpen || isMuted }"
          :aria-label="isMuted ? 'Unmute' : 'Mute'"
          @click="toggleMute"
        >
          <VolumeX v-if="isMuted || volumeLevel === 0" :size="16" aria-hidden="true" />
          <Volume2 v-else :size="16" aria-hidden="true" />
        </button>
        <Transition name="volume-pop">
          <div v-if="volumeOpen" class="volume-popover" @click.stop>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.01"
              :value="volumeLevel"
              :style="{ '--fill': `${volumeLevel * 100}%` }"
              aria-label="Volume"
              @input="(event) => (volumeLevel = Number((event.target as HTMLInputElement).value))"
            />
          </div>
        </Transition>
      </div>
    </div>
  </section>

  <section v-else-if="manifestError" class="player glass-card error">
    <Music :size="14" aria-hidden="true" />
    <span>music unavailable</span>
  </section>
</template>

<style scoped>
.player {
  width: 100%;
  max-width: 28rem;
  padding: 1rem 1.25rem 1.25rem;
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.player.error {
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #fda4af;
}

.player-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.player-music {
  color: var(--color-accent);
  flex-shrink: 0;
  transition: transform 0.4s ease;
}

.player-music.spinning {
  animation: music-spin 4s linear infinite;
}

@keyframes music-spin {
  to {
    transform: rotate(360deg);
  }
}

.equalizer {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
  flex-shrink: 0;
}

.eq-bar {
  width: 3px;
  background: var(--color-accent);
  border-radius: 2px;
  height: 30%;
  opacity: 0.45;
  transition: opacity 0.3s ease;
}

.equalizer.active .eq-bar {
  opacity: 1;
  animation: eq-bounce 1s ease-in-out infinite;
}

.equalizer.active .eq-bar:nth-child(1) {
  animation-delay: -0.4s;
}
.equalizer.active .eq-bar:nth-child(2) {
  animation-delay: -0.1s;
}
.equalizer.active .eq-bar:nth-child(3) {
  animation-delay: -0.7s;
}
.equalizer.active .eq-bar:nth-child(4) {
  animation-delay: -0.3s;
}

@keyframes eq-bounce {
  0%,
  100% {
    height: 25%;
  }
  50% {
    height: 100%;
  }
}

.player-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  cursor: pointer;
  overflow: hidden;
}

.player-progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 9999px;
  transition: width 0.1s linear;
  pointer-events: none;
}

.player-time {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
}

.player-button {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.player-button:hover,
.player-button:focus-visible {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: 0 0 14px var(--color-glow);
  outline: none;
}

.player-button.primary {
  width: 2.4rem;
  height: 2.4rem;
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text);
  border-color: rgba(255, 255, 255, 0.18);
}

.player-button.primary:hover,
.player-button.primary:focus-visible {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.2);
}

.player-button.active {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.volume-wrapper {
  position: relative;
  display: inline-flex;
}

.volume-popover {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.65rem 0.55rem;
  background: rgba(15, 15, 20, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 18px var(--color-glow);
  z-index: 4;
}

.volume-popover::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(15, 15, 20, 0.92);
}

.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 6.5rem;
  height: 4px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    var(--color-accent) 0,
    var(--color-accent) var(--fill, 50%),
    rgba(255, 255, 255, 0.12) var(--fill, 50%),
    rgba(255, 255, 255, 0.12) 100%
  );
  cursor: pointer;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-text);
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 8px var(--color-glow);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-text);
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 8px var(--color-glow);
  cursor: pointer;
}

.volume-pop-enter-active,
.volume-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.volume-pop-enter-from,
.volume-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px) scale(0.95);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { Gamepad2 } from 'lucide-vue-next'
import type { LanyardActivity, LanyardSpotify } from '@/types/discord'
import { activityImageUrl } from '@/composables/useDiscordProfile'
import { useNow } from '@/composables/useNow'

// Одна активность из Lanyard: либо игра/стрим/просмотр, либо Spotify
const props = defineProps<{ activity?: LanyardActivity; spotify?: LanyardSpotify }>()

const now = useNow()

const VERBS: Record<number, string> = {
  0: 'Playing',
  1: 'Streaming',
  2: 'Listening to',
  3: 'Watching',
  5: 'Competing in',
}

const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

const verb = computed(() => (props.spotify ? 'Listening to Spotify' : VERBS[props.activity?.type ?? 0] ?? 'Playing'))

const title = computed(() => props.spotify?.song ?? props.activity?.name ?? '')

const lines = computed(() => {
  if (props.spotify) return [`by ${props.spotify.artist.replaceAll('; ', ', ')}`, `on ${props.spotify.album}`]
  return [props.activity?.details, props.activity?.state].filter((line): line is string => Boolean(line))
})

const largeImage = computed(() => {
  if (props.spotify) return props.spotify.album_art_url
  return props.activity ? activityImageUrl(props.activity, 'large_image') : null
})

const smallImage = computed(() => (props.activity ? activityImageUrl(props.activity, 'small_image') : null))

const link = computed(() => {
  if (props.spotify?.track_id) return `https://open.spotify.com/track/${props.spotify.track_id}`
  return props.activity?.url ?? null
})

const timer = computed(() => {
  const timestamps = props.activity?.timestamps
  if (!timestamps) return null
  if (timestamps.end) return `${formatDuration(timestamps.end - now.value)} left`
  if (timestamps.start) return `${formatDuration(now.value - timestamps.start)} elapsed`
  return null
})

const progress = computed(() => {
  if (!props.spotify) return null
  const { start, end } = props.spotify.timestamps
  const duration = Math.max(end - start, 1)
  const elapsed = Math.min(Math.max(now.value - start, 0), duration)
  return { percent: (elapsed / duration) * 100, elapsed: formatDuration(elapsed), total: formatDuration(duration) }
})
</script>

<template>
  <div class="activity">
    <span class="activity-verb">{{ verb }}</span>
    <component
      :is="link ? 'a' : 'div'"
      class="activity-body"
      :href="link ?? undefined"
      :target="link ? '_blank' : undefined"
      :rel="link ? 'noopener noreferrer' : undefined"
    >
      <span class="activity-art">
        <img v-if="largeImage" class="activity-large" :src="largeImage" alt="" loading="lazy" />
        <Gamepad2 v-else :size="26" aria-hidden="true" />
        <img v-if="smallImage" class="activity-small" :src="smallImage" alt="" loading="lazy" />
      </span>
      <span class="activity-text">
        <strong class="activity-title">{{ title }}</strong>
        <span v-for="line in lines" :key="line" class="activity-line">{{ line }}</span>
        <span v-if="timer" class="activity-timer">{{ timer }}</span>
      </span>
    </component>
    <div v-if="progress" class="activity-progress">
      <span>{{ progress.elapsed }}</span>
      <span class="activity-bar"><span :style="{ width: `${progress.percent}%` }" /></span>
      <span>{{ progress.total }}</span>
    </div>
  </div>
</template>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-verb {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.activity-body {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
  color: var(--color-text);
}

.activity-art {
  position: relative;
  width: 3.75rem;
  height: 3.75rem;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-muted);
}

.activity-large {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.activity-small {
  position: absolute;
  right: -0.3rem;
  bottom: -0.3rem;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  border: 3px solid #1d1d1d;
  background: #1d1d1d;
}

.activity-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  font-size: 0.78rem;
}

.activity-title,
.activity-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-title {
  font-size: 0.85rem;
}

.activity-line {
  color: var(--color-text-muted);
}

.activity-timer {
  color: #43c87a;
  font-variant-numeric: tabular-nums;
}

.activity-progress {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.68rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.activity-bar {
  flex: 1;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.activity-bar > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-text);
  transition: width 1s linear;
}

@media (hover: hover) {
  a.activity-body:hover .activity-title {
    text-decoration: underline;
  }
}
</style>

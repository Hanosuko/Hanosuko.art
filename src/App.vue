<script setup lang="ts">
import { profile } from '@/config/profile'
import { useThemeVars } from '@/composables/useThemeVars'
import { useAnimatedTitle } from '@/composables/useAnimatedTitle'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import DiscordProfile from '@/components/DiscordProfile.vue'
import CustomLinks from '@/components/CustomLinks.vue'
import PartnerLinks from '@/components/PartnerLinks.vue'
import TiersCard from '@/components/TiersCard.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import ViewCounter from '@/components/ViewCounter.vue'
import SetupPanel from '@/components/SetupPanel.vue'
import PhotoPanel from '@/components/PhotoPanel.vue'
import ServerStatus from '@/components/ServerStatus.vue'
import IntroOverlay from '@/components/IntroOverlay.vue'

useThemeVars(profile.theme)
useAnimatedTitle(profile.identity.nickname)
</script>

<template>
  <AnimatedBackground />
  <main class="page">
    <!--
      👇 БЕНТО: две независимые колонки — у каждой плитки своя высота, ряды не выравниваются.
      Низ колонок совпадает за счёт последних плиток (фото и сетап) — они дотягиваются.
      На телефоне колонки разбираются в одну ленту, порядок — классами order-*.
      Новый блок — добавь компонент в нужную колонку, например:
      <MyBlock class="order-9" />
    -->
    <div class="bento">
      <div class="bento-col">
        <DiscordProfile class="order-1" />
        <MusicPlayer v-if="profile.features.audioPlayer" class="order-4" />
        <PhotoPanel v-if="profile.features.gallery" class="order-6" />
      </div>

      <div class="bento-col">
        <TiersCard v-if="profile.features.tiers" class="order-2" />
        <PartnerLinks class="order-3" />
        <ServerStatus v-if="profile.features.serverStatus" class="order-5" />
        <SetupPanel v-if="profile.features.setup" class="order-7" />
      </div>

      <CustomLinks class="bento-wide order-8" />
    </div>

    <ViewCounter v-if="profile.features.viewCounter" class="view-counter" />
  </main>
  <IntroOverlay />
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  /* env(safe-area-inset-*) — отступы под вырез и скругления экрана телефона */
  padding:
    max(3rem, env(safe-area-inset-top))
    max(1.25rem, env(safe-area-inset-right))
    max(2rem, env(safe-area-inset-bottom))
    max(1.25rem, env(safe-area-inset-left));
}

.bento {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 72rem;
}

.bento-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

/* Колонка короче соседней — её последняя плитка вытягивается, низ сетки ровный */
.bento-col > :deep(:last-child) {
  flex-grow: 1;
}

.bento-wide {
  grid-column: 1 / -1;
}

/* Каждая плитка — контейнер: блоки подстраиваются под ширину своей ячейки, а не экрана */
.bento-col > :deep(*),
.bento > :deep(.bento-wide) {
  min-width: 0;
  container-type: inline-size;
}

/* Телефон: одна лента — профиль, тиры, плашки, плеер, сервер, фото, сетап */
@media (max-width: 767px) {
  .bento {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .bento-col {
    display: contents;
  }

  .bento-col > :deep(:last-child) {
    flex-grow: 0;
  }
}

.view-counter {
  margin-top: auto;
}

@media (max-width: 767px) {
  .page {
    gap: 1.5rem;
    padding-top: max(0.75rem, env(safe-area-inset-top));
    padding-inline: max(0.75rem, env(safe-area-inset-left)) max(0.75rem, env(safe-area-inset-right));
  }
}
</style>

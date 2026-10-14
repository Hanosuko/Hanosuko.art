<script setup lang="ts">
import { profile } from '@/config/profile'
import { useThemeVars } from '@/composables/useThemeVars'
import { useAnimatedTitle } from '@/composables/useAnimatedTitle'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import CustomLinks from '@/components/CustomLinks.vue'
import PartnerLinks from '@/components/PartnerLinks.vue'
import MyTiersCard from '@/components/MyTiersCard.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import ViewCounter from '@/components/ViewCounter.vue'
import SetupPanel from '@/components/SetupPanel.vue'
import PhotoPanel from '@/components/PhotoPanel.vue'
import IntroOverlay from '@/components/IntroOverlay.vue'

useThemeVars(profile.theme)
useAnimatedTitle(profile.identity.nickname)
</script>

<template>
  <AnimatedBackground />
  <main class="page">
    <!--
      👇 БЕНТО-СЕТКА: 12 колонок на десктопе (lg), 2 равные колонки на планшете (md),
      одна колонка на телефоне. Ширина плитки задаётся классами col-span-*.
      Новый блок — просто добавь компонент в конец сетки, например:
      <MyBlock class="col-span-12 md:col-span-6 lg:col-span-4" />
    -->
    <div class="bento grid grid-cols-12 gap-3 md:gap-4">
      <div class="bento-stack col-span-12 md:col-span-6 lg:col-span-5">
        <ProfileCard class="flex-1" />
        <MusicPlayer v-if="profile.features.audioPlayer" />
        <PartnerLinks />
      </div>

      <MyTiersCard v-if="profile.features.tiers" class="col-span-12 md:col-span-6 lg:col-span-7" />

      <PhotoPanel v-if="profile.features.gallery" class="col-span-12 md:col-span-6 lg:col-span-5" />
      <SetupPanel v-if="profile.features.setup" class="col-span-12 md:col-span-6 lg:col-span-7" />

      <CustomLinks class="col-span-12" />
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
  padding: 3rem 1.25rem 2rem;
}

.bento {
  width: 100%;
  max-width: 72rem;
}

.bento-stack {
  display: flex;
  flex-direction: column;
  gap: inherit;
  min-width: 0;
}

/* Каждая плитка — контейнер: блоки подстраиваются под ширину своей ячейки, а не экрана */
.bento > :deep(*),
.bento-stack > :deep(*) {
  min-width: 0;
  container-type: inline-size;
}

.view-counter {
  margin-top: auto;
}

@media (max-width: 767px) {
  .page {
    padding-top: 1.25rem;
  }
}
</style>

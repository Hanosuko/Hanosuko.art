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
      👇 БЕНТО: два ряда по две группы плиток. Верх: Discord и плеер | тиры, плашки и сервер.
      Низ: фото | сетап. В каждой группе плитки своей высоты, а последняя дотягивается до низа
      соседней группы — поэтому середина (низ плеера и сервера) и низ страницы ровные.
      На телефоне группы разбираются в одну ленту, порядок — классами order-*.
      Новый блок — добавь компонент в нужную группу выше её последней плитки, например:
      <MyBlock class="order-9" />
    -->
    <div class="bento">
      <div class="bento-group">
        <DiscordProfile class="order-1" />
        <MusicPlayer v-if="profile.features.audioPlayer" class="order-4" />
      </div>

      <div class="bento-group">
        <TiersCard v-if="profile.features.tiers" class="order-2" />
        <PartnerLinks class="order-3" />
        <ServerStatus v-if="profile.features.serverStatus" class="order-5" />
      </div>

      <div class="bento-group">
        <PhotoPanel v-if="profile.features.gallery" class="order-6" />
      </div>

      <div class="bento-group">
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

/* На десктопе колонка Discord-профиля уже: карточка ближе к размеру профиля в самом Discord */
@media (min-width: 1024px) {
  .bento {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  }
}

.bento-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

/* Группа короче соседней в ряду — её последняя плитка вытягивается, края ряда ровные */
.bento-group > :deep(:last-child) {
  flex-grow: 1;
}

.bento-wide {
  grid-column: 1 / -1;
}

/* Каждая плитка — контейнер: блоки подстраиваются под ширину своей ячейки, а не экрана */
.bento-group > :deep(*),
.bento > :deep(.bento-wide) {
  position: relative;
  min-width: 0;
  container-type: inline-size;
}

/* Подсказки и поповеры плитки под курсором не прячутся под соседними плитками */
.bento-group > :deep(*:hover),
.bento-group > :deep(*:focus-within) {
  z-index: 2;
}

/* Телефон: одна лента — профиль, тиры, плашки, плеер, сервер, фото, сетап */
@media (max-width: 767px) {
  .bento {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .bento-group {
    display: contents;
  }

  .bento-group > :deep(:last-child) {
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

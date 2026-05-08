<script setup lang="ts">
import { profile } from '@/config/profile'
import { useThemeVars } from '@/composables/useThemeVars'
import { useAnimatedTitle } from '@/composables/useAnimatedTitle'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import ProfileCard from '@/components/ProfileCard.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import CustomLinks from '@/components/CustomLinks.vue'
import PartnerLinks from '@/components/PartnerLinks.vue'
import CistiersProfile from '@/components/CistiersProfile.vue'
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
  <SetupPanel v-if="profile.features.setup" />
  <PhotoPanel v-if="profile.features.gallery" />
  <main class="page">
    <div class="stack">
      <ProfileCard />
      <SocialLinks />
      <CistiersProfile v-if="profile.features.tiers" />
      <PartnerLinks />
      <MusicPlayer v-if="profile.features.audioPlayer" />
      <CustomLinks />
      <ViewCounter v-if="profile.features.viewCounter" class="view-counter-shift" />
    </div>
  </main>
  <IntroOverlay />
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3.5rem 1.25rem 2rem;
  gap: 1.25rem;
}

.stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.view-counter-shift {
  margin-top: 2em;
}

@media (max-width: 480px) {
  .page {
    padding-top: 2rem;
  }
}
</style>

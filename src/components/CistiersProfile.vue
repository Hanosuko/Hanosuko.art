<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Loader2, AlertCircle, Trophy } from 'lucide-vue-next'
import { profile } from '@/config/profile'
import { useTiers } from '@/composables/useTiers'
import TierModal from '@/components/TierModal.vue'
import type { CistiersCurrentTier } from '@/types/cistiers'

// 👇 Меняй apiUrl, username, tierDiscordUrl, tierRenders в src/config/profile.ts → cistiers
const cistiers = profile.cistiers

const { data, isLoading, error, fetchTiers } = useTiers(cistiers.apiUrl, cistiers.username)

const kitOrder: Record<string, number> = {
  vanilla: 0,
  sword: 1,
  netherite: 2,
  dpot: 3,
  uhc: 4,
  smp: 5,
  op: 6,
  mace: 7,
}

const kitDisplayName: Record<string, string> = {
  vanilla: 'Vanilla',
  sword: 'Sword',
  netherite: 'Netherite',
  dpot: 'Diamond Pot',
  uhc: 'UHC',
  smp: 'SMP',
  op: 'OP',
  mace: 'Mace',
}

const kitIconUrl: Record<string, string> = {
  vanilla: '/tier-icons/vanilla.png',
  sword: '/tier-icons/sword.png',
  netherite: '/tier-icons/netherite.png',
  dpot: '/tier-icons/dpot.png',
  uhc: '/tier-icons/uhc.png',
  smp: '/tier-icons/smp.png',
  op: '/tier-icons/op.png',
  mace: '/tier-icons/mace.png',
}

const sortedTiers = computed<CistiersCurrentTier[]>(() => {
  const list = data.value?.tier_stats.current_tiers ?? []
  return [...list].sort((a, b) => (kitOrder[a.kit] ?? 99) - (kitOrder[b.kit] ?? 99))
})

const totalPoints = computed(() => data.value?.tier_stats.total_points ?? 0)
const rankPosition = computed(() => data.value?.rank_position ?? null)

const tierBadgeStyle = (tier: string): Record<string, string> => {
  const colors = cistiers.tierColors[tier.toLowerCase()]
  if (!colors) return {}
  return {
    color: colors.text,
    textShadow: `2px 2px 0 ${colors.shadow}`,
  }
}

onMounted(() => {
  void fetchTiers()
})

const activeTier = ref<CistiersCurrentTier | null>(null)

const openTier = (tier: CistiersCurrentTier): void => {
  activeTier.value = tier
}

const closeTier = (): void => {
  activeTier.value = null
}

const renderUrlFor = (kit: string): string =>
  cistiers.tierRenders[kit] ?? kitIconUrl[kit] ?? ''
</script>

<template>
  <section class="cistiers glass-card">
    <header class="cistiers-head">
      <div class="cistiers-title">
        <Trophy :size="16" class="trophy" aria-hidden="true" />
        <span>Minecraft tiers</span>
      </div>
      <div v-if="data" class="cistiers-stats">
        <span>{{ totalPoints }} pts</span>
        <span v-if="rankPosition !== null" class="rank">#{{ rankPosition }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="cistiers-state">
      <Loader2 class="spin" :size="18" aria-hidden="true" />
      <span>loading tiers…</span>
    </div>

    <div v-else-if="error" class="cistiers-state error">
      <AlertCircle :size="18" aria-hidden="true" />
      <span>tiers unavailable</span>
      <!-- 👇 Если cistiers API блокируется CORS — здесь нужен прокси или serverless function.
           Пока показываем graceful error и логируем в консоль. -->
    </div>

    <TransitionGroup v-else-if="sortedTiers.length" tag="ul" name="tier-pop" class="tier-grid">
      <li
        v-for="(tier, index) in sortedTiers"
        :key="tier.kit"
        class="tier-cell"
        :style="{ '--enter-delay': `${index * 60}ms` }"
        role="button"
        tabindex="0"
        @click="openTier(tier)"
        @keydown.enter.prevent="openTier(tier)"
        @keydown.space.prevent="openTier(tier)"
      >
        <span class="tier-icon-wrap">
          <img
            class="tier-icon"
            :src="kitIconUrl[tier.kit] ?? ''"
            :alt="kitDisplayName[tier.kit] ?? tier.kit"
            loading="lazy"
          />
        </span>
        <span class="badge" :style="tierBadgeStyle(tier.tier)">{{ tier.tier.toUpperCase() }}</span>
      </li>
    </TransitionGroup>

    <div v-else class="cistiers-state">
      <span>no tiers yet</span>
    </div>
  </section>

  <Teleport to="body">
    <Transition name="modal-fade">
      <TierModal
        v-if="activeTier"
        :kit-name="kitDisplayName[activeTier.kit] ?? activeTier.kit"
        :kit-slug="activeTier.kit"
        :render-url="renderUrlFor(activeTier.kit)"
        :discord-url="cistiers.tierDiscordUrls[activeTier.kit] ?? cistiers.tierDiscordUrl"
        :table-base-url="cistiers.tierTableBaseUrl"
        @close="closeTier"
      />
    </Transition>
  </Teleport>
</template>

<style scoped>
.cistiers {
  width: 100%;
  max-width: 28rem;
  padding: 1rem 1.25rem 1.25rem;
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cistiers-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cistiers-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.trophy {
  color: var(--color-accent);
}

.cistiers-stats {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.rank {
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.cistiers-state {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.cistiers-state.error {
  color: #fda4af;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tier-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: 0.5rem;
}

.tier-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.55rem;
  border-radius: 0.65rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.78rem;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.tier-cell:hover {
  transform: translateY(-3px) scale(1.04);
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 6px 22px -10px rgba(255, 255, 255, 0.25);
  z-index: 1;
}

.tier-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tier-cell:hover .tier-icon-wrap {
  transform: scale(1.35) rotate(-8deg);
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.45));
}

.tier-icon {
  width: 1.1rem;
  height: 1.1rem;
  object-fit: contain;
  image-rendering: pixelated;
}

.tier-cell:hover .badge {
  transform: scale(1.06);
}

.tier-pop-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--enter-delay, 0ms);
}

.tier-pop-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}

.tier-pop-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.tier-kit {
  display: none;
}

.badge {
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  padding: 0.1rem 0.4rem;
  border-radius: 0.4rem;
  background: transparent;
  color: var(--color-text-muted);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>

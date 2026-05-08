<script setup lang="ts">
import { profile } from '@/config/profile'

// 👇 Чтобы поменять ник / аватар / bio — открой src/config/profile.ts → identity
const identity = profile.identity
</script>

<template>
  <section class="glass-card neon-ring profile-card">
    <div class="avatar-wrap">
      <span class="avatar-orbit" aria-hidden="true" />
      <img
        class="avatar"
        :src="identity.avatarUrl"
        :alt="identity.nickname"
        loading="lazy"
        decoding="async"
      />
    </div>
    <h1 class="nickname">{{ identity.nickname }}</h1>
    <p class="bio">{{ identity.bio }}</p>
  </section>
</template>

<style scoped>
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.25rem 2rem 1.75rem;
  border-radius: 1.5rem;
  text-align: center;
  width: 100%;
  max-width: 28rem;
}

.avatar-wrap {
  position: relative;
  width: 7rem;
  height: 7rem;
  border-radius: 9999px;
  padding: 3px;
  background: linear-gradient(135deg, var(--color-accent), transparent 60%);
  box-shadow: 0 0 32px var(--color-glow);
  animation: avatar-pulse 4.5s ease-in-out infinite;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar-wrap:hover {
  transform: scale(1.04) rotate(-2deg);
}

.avatar-orbit {
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.45) 60deg,
    transparent 140deg,
    transparent 200deg,
    rgba(255, 255, 255, 0.25) 260deg,
    transparent 340deg
  );
  -webkit-mask: radial-gradient(circle, transparent 60%, #000 62%);
  mask: radial-gradient(circle, transparent 60%, #000 62%);
  animation: orbit-spin 6s linear infinite;
  pointer-events: none;
}

.avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  object-fit: cover;
  display: block;
  background: var(--color-background);
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes avatar-pulse {
  0%,
  100% {
    box-shadow: 0 0 32px var(--color-glow);
  }
  50% {
    box-shadow: 0 0 48px rgba(255, 255, 255, 0.32);
  }
}

.nickname {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0.5rem 0 0;
  background: linear-gradient(180deg, var(--color-text) 60%, var(--color-text-muted));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.bio {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}
</style>

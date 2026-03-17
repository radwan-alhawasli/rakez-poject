<template>
  <div class="login-intro-splash" :class="{ 'phase-fade': phase === 'fade', compact: isCompactDevice }">
    <div class="intro-backdrop"></div>
    <div class="intro-noise"></div>
    <div class="intro-grid"></div>
    <div class="intro-glow-core"></div>
    <div class="intro-orb intro-orb-navy"></div>
    <div class="intro-orb intro-orb-gold"></div>
    <div class="intro-stars"></div>
    <div class="intro-line intro-line-top"></div>
    <div class="intro-line intro-line-bottom"></div>

    <div class="intro-content">
      <div class="intro-copy-shell" :class="{ visible: phase !== 'idle' }">
        <div class="intro-copy">
          <span class="intro-kicker">RAKEZ REAL ESTATE</span>
        </div>
      </div>

      <div class="intro-logo-stage" :class="{ visible: phase === 'logo' || phase === 'fade' }">
        <div class="intro-logo-ring"></div>
        <div class="intro-logo-ring intro-logo-ring-secondary"></div>
        <div class="intro-logo-beam"></div>
        <img :src="rakezLogo" alt="شعار راكز العقارية" class="intro-logo" width="200" height="200" fetchpriority="high" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import rakezLogo from '@/assets/rakez-logo-brown-trans.webp';

const emit = defineEmits(['done']);
const phase = ref('idle');
const timers = [];

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isCompactDevice =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches);

const schedule = (callback, delay) => {
  const timer = window.setTimeout(callback, delay);
  timers.push(timer);
};

onMounted(() => {
  // إجمالي زمن الشارة: 5 ثوانٍ
  const totalDuration = prefersReducedMotion ? 3000 : 5000;
  const welcomeDelay = prefersReducedMotion ? 50 : isCompactDevice ? 80 : 120;
  const logoDelay = prefersReducedMotion ? 450 : isCompactDevice ? 900 : 1500;
  const fadeDelay = totalDuration - 1000; // بدء الاختفاء قبل ثانية من النهاية
  const doneDelay = totalDuration;

  schedule(() => {
    phase.value = 'welcome';
  }, welcomeDelay);

  schedule(() => {
    phase.value = 'logo';
  }, logoDelay);

  schedule(() => {
    phase.value = 'fade';
  }, fadeDelay);

  schedule(() => {
    emit('done');
  }, doneDelay);
});

onBeforeUnmount(() => {
  timers.forEach(timer => window.clearTimeout(timer));
});
</script>

<style scoped>
.login-intro-splash {
  position: fixed;
  inset: 0;
  z-index: 1200;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at top, rgba(54, 74, 98, 0.2) 0%, rgba(15, 23, 42, 0) 35%),
    linear-gradient(145deg, #02050b 0%, #08111d 38%, #0d1522 72%, #02050b 100%);
  opacity: 1;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.login-intro-splash.compact {
  background: linear-gradient(160deg, #02050b 0%, #08111d 54%, #0d1522 100%);
}

.login-intro-splash.phase-fade {
  opacity: 0;
  visibility: hidden;
}

.intro-backdrop,
.intro-noise,
.intro-grid,
.intro-glow-core,
.intro-stars,
.intro-orb,
.intro-line {
  position: absolute;
  inset: 0;
}

.intro-backdrop {
  background:
    radial-gradient(circle at 50% 16%, rgba(181, 169, 154, 0.14), transparent 24%),
    radial-gradient(circle at 16% 82%, rgba(39, 55, 77, 0.48), transparent 32%),
    radial-gradient(circle at 84% 18%, rgba(181, 169, 154, 0.1), transparent 21%);
}

.intro-noise {
  opacity: 0.1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 130px 130px;
  mix-blend-mode: soft-light;
}

.intro-glow-core {
  inset: 50% auto auto 50%;
  width: min(52vw, 760px);
  height: min(52vw, 760px);
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(181, 169, 154, 0.12) 0%, rgba(39, 55, 77, 0.08) 34%, rgba(0, 0, 0, 0) 72%);
  filter: blur(26px);
}

.intro-stars {
  opacity: 0.45;
  background-image:
    radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.95) 0 1.2px, transparent 1.8px),
    radial-gradient(circle at 72% 28%, rgba(181, 169, 154, 0.9) 0 1.4px, transparent 2px),
    radial-gradient(circle at 28% 72%, rgba(255, 255, 255, 0.75) 0 1px, transparent 1.8px),
    radial-gradient(circle at 82% 64%, rgba(181, 169, 154, 0.78) 0 1.2px, transparent 1.8px),
    radial-gradient(circle at 56% 16%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.8px);
  animation: starsPulse 5s ease-in-out infinite;
}

.intro-grid {
  inset: 8%;
  border: 1px solid rgba(181, 169, 154, 0.16);
  border-radius: 32px;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.03),
    0 0 80px rgba(0, 0, 0, 0.22);
}

.intro-orb {
  filter: blur(40px);
  opacity: 0.55;
}

.intro-orb-navy {
  top: -12%;
  right: -6%;
  width: 34vw;
  height: 34vw;
  max-width: 520px;
  max-height: 520px;
  background: radial-gradient(circle, rgba(39, 55, 77, 0.95) 0%, rgba(39, 55, 77, 0) 72%);
}

.intro-orb-gold {
  top: auto;
  bottom: -18%;
  left: -4%;
  width: 28vw;
  height: 28vw;
  max-width: 420px;
  max-height: 420px;
  background: radial-gradient(circle, rgba(181, 169, 154, 0.85) 0%, rgba(181, 169, 154, 0) 70%);
}

.intro-line {
  inset: auto 8% 8%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(181, 169, 154, 0.4) 50%, transparent 100%);
}

.intro-line-top {
  top: 9%;
  bottom: auto;
}

.intro-line-bottom {
  top: auto;
  bottom: 9%;
}

.intro-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.intro-copy-shell {
  position: relative;
  max-width: min(78vw, 860px);
  margin-bottom: 18px;
  padding: clamp(24px, 3vw, 40px) clamp(22px, 3vw, 42px);
  border: 1px solid rgba(181, 169, 154, 0.18);
  border-radius: 32px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015)),
    radial-gradient(circle at top, rgba(181, 169, 154, 0.08), rgba(181, 169, 154, 0) 42%);
  backdrop-filter: blur(10px);
  box-shadow:
    0 18px 60px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  opacity: 0;
  transform: translateY(22px) scale(0.98);
  transition:
    opacity 0.55s ease,
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.intro-copy-shell::before {
  content: '';
  position: absolute;
  inset: 16px;
  border: 1px solid rgba(181, 169, 154, 0.08);
  border-radius: 24px;
  pointer-events: none;
}

.intro-copy-shell.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.intro-copy {
  max-width: 760px;
  margin: 0 auto;
  font-family: 'Tajawal', 'Cairo', sans-serif;
}

.intro-kicker {
  display: inline-block;
  color: var(--color-gold-light);
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(16px, 0.8vw + 12px, 28px);
  font-weight: 600;
  letter-spacing: 0.3em;
  margin-bottom: 18px;
}


.intro-logo-stage {
  position: relative;
  width: min(42vw, 420px);
  aspect-ratio: 1;
  margin-top: 26px;
  display: grid;
  place-items: center;
  opacity: 0;
  transform: translateY(22px) scale(0.82);
  transition:
    opacity 0.5s ease,
    transform 0.55s cubic-bezier(0.2, 1, 0.3, 1);
}

.intro-logo-stage.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.intro-logo-ring,
.intro-logo-beam {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.intro-logo-ring {
  border: 1px solid rgba(181, 169, 154, 0.32);
  box-shadow:
    0 0 0 18px rgba(181, 169, 154, 0.04),
    0 0 90px rgba(181, 169, 154, 0.12),
    inset 0 0 50px rgba(39, 55, 77, 0.22);
  animation: introPulse 3.2s ease-in-out infinite;
}

.intro-logo-ring-secondary {
  inset: 10%;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: none;
  animation-duration: 4.6s;
}

.intro-logo-beam {
  inset: 18%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(181, 169, 154, 0.08) 34%, rgba(255, 255, 255, 0) 72%);
  filter: blur(12px);
}

.intro-logo {
  position: relative;
  z-index: 1;
  width: min(68%, 250px);
  height: auto;
  object-fit: contain;
  filter:
    drop-shadow(0 14px 30px rgba(0, 0, 0, 0.4))
    drop-shadow(0 0 18px rgba(181, 169, 154, 0.12));
  animation: logoFloat 4s ease-in-out infinite;
}

@keyframes introPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.88;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes starsPulse {
  0%,
  100% {
    opacity: 0.32;
  }
  50% {
    opacity: 0.55;
  }
}

@media (max-width: 768px) {
  .intro-noise,
  .intro-stars,
  .intro-line {
    display: none;
  }

  .intro-content {
    padding: 24px;
  }

  .intro-grid {
    inset: 14px;
    border-radius: 24px;
  }

  .intro-copy-shell {
    max-width: 100%;
    margin-bottom: 10px;
    padding: 22px 18px;
    border-radius: 24px;
    backdrop-filter: none;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  }

  .intro-copy-shell::before {
    inset: 10px;
    border-radius: 18px;
  }

  .intro-kicker {
    font-size: clamp(14px, 1.2vw + 10px, 20px);
    letter-spacing: 0.22em;
    margin-bottom: 12px;
  }

  .intro-logo-stage {
    width: min(72vw, 280px);
    margin-top: 22px;
  }

  .intro-logo-ring {
    box-shadow:
      0 0 0 12px rgba(181, 169, 154, 0.035),
      0 0 42px rgba(181, 169, 154, 0.08),
      inset 0 0 24px rgba(39, 55, 77, 0.18);
  }

  .intro-glow-core {
    width: min(62vw, 420px);
    height: min(62vw, 420px);
    filter: blur(16px);
  }

  .intro-orb {
    filter: blur(24px);
    opacity: 0.38;
  }
}

@media (max-width: 480px) {
  .intro-kicker {
    font-size: 13px;
  }

  .intro-content {
    padding: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-intro-splash,
  .intro-copy-shell,
  .intro-logo-stage,
  .intro-logo-ring,
  .intro-logo,
  .intro-stars {
    animation: none !important;
    transition-duration: 0.25s !important;
  }
}
</style>

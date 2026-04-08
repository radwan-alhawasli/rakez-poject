<template>
  <header class="rakez-dashboard-welcome rakez-dashboard-welcome--banner">
    <div class="header-content-wrapper">
      <div class="header-main-text">
        <h1 class="rakez-dashboard-welcome__title">
          <span class="title-ar">{{ displayTitle }}</span>
          <span class="title-en">{{ englishTitle }}</span>
        </h1>
        <p v-if="subtitle" class="rakez-dashboard-welcome__subtitle">
          <span class="subtitle-ar">{{ subtitle }}</span>
          <span class="subtitle-en">{{ englishSubtitle }}</span>
        </p>
      </div>
      <div class="header-accent-icon">
        <div class="glow-orb"></div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Shown in greeting when neither `title` nor `greetingName` is set */
  userName: { type: String, default: '' },
  /** Department or context name: "أهلاً بعودتك، {greetingName}!" */
  greetingName: { type: String, default: '' },
  /** Section context line under the title */
  subtitle: { type: String, default: '' },
  /**
   * Optional full heading (replaces default greeting entirely)
   */
  title: { type: String, default: '' },
  /** English equivalents for bilingual support */
  englishTitle: { type: String, default: 'Welcome Back' },
  englishSubtitle: { type: String, default: 'Key Performance Indicators & Workforce Management' },
});

const displayTitle = computed(() => {
  if (props.title) return props.title;
  const dept = props.greetingName?.trim();
  if (dept) return `أهلاً بعودتك، ${dept}!`;
  const name = props.userName?.trim() || 'مستخدم';
  return `أهلاً بعودتك، ${name}!`;
});
</script>

<style scoped>
.rakez-dashboard-welcome--banner {
  margin-bottom: 28px;
  text-align: right;
  padding: clamp(24px, 3vw, 32px) clamp(32px, 4vw, 48px);
  border-radius: 24px;
  background: linear-gradient(
    145deg,
    #1a2636 0%,
    #27374d 55%,
    #364a62 100%
  );
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(181, 169, 154, 0.1);
}

/* Animated Border Light Effect - Enhanced Visibility */
.rakez-dashboard-welcome--banner::before {
  content: "";
  position: absolute;
  inset: -3px;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    transparent 15%,
    var(--color-gold, #b5a99a) 25%,
    #fff 26%,
    var(--color-gold, #b5a99a) 27%,
    transparent 35%,
    transparent 65%,
    var(--color-gold, #b5a99a) 75%,
    #fff 76%,
    var(--color-gold, #b5a99a) 77%,
    transparent 85%,
    transparent 100%
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: destination-out;
  padding: 3px;
  border-radius: 24px;
  animation: border-rotate 4s linear infinite;
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(0 0 12px rgba(181, 169, 154, 0.8));
}

@keyframes border-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Add a secondary glow that follows the light */
.rakez-dashboard-welcome--banner::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 24px;
  box-shadow: inset 0 0 20px rgba(181, 169, 154, 0.2);
  pointer-events: none;
  z-index: 0;
}

.header-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.header-main-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rakez-dashboard-welcome__title {
  display: flex;
  flex-direction: column;
  margin: 0;
  line-height: 1.1;
}

.title-ar {
  font-size: clamp(1.4rem, 2.2vw, 1.8rem);
  font-weight: 800;
  color: var(--color-gold, #b5a99a);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.title-en {
  font-size: clamp(0.9rem, 1.2vw, 1.1rem);
  font-weight: 600;
  color: rgba(181, 169, 154, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: 'Montserrat', sans-serif;
}

.rakez-dashboard-welcome__subtitle {
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 4px;
}

.subtitle-ar {
  color: rgba(255, 255, 255, 0.85);
  font-size: clamp(0.9rem, 1.1vw, 1.05rem);
  font-weight: 500;
}

.subtitle-en {
  color: rgba(181, 169, 154, 0.5);
  font-size: clamp(0.75rem, 0.9vw, 0.85rem);
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
}

.header-accent-icon {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glow-orb {
  width: 40px;
  height: 40px;
  background: var(--color-gold, #b5a99a);
  border-radius: 50%;
  filter: blur(25px);
  opacity: 0.4;
}

/* Decorative background element */
.rakez-dashboard-welcome--banner::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -10%;
  width: 40%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(181, 169, 154, 0.05), transparent);
  transform: rotate(25deg);
  pointer-events: none;
}
</style>

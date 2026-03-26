<template>
  <header class="rakez-dashboard-welcome rakez-dashboard-welcome--banner">
    <h1 class="rakez-dashboard-welcome__title">{{ displayTitle }}</h1>
    <p v-if="subtitle" class="rakez-dashboard-welcome__subtitle">{{ subtitle }}</p>
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
  padding: clamp(18px, 2.2vw, 26px) clamp(20px, 2.5vw, 32px);
  border-radius: var(--radius-lg, 20px);
  border-bottom: none;
  background: linear-gradient(
    145deg,
    var(--color-navy-dark, #1a2636) 0%,
    var(--color-navy, #27374d) 55%,
    var(--color-navy-light, #364a62) 100%
  );
  box-shadow: var(--shadow-navy, 0 8px 32px rgba(30, 58, 95, 0.22));
}

.rakez-dashboard-welcome__title {
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 800;
  color: var(--color-cream-gold, #faf6f0);
  margin: 0 0 0.4rem 0;
  line-height: 1.3;
}

.rakez-dashboard-welcome__subtitle {
  color: rgba(248, 250, 252, 0.72);
  margin: 0;
  font-size: clamp(0.9rem, 1.2vw, 1.05rem);
  line-height: 1.5;
}
</style>

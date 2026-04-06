<template>
  <section class="dark-widget-shell">
    <header v-if="title || subtitle || $slots.header" class="dark-widget-shell__head">
      <div class="dark-widget-shell__titles">
        <h3 v-if="title" class="dark-widget-shell__title">{{ title }}</h3>
        <p v-if="subtitle" class="dark-widget-shell__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="header" />
      <div v-if="showDecorativeControls" class="dark-widget-shell__dots" aria-hidden="true">
        <span /><span /><span />
      </div>
    </header>
    <div class="dark-widget-shell__body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  /** Window-style dots — decorative only */
  showDecorativeControls: { type: Boolean, default: true },
});
</script>

<style scoped>
.dark-widget-shell {
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(181, 169, 154, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  min-height: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark-widget-shell:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(181, 169, 154, 0.1);
  border-color: rgba(181, 169, 154, 0.3);
}

.dark-widget-shell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px 8px;
  border-bottom: 1px solid rgba(181, 169, 154, 0.08);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent);
}

.dark-widget-shell__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-gold, #b5a99a);
  letter-spacing: 0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.25;
}

.dark-widget-shell__subtitle {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.5);
  line-height: 1.35;
  font-weight: 400;
}

.dark-widget-shell__dots {
  display: flex;
  gap: 5px;
  padding-top: 0;
  flex-shrink: 0;
  align-self: flex-start;
}

.dark-widget-shell__dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(177, 162, 143, 0.35);
}

.dark-widget-shell__body {
  padding: 8px 14px 14px;
  color: #e2e8f0;
}

/* Unovis axes inside dark panels — keep tick labels readable */
.dark-widget-shell__body :deep(.vis-axis text),
.dark-widget-shell__body :deep(.vis-axis-label) {
  fill: rgba(226, 232, 240, 0.88) !important;
}

.dark-widget-shell__body :deep(.vis-axis line),
.dark-widget-shell__body :deep(.vis-axis path) {
  stroke: rgba(148, 163, 184, 0.35);
}
</style>

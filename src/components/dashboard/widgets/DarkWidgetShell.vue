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
  background: linear-gradient(160deg, #1a2332 0%, #243142 48%, #1e2a3a 100%);
  border-radius: 20px;
  border: 1px solid rgba(177, 162, 143, 0.18);
  box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  overflow: hidden;
  min-height: 0;
}

.dark-widget-shell__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 10px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.dark-widget-shell__titles {
  text-align: right;
  min-width: 0;
}

.dark-widget-shell__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.dark-widget-shell__subtitle {
  margin: 4px 0 0;
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.65);
  line-height: 1.4;
}

.dark-widget-shell__dots {
  display: flex;
  gap: 6px;
  padding-top: 4px;
  flex-shrink: 0;
}

.dark-widget-shell__dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(177, 162, 143, 0.35);
}

.dark-widget-shell__body {
  padding: 12px 16px 18px;
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

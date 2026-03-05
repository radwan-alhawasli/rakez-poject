<template>
  <div class="stepper-wrapper">
    <div class="stepper-line">
      <div class="stepper-line-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>

    <div class="steps-container">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{
          completed: isCompleted(step),
          active: modelValue === index,
        }"
        @click="$emit('update:modelValue', index)"
      >
        <div class="step-circle">
          <span v-if="isCompleted(step)" class="step-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span v-else class="step-number">{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ stepLabel(step) }}</span>
        <span v-if="isCompleted(step)" class="step-done">{{ completedLabel }}</span>
        <span v-else-if="step.completedAt" class="step-date">{{ step.completedAt }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UiStepper',
  props: {
    /** Current active step index (0-based) */
    modelValue: {
      type: Number,
      default: 0,
    },
    /** Steps: { name: string, status?: 'completed'|'pending', completedAt?: string } */
    steps: {
      type: Array,
      default: () => [],
    },
    /** Label shown below completed steps (e.g. "تم") */
    completedLabel: {
      type: String,
      default: 'تم',
    },
  },
  emits: ['update:modelValue'],
  computed: {
    progressPercentage() {
      const steps = this.steps || [];
      if (steps.length === 0) return 0;
      const completedCount = steps.filter(s => this.isCompleted(s)).length;
      if (completedCount === steps.length) return 100;
      return (completedCount / steps.length) * 100;
    },
  },
  methods: {
    isCompleted(step) {
      return step && (step.status === 'completed' || !!step.completedAt);
    },
    stepLabel(step) {
      return step && (step.name || step.label || step.title || '');
    },
  },
};
</script>

<style scoped>
.stepper-wrapper {
  position: relative;
  margin-bottom: 60px;
  padding: 0 20px;
}

.stepper-line {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-medium-gray, #e2e8f0);
  z-index: 1;
}

.stepper-line-fill {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: var(--color-gold, #b1a28f);
  transition: width 0.3s ease;
}

.steps-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  direction: rtl;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  width: 120px;
}

.step-circle {
  width: 40px;
  height: 40px;
  background: var(--color-white, #fff);
  border: 1px solid var(--color-medium-gray, #e2e8f0);
  border-radius: var(--radius-full, 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
  transition: all 0.2s;
}

.step-check {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-check svg {
  width: 16px;
  height: 16px;
}

.step-number {
  font-size: 14px;
}

.step-item.active .step-circle {
  border-color: var(--color-gold, #b1a28f);
  color: var(--color-gold, #b1a28f);
  box-shadow: 0 0 0 4px rgba(177, 162, 143, 0.1);
}

.step-item.completed .step-circle {
  background: var(--color-gold, #b1a28f);
  border-color: var(--color-gold, #b1a28f);
  color: var(--color-white, #fff);
}

.step-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  text-align: center;
}

.step-done {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success, #16a34a);
}

.step-date {
  font-size: 10px;
  color: var(--color-success, #28a745);
  font-weight: 600;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .stepper-wrapper {
    padding: 0 8px;
    margin-bottom: 40px;
  }

  .step-item {
    width: 80px;
  }

  .step-circle {
    width: 36px;
    height: 36px;
  }

  .step-label {
    font-size: 11px;
  }
}
</style>

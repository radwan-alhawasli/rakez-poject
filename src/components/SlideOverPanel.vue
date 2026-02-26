<template>
  <transition name="panel">
    <div
      v-if="show"
      class="slide-over-panel-wrapper"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="panel-backdrop" @click="$emit('close')"></div>
      <aside class="panel-content" :class="{ 'panel-rtl': rtl }">
        <div class="panel-header">
          <h2 class="panel-title">{{ title }}</h2>
          <button type="button" class="panel-close" @click="$emit('close')" aria-label="إغلاق">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="20"
              height="20"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="panel-body custom-scrollbar">
          <slot></slot>
        </div>
      </aside>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SlideOverPanel',
  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    rtl: { type: Boolean, default: true },
  },
  emits: ['close'],
};
</script>

<style scoped>
.slide-over-panel-wrapper {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}
.slide-over-panel-wrapper.panel-rtl .panel-content {
  margin-right: 0;
  margin-left: auto;
}
.panel-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  animation: fadeIn 0.2s ease;
}
.panel-content {
  position: relative;
  box-sizing: border-box;
  width: min(480px, 100vw);
  max-width: 100vw;
  min-width: 0;
  height: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  animation: slideIn 0.3s ease;
}
[dir='rtl'] .panel-content {
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}
.panel-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid var(--color-medium-gray);
  background: linear-gradient(135deg, var(--color-off-white) 0%, #fff 100%);
}
.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-navy);
}
.panel-close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: var(--color-light-gray);
  color: var(--color-dark-gray);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.panel-close:hover {
  background: #fee2e2;
  color: var(--color-error);
}
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  direction: rtl;
}

@media (max-width: 768px) {
  .panel-content {
    width: 100vw;
    max-width: 100vw;
  }
}
@media (max-width: 576px) {
  .panel-header {
    padding: 16px;
  }
  .panel-title {
    font-size: 18px;
  }
  .panel-body {
    padding: 16px;
  }
}
@media (max-width: 320px) {
  .panel-header {
    padding: 12px;
  }
  .panel-title {
    font-size: 16px;
  }
  .panel-body {
    padding: 12px;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
[dir='rtl'] .panel-content {
  animation-name: slideInRtl;
}
@keyframes slideInRtl {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
.panel-enter-active .panel-backdrop,
.panel-enter-active .panel-content,
.panel-leave-active .panel-backdrop,
.panel-leave-active .panel-content {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.panel-leave-active .panel-content {
  transform: translateX(100%);
}
[dir='rtl'] .panel-leave-active .panel-content {
  transform: translateX(-100%);
}
.panel-enter-from .panel-backdrop,
.panel-leave-to .panel-backdrop {
  opacity: 0;
}
</style>

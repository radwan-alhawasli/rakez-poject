<template>
  <div
    class="chatbot-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="المساعد الذكي"
    tabindex="-1"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
    ref="overlayRef"
  >
    <div class="chatbot-modal-container" ref="containerRef">
      <ChatbotPanel
        :current-route="currentRoute"
        :show-close-button="true"
        @close="$emit('close')"
        @navigate="closeChatbotModal"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import ChatbotPanel from './ChatbotPanel.vue';

export default {
  name: 'ChatbotModal',
  components: { ChatbotPanel },
  props: {
    currentRoute: {
      type: Object,
      default: () => ({ path: '/', params: {}, name: '' }),
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const overlayRef = ref(null);
    const containerRef = ref(null);

    function closeChatbotModal() {
      emit('close');
    }

    function handleEscape(e) {
      if (e.key === 'Escape') emit('close');
    }

    onMounted(() => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    });

    onUnmounted(() => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    });

    return {
      overlayRef,
      containerRef,
      closeChatbotModal,
    };
  },
};
</script>

<style scoped>
.chatbot-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 58, 95, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 20px;
  backdrop-filter: blur(2px);
  animation: chatbotFadeIn 0.25s ease;
}
.chatbot-modal-overlay:focus {
  outline: none;
}
@keyframes chatbotFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chatbot-modal-container {
  width: 100%;
  max-width: 420px;
  height: 560px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-xl, 0 20px 60px -15px rgba(0, 0, 0, 0.18));
}

@media (max-width: 768px) {
  .chatbot-modal-overlay {
    padding: 16px;
  }
  .chatbot-modal-container {
    max-width: 100%;
    height: calc(100vh - 32px);
  }
}
@media (max-width: 576px) {
  .chatbot-modal-overlay {
    padding: 10px;
  }
  .chatbot-modal-container {
    height: calc(100vh - 20px);
    border-radius: 12px;
  }
}
@media (max-width: 320px) {
  .chatbot-modal-overlay {
    padding: 6px;
  }
  .chatbot-modal-container {
    height: calc(100vh - 12px);
  }
}
</style>

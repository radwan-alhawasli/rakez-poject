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
      <div class="chatbot-modal-header">
        <div class="chatbot-header-content">
          <span class="chatbot-avatar">🤖</span>
          <div>
            <h2 class="chatbot-title">المساعد الذكي</h2>
            <p class="chatbot-subtitle">اسألني أي سؤال وسأساعدك.</p>
          </div>
        </div>
        <button type="button" class="chatbot-close-btn" @click="$emit('close')" aria-label="إغلاق">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="chatbot-messages" ref="messagesRef">
        <div v-if="messages.length === 0" class="chatbot-welcome">
          <p class="chatbot-welcome-title">كيف يمكنني مساعدتك اليوم؟</p>
          <p class="chatbot-welcome-text">اكتب رسالتك أدناه أو اختر أحد الاقتراحات.</p>
          <div class="chatbot-quick-prompts">
            <button v-for="(s, i) in quickPrompts" :key="i" type="button" @click="sendQuickPrompt(s)">{{ s }}</button>
          </div>
        </div>
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['chatbot-bubble', msg.role]"
        >
          <div class="chatbot-bubble-sender">{{ msg.role === 'user' ? 'أنت' : 'المساعد الذكي' }}</div>
          <div class="chatbot-bubble-text">{{ msg.content }}</div>
        </div>
        <div v-if="isTyping" class="chatbot-bubble assistant">
          <div class="chatbot-typing"><span></span><span></span><span></span></div>
        </div>
      </div>

      <div class="chatbot-input-wrap">
        <textarea
          v-model="inputText"
          placeholder="اكتب رسالتك..."
          rows="1"
          @keydown.enter.exact.prevent="sendMessage"
          ref="inputRef"
        />
        <button
          type="button"
          class="chatbot-send-btn"
          :disabled="!inputText.trim() || isTyping"
          @click="sendMessage"
          aria-label="إرسال"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import aiService from '../services/aiService'
import logger from '../utils/logger'

export default {
  name: 'ChatbotModal',
  emits: ['close'],
  setup(props, { emit }) {
    const overlayRef = ref(null)
    const containerRef = ref(null)
    const messagesRef = ref(null)
    const inputRef = ref(null)
    const inputText = ref('')
    const messages = ref([])
    const isTyping = ref(false)
    const sessionId = ref(null)

    const quickPrompts = [
      'كيف يمكنني مساعدتك؟',
      'ما هي الخدمات المتاحة؟',
      'أريد الاستفسار عن مشروع'
    ]

    async function sendMessage() {
      const text = inputText.value?.trim()
      if (!text || isTyping.value) return

      messages.value.push({ role: 'user', content: text })
      inputText.value = ''
      isTyping.value = true

      try {
        const payload = {
          message: text,
          session_id: sessionId.value,
          section: 'general'
        }
        const response = await aiService.chat(payload)
        const reply = response.reply || response.answer || response.message || response.text || 'عذراً، لم أتمكن من الرد.'
        messages.value.push({ role: 'assistant', content: reply })
        if (response.session_id && !sessionId.value) {
          sessionId.value = response.session_id
        }
      } catch (err) {
        logger.error('Chatbot error:', err)
        messages.value.push({
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء الاتصال. يرجى المحاولة لاحقاً.'
        })
      } finally {
        isTyping.value = false
        scrollToBottom()
      }
    }

    function sendQuickPrompt(text) {
      inputText.value = text
      sendMessage()
    }

    function scrollToBottom() {
      nextTick(() => {
        if (messagesRef.value) {
          messagesRef.value.scrollTop = messagesRef.value.scrollHeight
        }
      })
    }

    function handleEscape(e) {
      if (e.key === 'Escape') emit('close')
    }

    onMounted(() => {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
      nextTick(() => inputRef.value?.focus())
    })

    onUnmounted(() => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    })

    return {
      overlayRef,
      containerRef,
      messagesRef,
      inputRef,
      inputText,
      messages,
      isTyping,
      quickPrompts,
      sendMessage,
      sendQuickPrompt
    }
  }
}
</script>

<style scoped>
.chatbot-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 58, 95, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
  animation: chatbotFadeIn 0.25s ease;
}
.chatbot-modal-overlay:focus {
  outline: none;
}
@keyframes chatbotFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.chatbot-modal-container {
  background: var(--color-white, #fff);
  border-radius: var(--radius-lg, 20px);
  width: 100%;
  max-width: 420px;
  height: 560px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl, 0 20px 60px -15px rgba(0, 0, 0, 0.18));
  overflow: hidden;
  direction: rtl;
  border-top: 4px solid var(--color-gold, #B1A28F);
}

.chatbot-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--color-off-white, #fdfbf7) 0%, #fff 100%);
  border-bottom: 1px solid var(--color-medium-gray, #e2e8f0);
}
.chatbot-header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chatbot-avatar {
  font-size: 32px;
  line-height: 1;
}
.chatbot-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 2px 0;
  font-family: 'Cairo', 'Amiri', serif;
}
.chatbot-subtitle {
  font-size: 13px;
  color: var(--color-dark-gray, #64748b);
  margin: 0;
}
.chatbot-close-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-dark-gray, #64748b);
  border-radius: 10px;
  transition: color 0.2s, background 0.2s;
}
.chatbot-close-btn:hover {
  color: var(--color-navy, #1e3a5f);
  background: var(--color-light-gray, #f8fafc);
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chatbot-welcome {
  text-align: center;
  padding: 24px 16px;
}
.chatbot-welcome-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 8px 0;
}
.chatbot-welcome-text {
  font-size: 14px;
  color: var(--color-dark-gray, #64748b);
  margin: 0 0 20px 0;
}
.chatbot-quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.chatbot-quick-prompts button {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--color-medium-gray, #e2e8f0);
  background: var(--color-white, #fff);
  color: var(--color-charcoal, #1e293b);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.chatbot-quick-prompts button:hover {
  border-color: var(--color-gold, #B1A28F);
  color: var(--color-gold-dark, #8c7851);
  background: var(--color-off-white, #fdfbf7);
}

.chatbot-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
}
.chatbot-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--color-navy, #1e3a5f), #2d5a8f);
  color: white;
  border-bottom-left-radius: 4px;
}
.chatbot-bubble.assistant {
  align-self: flex-start;
  background: var(--color-light-gray, #f8fafc);
  color: var(--color-charcoal, #1e293b);
  border: 1px solid var(--color-medium-gray, #e2e8f0);
  border-bottom-right-radius: 4px;
}
.chatbot-bubble-sender {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 4px;
  opacity: 0.85;
}
.chatbot-bubble-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.chatbot-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}
.chatbot-typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-dark-gray, #64748b);
  animation: chatbotTyping 1.4s ease-in-out infinite both;
}
.chatbot-typing span:nth-child(2) { animation-delay: 0.2s; }
.chatbot-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes chatbotTyping {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chatbot-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--color-medium-gray, #e2e8f0);
  background: var(--color-white, #fff);
}
.chatbot-input-wrap textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid var(--color-medium-gray, #e2e8f0);
  border-radius: var(--radius-md, 14px);
  font-size: 15px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}
.chatbot-input-wrap textarea:focus {
  border-color: var(--color-gold, #B1A28F);
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.15);
}
.chatbot-send-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius-md, 14px);
  background: linear-gradient(135deg, var(--color-gold, #B1A28F) 0%, var(--color-gold-dark, #8c7851) 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, opacity 0.2s;
}
.chatbot-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}
.chatbot-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.chatbot-send-btn svg {
  width: 20px;
  height: 20px;
}
</style>

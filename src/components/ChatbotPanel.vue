<template>
  <div class="chatbot-panel" :class="{ 'chatbot-panel-standalone': standalone }">
    <div class="chatbot-panel-header">
      <div class="chatbot-header-content">
        <span class="chatbot-avatar"
          ><svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="32"
            height="32"
          >
            <rect x="3" y="8" width="18" height="12" rx="2"></rect>
            <circle cx="8.5" cy="13" r="1.5"></circle>
            <circle cx="15.5" cy="13" r="1.5"></circle>
            <path d="M9 17h6"></path>
            <path d="M12 8V5"></path>
            <path d="M8 5h8"></path></svg
        ></span>
        <div>
          <h2 class="chatbot-title">المساعد الذكي</h2>
          <p class="chatbot-subtitle">اسألني أي سؤال وسأساعدك.</p>
        </div>
      </div>
      <button
        v-if="showCloseButton"
        type="button"
        class="chatbot-close-btn"
        @click="$emit('close')"
        aria-label="إغلاق"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="chatbot-messages custom-scrollbar" ref="messagesRef">
      <!-- شاشة الترحيب -->
      <div v-if="messages.length === 0 && !isTyping" class="chatbot-welcome">
        <p class="chatbot-welcome-title">كيف يمكنني مساعدتك اليوم؟</p>
        <p class="chatbot-welcome-text">اكتب رسالتك أدناه أو اختر أحد الاقتراحات.</p>
        <div class="chatbot-quick-prompts">
          <button v-for="(s, i) in quickPrompts" :key="i" type="button" @click="sendQuickPrompt(s)">
            {{ s }}
          </button>
        </div>
      </div>

      <template v-for="(msg, idx) in messages" :key="idx">
        <div :class="['chatbot-bubble', msg.role, { 'chatbot-bubble-error': msg.isError }]">
          <div class="chatbot-bubble-header">
            <div class="chatbot-bubble-sender">
              {{ msg.role === 'user' ? 'أنت' : 'المساعد الذكي' }}
            </div>
            <div v-if="msg.role === 'assistant'" class="chatbot-bubble-actions">
              <button
                type="button"
                class="chatbot-action-btn"
                :title="copyFeedback === idx ? 'تم النسخ' : 'نسخ'"
                @click="onCopy(msg.content, idx)"
              >
                <svg
                  v-if="copyFeedback !== idx"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg
                  v-else
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- رسالة المستخدم -->
          <template v-if="msg.role === 'user'">
            <div class="chatbot-bubble-text">{{ msg.content }}</div>
          </template>

          <!-- رسالة المساعد -->
          <template v-else>
            <div
              v-if="msg.contentHtml"
              class="chatbot-bubble-text chatbot-bubble-markdown"
              v-html="msg.contentHtml"
            ></div>
            <div v-else-if="msg.content" class="chatbot-bubble-text">{{ msg.content }}</div>

            <!-- المصادر -->
            <div v-if="msg.sources && msg.sources.length" class="chatbot-sources">
              <div class="chatbot-sources-title">المصادر</div>
              <div v-for="(src, si) in msg.sources" :key="si" class="chatbot-source-item">
                <span class="chatbot-source-title">{{ src.title }}</span>
                <span v-if="src.excerpt" class="chatbot-source-excerpt">{{ src.excerpt }}</span>
              </div>
            </div>

            <!-- الروابط -->
            <div v-if="msg.links && msg.links.length" class="chatbot-links">
              <button
                v-for="(link, li) in msg.links"
                :key="li"
                type="button"
                class="chatbot-link-btn"
                @click="onNavigate(link.route)"
              >
                {{ link.label }}
              </button>
            </div>

            <!-- ملاحظات الصلاحيات -->
            <div
              v-if="
                msg.explainAccess &&
                (msg.explainAccess.human_reason ||
                  (msg.explainAccess.suggested_routes && msg.explainAccess.suggested_routes.length))
              "
              class="chatbot-access-notes"
            >
              <p v-if="msg.explainAccess.human_reason" class="chatbot-access-reason">
                {{ msg.explainAccess.human_reason }}
              </p>
              <div
                v-if="
                  msg.explainAccess.suggested_routes && msg.explainAccess.suggested_routes.length
                "
                class="chatbot-suggested-routes"
              >
                <button
                  v-for="(sr, sri) in msg.explainAccess.suggested_routes"
                  :key="sri"
                  type="button"
                  class="chatbot-link-btn"
                  @click="onNavigate(sr.route)"
                >
                  {{ sr.label }}
                </button>
              </div>
            </div>

            <!-- أسئلة المتابعة -->
            <div
              v-if="msg.followUpQuestions && msg.followUpQuestions.length"
              class="chatbot-follow-ups"
            >
              <button
                v-for="(q, qi) in msg.followUpQuestions"
                :key="qi"
                type="button"
                class="chatbot-follow-up-chip"
                @click="sendQuickPrompt(q)"
              >
                {{ q }}
              </button>
            </div>

            <!-- زر إعادة المحاولة -->
            <div v-if="msg.isError && idx === messages.length - 1" class="chatbot-retry-wrap">
              <button type="button" class="chatbot-retry-btn" @click="retryLastMessage">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                إعادة المحاولة
              </button>
            </div>
          </template>
        </div>
      </template>

      <!-- مؤشر الكتابة -->
      <div v-if="isTyping" class="chatbot-bubble assistant">
        <div class="chatbot-typing"><span></span><span></span><span></span></div>
      </div>
    </div>

    <div class="chatbot-input-wrap">
      <textarea
        v-model="inputText"
        :placeholder="inputPlaceholder"
        rows="1"
        :disabled="isTyping"
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useChatbot } from '../composables/useChatbot';

export default {
  name: 'ChatbotPanel',
  props: {
    currentRoute: {
      type: Object,
      default: () => ({ path: '/', params: {}, name: '' }),
    },
    showCloseButton: {
      type: Boolean,
      default: false,
    },
    standalone: {
      type: Boolean,
      default: false,
    },
    inputPlaceholder: {
      type: String,
      default: 'اكتب رسالتك...',
    },
    initialSessionId: {
      type: String,
      default: null,
    },
    section: {
      type: String,
      default: null,
    },
  },
  emits: ['close', 'navigate', 'first-message', 'session-update'],
  setup(props, { emit }) {
    const currentRouteRef = computed(() => props.currentRoute);
    const {
      messagesRef,
      inputRef,
      inputText,
      messages,
      isTyping,
      sessionId,
      quickPrompts,
      sendMessage,
      sendQuickPrompt,
      navigateTo,
      retryLastMessage,
      copyMessageContent,
      dispose,
    } = useChatbot(currentRouteRef, {
      initialSessionId: props.initialSessionId,
      section: props.section,
    });

    // تحديث sessionId في useChatbot عند تغير الـ prop من الخارج (مثال: من AiAssistantView)
    watch(
      () => props.initialSessionId,
      newId => {
        sessionId.value = newId;
      }
    );

    watch(sessionId, val => {
      if (val) emit('session-update', val);
    });

    const copyFeedback = ref(null);
    let copyTimeout = null;

    function onNavigate(backendRoute) {
      navigateTo(backendRoute);
      emit('navigate');
    }

    function onCopy(content, idx) {
      copyMessageContent(content).then(() => {
        copyFeedback.value = idx;
        clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => {
          copyFeedback.value = null;
        }, 1500);
      });
    }

    function doSendMessage() {
      const isFirst = messages.value.length === 0;
      const text = inputText.value?.trim();
      if (isFirst && text) emit('first-message', text.slice(0, 80));
      sendMessage();
    }

    function doSendQuickPrompt(t) {
      const isFirst = messages.value.length === 0;
      if (isFirst && t) emit('first-message', t.slice(0, 80));
      sendQuickPrompt(t);
    }

    onMounted(() => {
      nextTick(() => inputRef.value?.focus());
    });

    onUnmounted(() => {
      clearTimeout(copyTimeout);
      dispose();
    });

    return {
      containerRef: null,
      messagesRef,
      inputRef,
      inputText,
      messages,
      isTyping,
      quickPrompts,
      copyFeedback,
      sendMessage: doSendMessage,
      sendQuickPrompt: doSendQuickPrompt,
      onNavigate,
      onCopy,
      retryLastMessage,
    };
  },
};
</script>

<style scoped>
.chatbot-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  direction: rtl;
  background: var(--color-white, #fff);
  border-radius: var(--radius-lg, 20px);
  overflow: hidden;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-top: 4px solid var(--color-gold, var(--color-gold));
}
.chatbot-panel-standalone {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chatbot-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--color-off-white, var(--color-off-white)) 0%, #fff 100%);
  border-bottom: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  flex-shrink: 0;
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
  color: var(--color-navy, var(--color-navy));
  margin: 0 0 2px 0;
}
.chatbot-subtitle {
  font-size: 13px;
  color: var(--color-dark-gray, var(--color-dark-gray));
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
  color: var(--color-dark-gray, var(--color-dark-gray));
  border-radius: 10px;
  transition: color 0.2s, background 0.2s;
}
.chatbot-close-btn:hover {
  color: var(--color-navy, var(--color-navy));
  background: var(--color-light-gray, var(--color-light-gray));
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
.chatbot-messages.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(177, 162, 143, 0.5) rgba(177, 162, 143, 0.1);
}
.chatbot-messages::-webkit-scrollbar {
  width: 6px;
}
.chatbot-messages::-webkit-scrollbar-track {
  background: rgba(177, 162, 143, 0.08);
  border-radius: 3px;
}
.chatbot-messages::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-radius: 3px;
}
.chatbot-messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--color-gold-light) 0%, var(--color-gold) 100%);
}
.chatbot-welcome {
  text-align: center;
  padding: 24px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.chatbot-welcome-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy, var(--color-navy));
  margin: 0 0 8px 0;
}
.chatbot-welcome-text {
  font-size: 14px;
  color: var(--color-dark-gray, var(--color-dark-gray));
  margin: 0 0 20px 0;
}
.chatbot-quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}
.chatbot-quick-prompts button {
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  background: var(--color-white, #fff);
  color: var(--color-charcoal, var(--color-charcoal));
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.chatbot-quick-prompts button:hover {
  border-color: var(--color-gold, var(--color-gold));
  color: var(--color-gold-dark, var(--color-gold-dark));
  background: var(--color-off-white, var(--color-off-white));
  box-shadow: 0 1px 3px rgba(177, 162, 143, 0.15);
}

.chatbot-bubble {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 14px;
}
.chatbot-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--color-navy, var(--color-navy)), #2d5a8f);
  color: white;
  border-bottom-left-radius: 4px;
}
.chatbot-bubble.assistant {
  align-self: flex-start;
  background: var(--color-light-gray, var(--color-light-gray));
  color: var(--color-charcoal, var(--color-charcoal));
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-bottom-right-radius: 4px;
}
.chatbot-bubble-error {
  border-color: #fca5a5 !important;
  background: #fef2f2 !important;
}

.chatbot-bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.chatbot-bubble-sender {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.85;
}
.chatbot-bubble-actions {
  display: flex;
  gap: 4px;
}
.chatbot-action-btn {
  background: transparent;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  color: var(--color-dark-gray, var(--color-dark-gray));
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
}
.chatbot-action-btn:hover {
  color: var(--color-navy, var(--color-navy));
  background: rgba(0, 0, 0, 0.05);
}

.chatbot-bubble-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.chatbot-bubble-markdown :deep(p) {
  margin: 0 0 0.5em 0;
}
.chatbot-bubble-markdown :deep(ul),
.chatbot-bubble-markdown :deep(ol) {
  margin: 0.5em 0;
  padding-right: 1.2em;
}
.chatbot-bubble-markdown :deep(a) {
  color: var(--color-gold-dark, var(--color-gold-dark));
  text-decoration: underline;
}
.chatbot-bubble-markdown :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 4px;
  border-radius: 4px;
  font-size: 0.95em;
}
.chatbot-bubble-markdown :deep(pre) {
  margin: 0.5em 0;
  overflow-x: auto;
}
.chatbot-sources {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-medium-gray, var(--color-medium-gray));
}
.chatbot-sources-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-dark-gray, var(--color-dark-gray));
  margin-bottom: 6px;
}
.chatbot-source-item {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}
.chatbot-source-title {
  font-weight: 600;
}
.chatbot-source-excerpt {
  display: block;
  color: var(--color-dark-gray, var(--color-dark-gray));
  margin-top: 2px;
}
.chatbot-links,
.chatbot-suggested-routes,
.chatbot-follow-ups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.chatbot-link-btn,
.chatbot-follow-up-chip {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-gold, var(--color-gold));
  background: var(--color-off-white, var(--color-off-white));
  color: var(--color-gold-dark, var(--color-gold-dark));
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.chatbot-link-btn:hover,
.chatbot-follow-up-chip:hover {
  background: var(--color-gold, var(--color-gold));
  color: #fff;
}
.chatbot-access-notes {
  margin-top: 10px;
  padding: 8px;
  background: rgba(177, 162, 143, 0.1);
  border-radius: 8px;
}
.chatbot-access-reason {
  font-size: 12px;
  color: var(--color-charcoal, var(--color-charcoal));
  margin: 0 0 6px 0;
}

/* زر إعادة المحاولة */
.chatbot-retry-wrap {
  margin-top: 8px;
  display: flex;
}
.chatbot-retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #fca5a5;
  background: #fff;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.chatbot-retry-btn:hover {
  background: #fef2f2;
  border-color: #f87171;
}

/* مؤشر الكتابة */
.chatbot-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}
.chatbot-typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-dark-gray, var(--color-dark-gray));
  animation: chatbotTyping 1.4s ease-in-out infinite both;
}
.chatbot-typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.chatbot-typing span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes chatbotTyping {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chatbot-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  background: var(--color-white, #fff);
  flex-shrink: 0;
}
.chatbot-input-wrap textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-radius: var(--radius-md, 14px);
  font-size: 15px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  direction: rtl;
}
.chatbot-input-wrap textarea:focus {
  border-color: var(--color-gold, var(--color-gold));
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.15);
}
.chatbot-input-wrap textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.chatbot-send-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--radius-md, 14px);
  background: linear-gradient(
    135deg,
    var(--color-gold, var(--color-gold)) 0%,
    var(--color-gold-dark, var(--color-gold-dark)) 100%
  );
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
}
.chatbot-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(177, 162, 143, 0.4);
}
.chatbot-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.chatbot-send-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

@media (max-width: 768px) {
  .chatbot-panel {
    border-radius: 12px;
  }
  .chatbot-bubble {
    max-width: 95%;
  }
  .chatbot-quick-prompts button {
    padding: 8px 12px;
    font-size: 12px;
  }
}
@media (max-width: 576px) {
  .chatbot-panel-header {
    padding: 14px 14px;
  }
  .chatbot-title {
    font-size: 16px;
  }
  .chatbot-subtitle {
    font-size: 12px;
  }
  .chatbot-messages {
    padding: 12px;
    gap: 10px;
  }
  .chatbot-input-wrap {
    padding: 10px 12px 12px;
  }
  .chatbot-input-wrap textarea {
    font-size: 14px;
  }
}

@media (max-width: 320px) {
  .chatbot-panel-header {
    padding: 12px 12px;
  }
  .chatbot-avatar {
    font-size: 28px;
  }
  .chatbot-title {
    font-size: 15px;
  }
  .chatbot-messages {
    padding: 10px;
  }
  .chatbot-input-wrap {
    padding: 10px;
  }
}
</style>

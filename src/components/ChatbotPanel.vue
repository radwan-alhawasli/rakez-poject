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
              v-html="safeChatHtml(msg.contentHtml)"
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
import { useChatbot } from '@/composables/useChatbot';
import { sanitizeHtml, RICH_CHAT_HTML_OPTIONS } from '@/utils/safeHtml';

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

    function safeChatHtml(html) {
      return sanitizeHtml(html || '', RICH_CHAT_HTML_OPTIONS);
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
      safeChatHtml,
    };
  },
};
</script>

<style scoped src="./styles/ChatbotPanel.scoped.s1.css"></style>

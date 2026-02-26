<template>
  <div class="ai-assistant-view">
    <!-- الشريط الجانبي -->
    <aside class="ai-assistant-sidebar">
      <div class="ai-assistant-sidebar-head">
        <div class="ai-assistant-brand">
          <span class="ai-assistant-brand-icon"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="24"
              height="24"
            >
              <rect x="3" y="8" width="18" height="12" rx="2"></rect>
              <circle cx="8.5" cy="13" r="1.5"></circle>
              <circle cx="15.5" cy="13" r="1.5"></circle>
              <path d="M9 17h6"></path>
              <path d="M12 8V5"></path>
              <path d="M8 5h8"></path></svg
          ></span>
          <span class="ai-assistant-brand-text">المساعد الذكي</span>
        </div>
        <button type="button" class="ai-assistant-new-chat" @click="startNewChat">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>دردشة جديدة</span>
        </button>
        <div class="ai-assistant-search-wrap">
          <svg
            class="ai-assistant-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="historySearch"
            type="text"
            class="ai-assistant-search"
            placeholder="البحث في الدردشات"
          />
        </div>
      </div>

      <!-- فلاتر الأقسام (مخفية مؤقتاً) -->
      <div v-if="false && sections.length > 0" class="ai-assistant-sections">
        <button
          type="button"
          :class="['ai-assistant-section-pill', { active: !selectedSection }]"
          @click="selectedSection = null"
        >
          الكل
        </button>
        <button
          v-for="sec in sections"
          :key="sec.key"
          type="button"
          :class="['ai-assistant-section-pill', { active: selectedSection === sec.key }]"
          @click="selectedSection = sec.key"
        >
          {{ sec.label || sec.key }}
        </button>
      </div>

      <!-- قائمة المحادثات السابقة -->
      <div class="ai-assistant-history-section">
        <h3 class="ai-assistant-history-heading">الأحدث</h3>
        <div v-if="loadingHistory" class="ai-assistant-history-empty">جاري التحميل...</div>
        <div v-else class="ai-assistant-history-list">
          <div
            v-for="item in filteredHistory"
            :key="item.session_id || item.id"
            :class="[
              'ai-assistant-history-item',
              { active: activeSessionId === (item.session_id || item.id) },
            ]"
          >
            <button
              type="button"
              class="ai-assistant-history-btn"
              @click="selectConversation(item)"
            >
              <span class="ai-assistant-history-title">{{ item.title || 'محادثة' }}</span>
            </button>
            <button
              type="button"
              class="ai-assistant-history-delete"
              title="حذف المحادثة"
              @click.stop="deleteConversation(item)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
              </svg>
            </button>
          </div>
          <div v-if="filteredHistory.length === 0" class="ai-assistant-history-empty">
            {{ historySearch ? 'لا توجد نتائج' : 'لا توجد محادثات سابقة' }}
          </div>
        </div>
      </div>
    </aside>

    <!-- المحتوى الرئيسي -->
    <main class="ai-assistant-main">
      <ChatbotPanel
        :key="sessionKey"
        :current-route="route"
        :show-close-button="false"
        :standalone="true"
        :initial-session-id="activeSessionId"
        :section="selectedSection"
        input-placeholder="اسأل عن أي شيء"
        @first-message="onFirstMessage"
        @session-update="onSessionUpdate"
      />
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ChatbotPanel from '../components/ChatbotPanel.vue';
import aiService from '../services/aiService';
import logger from '../utils/logger';

export default {
  name: 'AiAssistantView',
  components: { ChatbotPanel },
  setup() {
    const route = useRoute();
    const sessionKey = ref(0);
    const historyItems = ref([]);
    const loadingHistory = ref(false);
    const activeSessionId = ref(null);
    const historySearch = ref('');
    const sections = ref([]);
    const selectedSection = ref(null);

    /** تصفية المحادثات حسب نص البحث */
    const filteredHistory = computed(() => {
      let items = historyItems.value;
      const q = historySearch.value?.trim().toLowerCase();
      if (q) {
        items = items.filter(item => (item.title || '').toLowerCase().includes(q));
      }
      return items;
    });

    /** تحميل قائمة المحادثات من الخادم */
    async function loadConversations() {
      loadingHistory.value = true;
      try {
        const result = await aiService.getConversations(50, selectedSection.value);
        logger.debug('[تشخيص] المحادثات السابقة:', result);
        historyItems.value = result?.items || [];
      } catch (err) {
        logger.error('فشل تحميل المحادثات:', err);
      } finally {
        loadingHistory.value = false;
      }
    }

    /** تحميل الأقسام المتاحة */
    async function loadSections() {
      try {
        const data = await aiService.getAvailableSections();
        sections.value = Array.isArray(data) ? data : [];
      } catch (err) {
        logger.error('فشل تحميل أقسام المساعد الذكي:', err);
      }
    }

    /** بدء دردشة جديدة */
    function startNewChat() {
      activeSessionId.value = null;
      sessionKey.value += 1;
    }

    function selectConversation(item) {
      const sid = item.session_id || item.id;
      if (activeSessionId.value !== sid) {
        activeSessionId.value = sid;
        sessionKey.value += 1;
      }
    }

    /** حذف محادثة */
    async function deleteConversation(item) {
      const sid = item.session_id || item.id;
      try {
        await aiService.deleteConversation(sid);
        historyItems.value = historyItems.value.filter(h => (h.session_id || h.id) !== sid);
        if (activeSessionId.value === sid) {
          startNewChat();
        }
      } catch (err) {
        logger.error('فشل حذف المحادثة:', err);
      }
    }

    /** عند إرسال أول رسالة يتم تحديث قائمة المحادثات */
    function onFirstMessage() {
      loadConversations();
    }

    /** تحديث معرّف الجلسة عند تغييره من لوحة الدردشة */
    function onSessionUpdate(newSessionId) {
      activeSessionId.value = newSessionId;
    }

    onMounted(() => {
      loadConversations();
      loadSections();
    });

    return {
      route,
      sessionKey,
      historyItems,
      filteredHistory,
      loadingHistory,
      activeSessionId,
      historySearch,
      sections,
      selectedSection,
      startNewChat,
      selectConversation,
      deleteConversation,
      onFirstMessage,
      onSessionUpdate,
    };
  },
};
</script>

<style scoped>
.ai-assistant-view {
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
  min-height: calc(100vh - 140px);
  direction: ltr;
  background: #f7f7f8;
}

.ai-assistant-sidebar {
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  background: #f0f0f2;
  border-right: 1px solid #e5e5e7;
  flex-shrink: 0;
  direction: rtl;
}

.ai-assistant-sidebar-head {
  padding: 16px 12px;
  border-bottom: 1px solid #e5e5e7;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-assistant-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}
.ai-assistant-brand-icon {
  font-size: 24px;
  line-height: 1;
}
.ai-assistant-brand-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-navy);
}

.ai-assistant-new-chat {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  text-align: right;
}
.ai-assistant-new-chat:hover {
  background: #f9fafb;
  border-color: var(--color-gold);
}
.ai-assistant-new-chat svg {
  flex-shrink: 0;
  opacity: 0.8;
}

.ai-assistant-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.ai-assistant-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.ai-assistant-search {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  outline: none;
  transition: border-color 0.15s;
}
.ai-assistant-search::placeholder {
  color: #9ca3af;
}
.ai-assistant-search:focus {
  border-color: var(--color-gold);
}

/* حبوب الأقسام */
.ai-assistant-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e5e7;
  direction: rtl;
}
.ai-assistant-section-pill {
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.ai-assistant-section-pill:hover {
  border-color: var(--color-gold);
  color: var(--color-gold-dark);
}
.ai-assistant-section-pill.active {
  background: var(--color-navy);
  color: #fff;
  border-color: var(--color-navy);
}

.ai-assistant-history-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.ai-assistant-history-heading {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  padding: 12px 14px 6px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ai-assistant-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px 16px;
}

.ai-assistant-history-item {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 0 2px 0;
  border-radius: 8px;
  transition: background 0.15s;
  overflow: hidden;
}
.ai-assistant-history-item:hover {
  background: #e5e7eb;
}
.ai-assistant-history-item.active {
  background: #e5e7eb;
}
.ai-assistant-history-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  text-align: right;
  overflow: hidden;
}
.ai-assistant-history-title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ai-assistant-history-delete {
  flex-shrink: 0;
  padding: 6px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}
.ai-assistant-history-item:hover .ai-assistant-history-delete {
  opacity: 1;
}
.ai-assistant-history-delete:hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.ai-assistant-history-empty {
  padding: 20px 14px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.ai-assistant-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  direction: rtl;
  background: #fff;
}
.ai-assistant-main :deep(.chatbot-panel) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 0;
  box-shadow: none;
  background: #fff;
}
.ai-assistant-main :deep(.chatbot-panel-header) {
  padding: 14px 24px;
  border-bottom: 1px solid #f0f0f2;
  background: #fff;
}
.ai-assistant-main :deep(.chatbot-messages) {
  padding: 24px;
  background: #fff;
}
.ai-assistant-main :deep(.chatbot-input-wrap) {
  padding: 20px 24px 28px;
  background: #fff;
  border-top: none;
}
.ai-assistant-main :deep(.chatbot-input-wrap textarea) {
  min-height: 52px;
  padding: 14px 20px;
  border-radius: 24px;
  border: 1px solid #e5e5e7;
  font-size: 15px;
  background: #f7f7f8;
}
.ai-assistant-main :deep(.chatbot-input-wrap textarea::placeholder) {
  color: #9ca3af;
}
.ai-assistant-main :deep(.chatbot-input-wrap textarea:focus) {
  border-color: var(--color-gold);
  background: #fff;
  box-shadow: 0 0 0 2px rgba(177, 162, 143, 0.15);
}
.ai-assistant-main :deep(.chatbot-send-btn) {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
}

/* ── Responsive: Tablet Landscape ── */
@media (max-width: 992px) {
  .ai-assistant-sidebar {
    width: 240px;
    min-width: 240px;
  }
}

/* ── Responsive: Tablet Portrait ── */
@media (max-width: 768px) {
  .ai-assistant-view {
    flex-direction: column;
  }
  .ai-assistant-sidebar {
    width: 100%;
    min-width: unset;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e5e5e7;
    flex-shrink: 0;
  }
  .ai-assistant-history-section {
    display: none;
  }
  .ai-assistant-main {
    flex: 1;
    min-height: 0;
  }
  .ai-assistant-main :deep(.chatbot-messages) {
    padding: 16px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap) {
    padding: 14px 16px 20px;
  }
  .ai-assistant-main :deep(.chatbot-panel-header) {
    padding: 12px 16px;
  }
}

/* ── Responsive: Mobile ── */
@media (max-width: 576px) {
  .ai-assistant-view {
    min-height: calc(100vh - 80px);
  }
  .ai-assistant-sidebar {
    max-height: 140px;
  }
  .ai-assistant-sidebar-head {
    padding: 12px 10px;
    gap: 8px;
  }
  .ai-assistant-brand-text {
    font-size: 14px;
  }
  .ai-assistant-new-chat {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 44px;
  }
  .ai-assistant-search {
    padding: 8px 12px 8px 32px;
    font-size: 12px;
    min-height: 44px;
  }
  .ai-assistant-main :deep(.chatbot-messages) {
    padding: 12px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap) {
    padding: 10px 12px 16px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap textarea) {
    min-height: 44px;
    padding: 10px 16px;
    font-size: 14px;
  }
  .ai-assistant-main :deep(.chatbot-send-btn) {
    width: 44px;
    height: 44px;
    min-width: 44px;
  }
  .ai-assistant-section-pill {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .ai-assistant-history-btn {
    min-height: 44px;
  }
  .ai-assistant-history-delete {
    min-width: 44px;
    min-height: 44px;
  }
}

/* ── Responsive: Extra Small Mobile ── */
@media (max-width: 320px) {
  .ai-assistant-sidebar {
    max-height: 120px;
  }
  .ai-assistant-sidebar-head {
    padding: 8px;
    gap: 6px;
  }
  .ai-assistant-brand-text {
    font-size: 13px;
  }
  .ai-assistant-new-chat {
    padding: 6px 10px;
    font-size: 12px;
  }
  .ai-assistant-search {
    font-size: 11px;
  }
  .ai-assistant-main :deep(.chatbot-messages) {
    padding: 8px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap) {
    padding: 8px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap textarea) {
    font-size: 13px;
    padding: 8px 12px;
  }
}

/* ── Responsive: Large Desktop ── */
@media (min-width: 1200px) {
  .ai-assistant-sidebar {
    width: 300px;
    min-width: 300px;
  }
}

/* ── Responsive: Full HD ── */
@media (min-width: 1920px) {
  .ai-assistant-sidebar {
    width: 340px;
    min-width: 340px;
  }
  .ai-assistant-brand-text {
    font-size: 17px;
  }
  .ai-assistant-new-chat {
    font-size: 15px;
    padding: 12px 16px;
  }
  .ai-assistant-main :deep(.chatbot-messages) {
    padding: 28px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap textarea) {
    font-size: 16px;
  }
}

/* ── Responsive: QHD ── */
@media (min-width: 2560px) {
  .ai-assistant-sidebar {
    width: 380px;
    min-width: 380px;
  }
  .ai-assistant-brand-text {
    font-size: 18px;
  }
  .ai-assistant-history-btn {
    font-size: 15px;
  }
  .ai-assistant-main :deep(.chatbot-messages) {
    padding: 32px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap textarea) {
    font-size: 17px;
    min-height: 56px;
  }
}

/* ── Responsive: 4K ── */
@media (min-width: 3840px) {
  .ai-assistant-sidebar {
    width: 440px;
    min-width: 440px;
  }
  .ai-assistant-brand-text {
    font-size: 22px;
  }
  .ai-assistant-new-chat {
    font-size: 18px;
    padding: 14px 20px;
  }
  .ai-assistant-search {
    font-size: 16px;
    padding: 14px 18px 14px 42px;
  }
  .ai-assistant-history-btn {
    font-size: 17px;
    padding: 14px 16px;
  }
  .ai-assistant-main :deep(.chatbot-messages) {
    padding: 40px;
  }
  .ai-assistant-main :deep(.chatbot-input-wrap textarea) {
    font-size: 20px;
    min-height: 64px;
  }
  .ai-assistant-main :deep(.chatbot-send-btn) {
    width: 56px;
    height: 56px;
    min-width: 56px;
  }
}
</style>

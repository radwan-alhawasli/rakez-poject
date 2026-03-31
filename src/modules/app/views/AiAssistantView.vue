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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ChatbotPanel from '@/components/ChatbotPanel.vue';
import aiService from '@/services/aiService';
import logger from '@/utils/logger';

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
</script>

<style scoped src="./styles/AiAssistantView.scoped.s1.css"></style>
<style scoped src="./styles/AiAssistantView.scoped.s2.css"></style>

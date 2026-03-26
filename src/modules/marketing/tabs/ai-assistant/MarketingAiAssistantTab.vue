<template>
  <div class="marketing-ai-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">المساعد الذكي (AI Assistant)</h1>
        <p class="welcome-subtitle">
          اسأل المساعد الذكي عن المشاريع، التقارير أو البيانات التسويقية.
        </p>
      </div>
    </div>

    <div class="ai-chat-container">
      <div class="ai-sidebar">
        <div class="sidebar-header-ai">
          <h3>المحادثات السابقة</h3>
          <button @click="startNewChat" class="btn-new-chat">+ محادثة جديدة</button>
        </div>
        <div class="conversations-list-ai custom-scrollbar">
          <div v-if="isLoadingConversations" class="loading-ai">جاري التحميل...</div>
          <div v-else-if="conversations.length === 0" class="empty-ai">
            لا يوجد محادثات سابقة
          </div>
          <div
            v-for="chat in conversations"
            :key="getConversationId(chat)"
            class="conversation-item-ai"
            :class="{ active: currentSessionId === getConversationId(chat) }"
            @click="loadChatSession(getConversationId(chat))"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 14px; height: 14px"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span style="flex: 1">{{ chat.title || chat.name || 'محادثة' }}</span>
            <button
              class="btn-icon"
              @click.stop="deleteChat(getConversationId(chat))"
              title="حذف المحادثة"
              style="width: 28px; height: 28px"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div class="ai-main-chat">
        <div class="chat-messages custom-scrollbar" ref="chatScrollRef">
          <div v-if="chatMessages.length === 0" class="ai-welcome-box">
            <div class="ai-avatar-large">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="48"
                height="48"
              >
                <rect x="3" y="8" width="18" height="12" rx="2"></rect>
                <circle cx="8.5" cy="13" r="1.5"></circle>
                <circle cx="15.5" cy="13" r="1.5"></circle>
                <path d="M9 17h6"></path>
                <path d="M12 8V5"></path>
                <path d="M8 5h8"></path>
              </svg>
            </div>
            <h3>كيف يمكنني مساعدتك اليوم؟</h3>
            <p>
              يمكنك سؤالي عن ميزانيات المشاريع، عدد العملاء المحتملين، أو أي بيانات أخرى موجودة
              في النظام.
            </p>
            <div class="quick-prompts">
              <button
                v-for="(s, i) in currentAiSection?.suggestions || []"
                :key="i"
                @click="sendPrompt(s)"
              >
                {{ s }}
              </button>
              <template v-if="(currentAiSection?.suggestions || []).length === 0">
                <button @click="sendPrompt('ما هو إجمالي الميزانية التسويقية لجميع المشاريع؟')">
                  الميزانية الإجمالية
                </button>
                <button @click="sendPrompt('كم عدد العملاء المحتملين الجدد هذا الشهر؟')">
                  العملاء المحتملون
                </button>
                <button @click="sendPrompt('ما هي المشاريع الأكثر أداءً؟')">
                  الأداء التسويقي
                </button>
              </template>
            </div>
          </div>
          <div
            v-for="(msg, idx) in chatMessages"
            v-memo="[msg.role, msg.content, msg.streaming]"
            :key="idx"
            :class="['chat-bubble', msg.role, { streaming: msg.streaming }]"
          >
            <div class="bubble-content">
              <div class="bubble-sender">
                {{ msg.role === 'user' ? 'أنت' : 'المساعد الذكي' }}
              </div>
              <div class="bubble-text">
                <span>{{ msg.content }}</span>
                <span v-if="msg.streaming" class="streaming-cursor"></span>
              </div>
            </div>
          </div>
          <div v-if="isAiTyping && !isStreaming" class="chat-bubble assistant">
            <div class="bubble-content">
              <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
        <div class="chat-input-area">
          <div
            style="
              display: flex;
              gap: 12px;
              align-items: flex-end;
              margin-bottom: 12px;
              flex-wrap: wrap;
            "
          >
            <div style="min-width: 220px">
              <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 6px"
                >القسم</label
              >
              <select v-model="aiSelectedSectionKey" class="form-input" style="height: 44px">
                <option v-for="s in aiSections" :key="s.key" :value="s.key">
                  {{ s.label || s.key }}
                </option>
              </select>
            </div>
            <div
              v-for="key in currentAiSection?.allowed_context_params || []"
              :key="key"
              style="min-width: 220px"
            >
              <label
                style="display: block; font-size: 12px; color: #64748b; margin-bottom: 6px"
                >{{ key }}</label
              >
              <input
                v-model="aiContext[key]"
                type="text"
                class="form-input"
                style="height: 44px"
                :placeholder="key"
              />
            </div>
          </div>
          <div class="input-wrapper">
            <textarea
              v-model="aiQuery"
              placeholder="اكتب سؤالك هنا..."
              @keydown.enter.exact.prevent="sendAiMessage"
              rows="1"
            ></textarea>
            <button
              v-if="isStreaming"
              @click="stopStreaming"
              class="btn-stop-ai"
              title="إيقاف الاستجابة"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
              </svg>
            </button>
            <button
              v-else
              @click="sendAiMessage"
              :disabled="!aiQuery.trim() || isAiTyping"
              class="btn-send-ai"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMarketingAiAssistant } from '@/composables/marketing/useMarketingAiAssistant';

const {
  aiQuery,
  isAiTyping,
  isStreaming,
  chatMessages,
  conversations,
  isLoadingConversations,
  currentSessionId,
  chatScrollRef,
  aiSections,
  aiSelectedSectionKey,
  aiContext,
  currentAiSection,
  getConversationId,
  startNewChat,
  loadChatSession,
  sendAiMessage,
  sendPrompt,
  deleteChat,
  stopStreaming,
} = useMarketingAiAssistant();
</script>

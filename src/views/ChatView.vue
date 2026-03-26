<template>
  <div class="erp-chat">
    <header class="erp-chat-brand" aria-label="قسم المحادثات">
      <div class="erp-chat-brand-text">
        <h1>المحادثات الداخلية</h1>
        <p>Rakez ERP — تواصل فوري مع فريق العمل عبر واجهة موحّدة وآمنة</p>
      </div>
    </header>

    <div
      class="erp-chat-shell"
      :class="{
        'show-list': !activeConversation,
        'show-thread': !!activeConversation,
      }"
    >
      <!-- قائمة المحادثات -->
      <aside class="erp-chat-sidebar" aria-label="قائمة المحادثات">
        <div class="erp-chat-sidebar-head">
          <h2>
            المحادثات
            <span v-if="totalUnreadCount > 0" class="erp-chat-header-badge">{{ totalUnreadCount }}</span>
          </h2>
          <div class="erp-chat-status" :class="{ 'is-online': isPusherConnected }" :title="isPusherConnected ? 'اتصال مباشر نشط' : 'جاري الاتصال...'">
            {{ isPusherConnected ? 'متصل' : 'أوفلاين' }}
          </div>
        </div>
        <div class="erp-chat-search">
          <div class="erp-chat-search-inner">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              autocomplete="off"
              placeholder="بحث باسم الموظف..."
              aria-label="بحث في المحادثات"
            />
          </div>
          <button type="button" class="erp-chat-add-btn" aria-label="محادثة جديدة" @click="showNewChatModal = true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <div class="erp-chat-conv-list custom-scrollbar">
          <div v-if="isLoadingConversations" class="erp-chat-loading">
            <div class="erp-chat-spinner" role="status" aria-label="جاري التحميل" />
          </div>
          <div v-else-if="filteredConversations.length === 0" class="erp-chat-hint">لا توجد محادثات</div>
          <template v-else>
            <button
              v-for="conv in filteredConversations"
              :key="conv.id"
              type="button"
              class="erp-chat-conv-item"
              :class="{ 'is-active': activeConversation?.id === conv.id }"
              @click="openConversation(conv)"
            >
              <div class="erp-chat-avatar" :style="{ background: avatarColor(conv.other_user?.name) }">
                {{ avatarLetter(conv.other_user?.name) }}
              </div>
              <div class="erp-chat-conv-meta">
                <div class="erp-chat-conv-row">
                  <span class="erp-chat-conv-name">{{ conv.other_user?.name || 'مستخدم' }}</span>
                  <span class="erp-chat-conv-time">{{ relativeTime(conv.last_message_at) }}</span>
                </div>
                <div class="erp-chat-conv-row">
                  <span class="erp-chat-conv-preview">{{ conv._lastPreview || '—' }}</span>
                  <span v-if="conv.unread_count > 0" class="erp-chat-unread">{{ conv.unread_count }}</span>
                  <button type="button" class="erp-chat-delete-conv" title="إزالة من القائمة" @click.stop="removeConversation(conv.id)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </button>
          </template>
        </div>
      </aside>

      <!-- منطقة الرسائل -->
      <section class="erp-chat-main" aria-label="منطقة الرسائل">
        <template v-if="activeConversation">
          <div class="erp-chat-header">
            <button
              type="button"
              class="erp-chat-back-btn"
              aria-label="العودة لقائمة المحادثات"
              @click="activeConversation = null"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div class="erp-chat-avatar sm" :style="{ background: avatarColor(activeConversation.other_user?.name) }">
              {{ avatarLetter(activeConversation.other_user?.name) }}
            </div>
            <div class="erp-chat-peer-info">
              <span class="erp-chat-peer-name">{{ activeConversation.other_user?.name || 'مستخدم' }}</span>
              <span class="erp-chat-peer-sub">{{ activeConversation.other_user?.email || '' }}</span>
            </div>
          </div>

          <div ref="messagesArea" class="erp-chat-messages custom-scrollbar">
            <div v-if="isLoadingMessages && messages.length === 0" class="erp-chat-loading">
              <div class="erp-chat-spinner" role="status" />
            </div>
            <div v-if="hasMoreMessages && messages.length > 0" class="erp-chat-load-more">
              <button type="button" :disabled="isLoadingMessages" @click="loadMoreMessages">تحميل الأقدم</button>
            </div>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="erp-chat-row"
              :class="Number(msg.sender_id) === Number(currentUserId) ? 'is-mine' : 'is-theirs'"
              @contextmenu.prevent="onMessageContext($event, msg)"
            >
              <div class="erp-chat-bubble">
                <p>{{ msg.message }}</p>
                <div class="erp-chat-bubble-meta">
                  <span class="erp-chat-bubble-time">{{ formatMsgTime(msg.created_at) }}</span>
                  <svg
                    v-if="msg.sender_id === currentUserId"
                    class="erp-chat-read-icon"
                    :class="{ 'is-read': msg.is_read }"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <template v-if="msg.is_read">
                      <!-- Double check for read -->
                      <path d="M7 12l5 5L22 7" />
                      <path d="M2 12l5 5L17 7" />
                    </template>
                    <template v-else>
                      <!-- Single check for sent -->
                      <polyline points="20 6 9 17 4 12" />
                    </template>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <Teleport to="body">
            <div
              v-if="contextMenu.visible"
              class="erp-chat-ctx"
              :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
              role="menu"
              @click="contextMenu.visible = false"
            >
              <button
                v-if="Number(contextMenu.msg?.sender_id) === Number(currentUserId)"
                type="button"
                class="danger"
                role="menuitem"
                @click="deleteMsg(contextMenu.msg)"
              >
                حذف الرسالة
              </button>
              <button type="button" role="menuitem" @click="copyMsg(contextMenu.msg)">نسخ</button>
            </div>
          </Teleport>

          <div class="erp-chat-composer">
            <div class="erp-chat-emoji-wrap">
              <button type="button" class="erp-chat-emoji-btn" aria-label="إدراج رمز تعبيري" @click="showEmoji = !showEmoji">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </button>

              <Teleport to="body">
                <div v-if="showEmoji" class="erp-chat-emoji-overlay" @click="showEmoji = false" />
              </Teleport>

              <Transition name="erp-emoji">
                <div v-if="showEmoji" class="erp-chat-emoji-panel">
                  <span
                    v-for="e in emojiList"
                    :key="e"
                    class="erp-chat-emoji-item"
                    role="button"
                    tabindex="0"
                    @click="insertEmoji(e)"
                    >{{ e }}</span
                  >
                </div>
              </Transition>
            </div>
            <input
              ref="composerInput"
              v-model="newMessage"
              class="erp-chat-input"
              type="text"
              maxlength="5000"
              placeholder="اكتب رسالة..."
              autocomplete="off"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button
              type="button"
              class="erp-chat-send"
              :disabled="!newMessage.trim() || isSending"
              aria-label="إرسال"
              @click="sendMessage"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </template>

        <div v-else class="erp-chat-empty-main">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
        </div>
      </section>
    </div>

    <!-- محادثة جديدة -->
    <div v-if="showNewChatModal" class="erp-chat-modal-overlay" role="dialog" aria-modal="true" @click.self="closeNewChatModal">
      <div class="erp-chat-modal">
        <div class="erp-chat-modal-head">
          <h3>بدء محادثة</h3>
          <button type="button" class="erp-chat-modal-close" aria-label="إغلاق" @click="closeNewChatModal">&times;</button>
        </div>
        <div class="erp-chat-modal-body">
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="ابحث عن موظف بالاسم..."
            @input="searchUsers"
          />
          <div class="erp-chat-user-list custom-scrollbar">
            <div v-if="isSearchingUsers" class="erp-chat-loading">
              <div class="erp-chat-spinner sm" />
            </div>
            <template v-else>
              <button
                v-for="u in searchedUsers"
                :key="u.id"
                type="button"
                class="erp-chat-user-row"
                @click="startConversation(u.id)"
              >
                <div class="erp-chat-avatar sm" :style="{ background: avatarColor(u.name) }">{{ avatarLetter(u.name) }}</div>
                <div class="erp-chat-peer-info">
                  <span class="erp-chat-user-name">{{ u.name }}</span>
                  <span class="erp-chat-user-email">{{ u.email || '' }}</span>
                </div>
              </button>
              <div v-if="searchedUsers.length === 0" class="erp-chat-hint">
                لم يتم العثور على موظفين
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="!activeConversation"
      type="button"
      class="erp-chat-fab"
      title="محادثة جديدة"
      aria-label="محادثة جديدة"
      @click="showNewChatModal = true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useErpChat } from '@/composables/chat/useErpChat';
import './styles/chat-view.css';

defineOptions({ name: 'ChatView' });

const {
  activeConversation,
  messages,
  newMessage,
  searchQuery,
  isLoadingConversations,
  isLoadingMessages,
  isSending,
  showNewChatModal,
  userSearchQuery,
  searchedUsers,
  isSearchingUsers,
  showEmoji,
  emojiList,
  messagesArea,
  composerInput,
  hasMoreMessages,
  contextMenu,
  filteredConversations,
  currentUserId,
  avatarLetter,
  avatarColor,
  relativeTime,
  formatMsgTime,
  openConversation,
  loadMoreMessages,
  sendMessage,
  deleteMsg,
  copyMsg,
  onMessageContext,
  insertEmoji,
  searchUsers,
  startConversation,
  closeNewChatModal,
  removeConversation,
  isPusherConnected,
} = useErpChat();
</script>

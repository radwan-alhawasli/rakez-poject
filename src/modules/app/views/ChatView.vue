<template>
  <div class="chat-v2" dir="rtl">
    <header class="chat-v2__header" aria-label="قسم الدردشة">
      <div>
        <h1 class="chat-v2__title">الدردشة</h1>
        <p class="chat-v2__subtitle">تواصل داخلي سريع وآمن داخل النظام</p>
      </div>
      <div class="chat-v2__status" :class="{ 'is-online': isPusherConnected }">
        {{ isPusherConnected ? 'متصل' : 'غير متصل' }}
      </div>
    </header>

    <div class="chat-v2__shell">
      <!-- Right pane (RTL): conversations -->
      <aside class="chat-v2__pane" aria-label="قائمة المحادثات">
        <div class="chat-v2__convHead">
          <div class="chat-v2__convHeadTop">
            <h2 class="chat-v2__convHeadTitle">
              المحادثات
              <span v-if="totalUnreadCount > 0" class="chat-v2__badge">{{ totalUnreadCount }}</span>
            </h2>
            <button class="chat-v2__iconBtn" type="button" title="بدء محادثة" @click="showNewChatModal = true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div class="chat-v2__search">
            <div class="chat-v2__searchBox">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input v-model="searchQuery" type="text" placeholder="ابحث في المحادثات..." autocomplete="off" />
            </div>
          </div>
        </div>

        <div class="chat-v2__list custom-scrollbar">
          <div v-if="isLoadingConversations" class="chat-v2__empty">
            <span class="chat-v2__spinner"></span>
            <div style="margin-top: 8px">جاري تحميل المحادثات...</div>
          </div>
          <div v-else-if="filteredConversations.length === 0" class="chat-v2__empty">لا توجد محادثات</div>
          <template v-else>
            <button
              v-for="conv in filteredConversations"
              :key="conv.id"
              type="button"
              class="chat-v2__convItem"
              :class="{ 'is-active': String(activeConversation?.id) === String(conv.id) }"
              @click="openConversation(conv)"
            >
              <div class="chat-v2__avatar" :style="{ background: avatarColor(conv.other_user?.name) }">
                {{ avatarLetter(conv.other_user?.name) }}
              </div>
              <div class="chat-v2__convMeta">
                <div class="chat-v2__convRowTop">
                  <span class="chat-v2__name">{{ conv.other_user?.name || 'مستخدم' }}</span>
                  <span class="chat-v2__time">{{ relativeTime(conv.last_message_at) }}</span>
                </div>
                <div class="chat-v2__preview">{{ conv._lastPreview || '—' }}</div>
              </div>
              <span v-if="conv.unread_count > 0" class="chat-v2__unread">{{ conv.unread_count }}</span>
            </button>
          </template>
        </div>
      </aside>

      <!-- Left pane: thread -->
      <section class="chat-v2__pane" aria-label="نافذة المحادثة">
        <template v-if="activeConversation">
          <div class="chat-v2__threadHead">
            <div class="chat-v2__peer">
              <div class="chat-v2__avatar" :style="{ background: avatarColor(activeConversation.other_user?.name) }">
                {{ avatarLetter(activeConversation.other_user?.name) }}
              </div>
              <div class="chat-v2__peerMeta">
                <div class="chat-v2__peerName">{{ activeConversation.other_user?.name || 'مستخدم' }}</div>
                <div class="chat-v2__peerSub">{{ activeConversation.other_user?.email || '' }}</div>
              </div>
            </div>
            <button class="chat-v2__iconBtn" type="button" title="إغلاق المحادثة" @click="activeConversation = null">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div ref="messagesArea" class="chat-v2__threadBody custom-scrollbar">
            <div v-if="isLoadingMessages && messages.length === 0" class="chat-v2__empty">
              <span class="chat-v2__spinner"></span>
              <div style="margin-top: 8px">جاري تحميل الرسائل...</div>
            </div>
            <div v-else-if="messages.length === 0" class="chat-v2__empty">لا توجد رسائل</div>

            <div v-else class="chat-v2__msgList">
              <div v-if="hasMoreMessages" style="text-align:center; margin-bottom: 10px;">
                <button class="chat-v2__iconBtn" type="button" :disabled="isLoadingMessages" @click="loadMoreMessages" title="تحميل الأقدم">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 15 12 9 18 15" />
                  </svg>
                </button>
              </div>

              <div
                v-for="msg in messages"
                :key="msg.id"
                class="chat-v2__msgRow"
                :class="isMine(msg) ? 'is-mine' : 'is-theirs'"
              >
                <div class="chat-v2__bubble">
                  <p v-if="msg.message" class="chat-v2__text">{{ msg.message }}</p>
                  <div class="chat-v2__meta">
                    <span>{{ formatMsgTime(msg.created_at) }}</span>
                    <span v-if="isMine(msg)">{{ msg.is_read ? '✓✓' : '✓' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-v2__composer">
            <textarea
              ref="composerInput"
              v-model="newMessage"
              class="chat-v2__input"
              rows="1"
              placeholder="اكتب رسالة..."
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button class="chat-v2__sendBtn" type="button" :disabled="(!newMessage.trim() && !selectedFile) || isSending" @click="sendMessage">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </template>

        <div v-else class="chat-v2__hintMain">اختر محادثة لبدء الدردشة</div>
      </section>
    </div>

    <!-- Start conversation (keeps existing modal classes for consistency) -->
    <div v-if="showNewChatModal" class="erp-chat-modal-overlay" role="dialog" aria-modal="true" @click.self="closeNewChatModal">
      <div class="erp-chat-modal">
        <div class="erp-chat-modal-head">
          <h3>بدء محادثة</h3>
          <button type="button" class="erp-chat-modal-close" aria-label="إغلاق" @click="closeNewChatModal">&times;</button>
        </div>
        <div class="erp-chat-modal-body">
          <input v-model="userSearchQuery" type="text" placeholder="ابحث عن موظف بالاسم..." />
          <div class="erp-chat-user-list custom-scrollbar">
            <div v-if="isSearchingUsers" class="erp-chat-loading">
              <div class="erp-chat-spinner sm" />
            </div>
            <template v-else>
              <button v-for="u in searchedUsers" :key="u.id" type="button" class="erp-chat-user-row" @click="startConversation(u.id)">
                <div class="erp-chat-avatar sm" :style="{ background: avatarColor(u.name) }">{{ avatarLetter(u.name) }}</div>
                <div class="erp-chat-peer-info">
                  <span class="erp-chat-user-name">{{ u.name }}</span>
                  <span class="erp-chat-user-email">{{ u.email || '' }}</span>
                </div>
              </button>
              <div v-if="searchedUsers.length === 0" class="erp-chat-hint">لم يتم العثور على موظفين</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useErpChat } from '@/composables/chat/useErpChat';
import './styles/chat-view.v2.css';

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
  messagesArea,
  composerInput,
  hasMoreMessages,
  filteredConversations,
  totalUnreadCount,
  currentUserId,
  avatarLetter,
  avatarColor,
  relativeTime,
  formatMsgTime,
  openConversation,
  loadMoreMessages,
  sendMessage,
  startConversation,
  closeNewChatModal,
  isPusherConnected,
  selectedFile,
} = useErpChat();

function isMine(msg) {
  if (msg && msg._mine === true) return true;
  return Number(msg?.sender_id) === Number(currentUserId);
}
</script>

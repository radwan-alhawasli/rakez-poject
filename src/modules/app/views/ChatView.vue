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
                  <div v-if="msg.attachment" class="chat-v2__attachment">
                    <template v-if="isImageAttachment(msg)">
                      <a class="chat-v2__imgLink" :href="attachmentUrl(msg)" target="_blank" rel="noopener">
                        <img class="chat-v2__img" :src="attachmentUrl(msg)" :alt="msg.file_name || 'مرفق'" loading="lazy" />
                      </a>
                    </template>
                    <template v-else-if="isAudioAttachment(msg)">
                      <audio class="chat-v2__audio" :src="attachmentUrl(msg)" controls preload="metadata"></audio>
                    </template>
                    <template v-else>
                      <a class="chat-v2__fileCard" :href="attachmentUrl(msg)" target="_blank" rel="noopener">
                        <div class="chat-v2__fileIcon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                        </div>
                        <div class="chat-v2__fileMeta">
                          <div class="chat-v2__fileName">{{ msg.file_name || 'مرفق' }}</div>
                          <div v-if="msg.file_size" class="chat-v2__fileSize">{{ prettySize(msg.file_size) }}</div>
                        </div>
                        <div class="chat-v2__fileAction">فتح</div>
                      </a>
                    </template>
                  </div>
                  <div class="chat-v2__meta">
                    <span>{{ formatMsgTime(msg.created_at) }}</span>
                    <span v-if="isMine(msg)">{{ msg.is_read ? '✓✓' : '✓' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-v2__composer">
            <input
              ref="fileInput"
              class="chat-v2__fileInput"
              type="file"
              @change="onPickFile"
            />

            <div v-if="selectedFile" class="chat-v2__preview">
              <div class="chat-v2__previewMain">
                <template v-if="isSelectedAudio">
                  <div class="chat-v2__previewTitle">رسالة صوتية</div>
                  <audio class="chat-v2__audio" :src="selectedFileUrl" controls preload="metadata"></audio>
                </template>
                <template v-else-if="isSelectedImage">
                  <img class="chat-v2__previewImg" :src="selectedFileUrl" :alt="selectedFile.name" />
                  <div class="chat-v2__previewMeta">
                    <div class="chat-v2__previewName">{{ selectedFile.name }}</div>
                    <div class="chat-v2__previewSize">{{ prettySize(selectedFile.size) }}</div>
                  </div>
                </template>
                <template v-else>
                  <div class="chat-v2__fileIcon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div class="chat-v2__previewMeta">
                    <div class="chat-v2__previewName">{{ selectedFile.name }}</div>
                    <div class="chat-v2__previewSize">{{ prettySize(selectedFile.size) }}</div>
                  </div>
                </template>
              </div>
              <button type="button" class="chat-v2__previewRemove" aria-label="إزالة" @click="removeSelectedFile">×</button>
            </div>

            <button class="chat-v2__iconBtn chat-v2__composerBtn" type="button" title="إرفاق ملف" @click="openFilePicker" :disabled="isSending || isRecording">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-8.49 8.49a5 5 0 0 1-7.07-7.07l8.49-8.49a3.5 3.5 0 0 1 4.95 4.95l-8.49 8.49a2 2 0 0 1-2.83-2.83l7.78-7.78"></path>
              </svg>
            </button>

            <button
              v-if="!isRecording"
              class="chat-v2__iconBtn chat-v2__composerBtn"
              type="button"
              title="تسجيل صوت"
              @click="startVoiceRecording"
              :disabled="isSending"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button
              v-else
              class="chat-v2__iconBtn chat-v2__composerBtn chat-v2__recStop"
              type="button"
              title="إيقاف التسجيل"
              @click="stopVoiceRecording"
            >
              <span class="chat-v2__recDot" aria-hidden="true"></span>
              <span class="chat-v2__recTime">{{ recordingTimeText }}</span>
            </button>

            <textarea
              ref="composerInput"
              v-model="newMessage"
              class="chat-v2__input"
              rows="1"
              placeholder="اكتب رسالة..."
              @keydown.enter.exact.prevent="sendMessage"
            />
            <button class="chat-v2__sendBtn" type="button" :disabled="(!newMessage.trim() && !selectedFile) || isSending || isRecording" @click="sendMessage">
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
import { computed, onBeforeUnmount, ref, watch } from 'vue';
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
  uploadFile,
  clearSelectedFile,
  isRecording,
  recordingDuration,
  startVoiceRecording,
  stopVoiceRecording,
} = useErpChat();

function isMine(msg) {
  if (msg && msg._mine === true) return true;
  return Number(msg?.sender_id) === Number(currentUserId);
}

const fileInput = ref(null);
const selectedFileUrl = ref('');

const isSelectedAudio = computed(() => String(selectedFile.value?.type || '').startsWith('audio/'));
const isSelectedImage = computed(() => String(selectedFile.value?.type || '').startsWith('image/'));

const recordingTimeText = computed(() => {
  const total = Number(recordingDuration?.value ?? recordingDuration ?? 0);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

function revokeSelectedUrl() {
  if (!selectedFileUrl.value) return;
  try {
    URL.revokeObjectURL(selectedFileUrl.value);
  } catch (_) {
    // ignore
  }
  selectedFileUrl.value = '';
}

watch(
  () => selectedFile.value,
  () => {
    revokeSelectedUrl();
    if (selectedFile.value) {
      selectedFileUrl.value = URL.createObjectURL(selectedFile.value);
    }
  },
  { deep: false }
);

onBeforeUnmount(() => {
  revokeSelectedUrl();
});

function openFilePicker() {
  if (!fileInput.value) return;
  fileInput.value.click();
}

function onPickFile(e) {
  const input = e?.target;
  const file = input?.files && input.files[0];
  if (!file) return;
  uploadFile(file);
  try {
    input.value = '';
  } catch (_) {
    // ignore
  }
}

function removeSelectedFile() {
  clearSelectedFile();
  revokeSelectedUrl();
}

function attachmentUrl(msg) {
  return msg?.attachment_url || msg?.attachment || '';
}

function isAudioAttachment(msg) {
  const mt = String(msg?.mime_type || '');
  if (mt.startsWith('audio/')) return true;
  const url = attachmentUrl(msg);
  return /\.(webm|ogg|mp3|wav|m4a|aac)(\?|#|$)/i.test(url);
}

function isImageAttachment(msg) {
  const mt = String(msg?.mime_type || '');
  if (mt.startsWith('image/')) return true;
  const url = attachmentUrl(msg);
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(url);
}

function prettySize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
</script>

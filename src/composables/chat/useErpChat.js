// @ts-check
/**
 * ERP دردشة داخلية — حالة ومنطق الواجهة (Rakez Chat API)
 * @module composables/chat/useErpChat
 */

import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import chatService, { normalizeMessage } from '@/services/chatService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { createPusher } from '@/plugins/pusher';
import logger from '@/utils/logger';
import { localeOpts } from '@/utils/intlLatn';
import { getApiErrorMessage } from '@/utils/errorHandler';


const EMOJI_LIST = [
  '\u{1F600}', '\u{1F602}', '\u{1F60D}', '\u{1F60A}', '\u{1F609}', '\u{1F614}', '\u{1F622}', '\u{1F621}',
  '\u{1F44D}', '\u{1F44E}', '\u{1F44B}', '\u{1F64F}', '\u{2764}', '\u{1F525}', '\u{1F389}', '\u{1F4AA}',
  '\u{2705}', '\u{274C}', '\u{1F4AC}', '\u{1F4E9}', '\u{1F4C8}', '\u{1F3E0}', '\u{2B50}', '\u{1F31F}',
];

export function useErpChat() {
  /** @type {import('vue').Ref<any[]>} */
  const conversations = ref([]);
  /** @type {import('vue').Ref<any>} */
  const activeConversation = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const messages = ref([]);
  const newMessage = ref('');
  const searchQuery = ref('');
  const isLoadingConversations = ref(false);
  const isLoadingMessages = ref(false);
  const isSending = ref(false);
  const showNewChatModal = ref(false);
  const userSearchQuery = ref('');
  /** @type {import('vue').Ref<any[]>} */
  const searchedUsers = ref([]);
  const isSearchingUsers = ref(false);
  const showEmoji = ref(false);
  /** @type {import('vue').Ref<any>} */
  const messagesArea = ref(null);
  /** @type {import('vue').Ref<any>} */
  const composerInput = ref(null);
  const currentPage = ref(1);
  const hasMoreMessages = ref(false);
  /** @type {import('vue').Ref<any>} */
  const contextMenu = ref({ visible: false, x: 0, y: 0, msg: null });
  const isRecording = ref(false);
  const recordingDuration = ref(0);
  /** @type {import('vue').Ref<any>} */
  const mediaRecorder = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const audioChunks = ref([]);
  /** @type {import('vue').Ref<any>} */
  const selectedFile = ref(null);

  /** @type {any} */
  let pusher = null;
  const isPusherConnected = ref(false);
  /** @type {any[]} */
  const pusherSubscriptions = [];

  /** @type {any} */
  let searchDebounce = null;
  /** @type {any} */
  let recordingTimer = null;
  /** @type {any} */
  let activePollTimer = null;

  const currentUserId = computed(() => {
    const user = /** @type {any} */ (authService.getCurrentUser());
    const raw =
      user?.id ??
      user?.user_id ??
      user?.userId ??
      user?.data?.id ??
      user?.user?.id ??
      null;
    const n = raw != null ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : undefined;
  });

  const ensureCurrentUserLoaded = async () => {
    if (currentUserId.value != null) return;
    try {
      await authService.fetchCurrentUser();
    } catch (_) {
      // ignore: apiClient handles 401 redirect; UI will still work without "mine/theirs" styling
    }
  };

  const emojiList = EMOJI_LIST;

  const filteredConversations = computed(() => {
    if (!searchQuery.value.trim()) return conversations.value;
    const q = searchQuery.value.toLowerCase();
    return conversations.value.filter(c =>
      (c.other_user?.name || '').toLowerCase().includes(q)
    );
  });

  const totalUnreadCount = computed(() => {
    return conversations.value.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  });

  /**
   * @param {string} name
   */
  const avatarLetter = name => (name || 'U').charAt(0).toUpperCase();
  /**
   * @param {string} name
   */
  const avatarColor = name => {
    const colors = ['#27374D', '#B5A99A', '#5B7B9A', '#6B8F71', '#8B6F5E', '#7B6B8F', '#6B8B9B', '#8F7B5B'];
    let hash = 0;
    for (const ch of (name || 'U')) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  /**
   * Sort messages by date and deduplicate by ID.
   * Ensures UI remains consistent regardless of arrival order.
   * @param {any[]} list
   * @returns {any[]}
   */
  const sortAndDedupeMessages = (list) => {

    if (!Array.isArray(list)) return [];
    
    // Sort by created_at (primary) and id (secondary for tie-breaking)
    const sorted = [...list].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      if (dateA !== dateB) return dateA - dateB;
      // Fallback to ID for messages with same timestamp
      return String(a.id).localeCompare(String(b.id));
    });

    // Deduplicate by ID
    const seen = new Set();
    return sorted.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  };

  /**
   * @param {any} dt
   */
  const relativeTime = dt => {
    if (!dt) return '';
    const diff = Date.now() - new Date(dt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} س`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} ي`;
    return new Date(dt).toLocaleDateString('ar-SA', localeOpts({ month: 'short', day: 'numeric' }));
  };

  /**
   * @param {any} dt
   */
  const formatMsgTime = dt => {
    if (!dt) return '';
    return new Date(dt).toLocaleTimeString('ar-SA', localeOpts({ hour: '2-digit', minute: '2-digit' }));
  };

  const scrollToBottom = () => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  };

  /** @param {any[]} incoming */
  const mergeIncomingMessages = (incoming = []) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    messages.value = sortAndDedupeMessages([...messages.value, ...incoming]);
  };

  const loadConversations = async () => {
    isLoadingConversations.value = true;
    try {
      const data = await chatService.getConversations();
      conversations.value = Array.isArray(data) ? data : [];
      if (pusher) {
        conversations.value.forEach(c => subscribeToConversation(c.id));
      }
    } catch (e) {
      logger.error('loadConversations', e);
      notificationService.addNotification(getApiErrorMessage(e, 'تعذر تحميل المحادثات'), 'error');
      conversations.value = [];
    } finally {
      isLoadingConversations.value = false;
    }
  };

  /**
   * @param {string|number} convId
   */
  const subscribeToConversation = convId => {

    if (!pusher || !convId) return;

    // Backend docs: Channel `conversation.{conversationId}`, Event `message.sent`.
    // Subscribe to the documented channel first and keep a single fallback to the common private prefix.
    const primaryChannel = `conversation.${convId}`;
    const fallbackChannel = `private-conversation.${convId}`;

    const ensureSubscribed = channelName => {
      if (pusherSubscriptions.some(s => s.channelName === channelName)) return null;
      try {
        logger.debug(`[Chat Real-time] Subscribing to: ${channelName}`);
        const ch = pusher.subscribe(channelName);
        pusherSubscriptions.push({ convId, channelName, ch });

        ch.bind('pusher:subscription_succeeded', () => {
          logger.debug(`[Chat Real-time] Subscription SUCCESS: ${channelName}`);
        });
        ch.bind('pusher:subscription_error', (/** @type {any} */ status) => {
          logger.warn(`[Chat Real-time] Subscription ERROR (${channelName}):`, status);
        });

        return ch;
      } catch (err) {
        logger.warn(`[Chat Real-time] Subscription FAILED: ${channelName}`, err);
        return null;
      }
    };

    const handleIncoming = (/** @type {any} */ data) => {
      const msgData = data && typeof data === 'object' && data.message ? data.message : data;
      const msg = normalizeMessage(msgData) || msgData;
      if (!msg || !msg.id) return;

      const senderId = Number(msg.sender_id ?? msg.senderId ?? 0);
      const mine = currentUserId.value != null && senderId === Number(currentUserId.value);

      if (Number(activeConversation.value?.id) === Number(convId)) {
        const exists = messages.value.find(m => String(m.id) === String(msg.id));
        if (!exists) {
          messages.value = sortAndDedupeMessages([...messages.value, msg]);
          nextTick(scrollToBottom);
        }
        if (!mine) {
          chatService.markAsRead(convId).catch(() => {});
        }
      }

      const c = conversations.value.find(x => String(x.id) === String(convId));
      if (c) {
        const previewText =
          msg.message ||
          (msg.attachment
            ? (String(msg.mime_type || '').startsWith('audio/') ? 'رسالة صوتية' : 'مرفق')
            : '');
        c._lastPreview = previewText;
        c.last_message_at = msg.created_at || new Date().toISOString();
        if (!isActive(convId) && !mine) {
          c.unread_count = (c.unread_count || 0) + 1;
        }
      }
    };

    const ch1 = ensureSubscribed(primaryChannel);
    if (ch1) {
      ch1.bind('message.sent', handleIncoming);
      // Compatibility: some Laravel setups broadcast with a class name.
      ch1.bind('MessageSent', handleIncoming);
      return;
    }

    const ch2 = ensureSubscribed(fallbackChannel);
    if (ch2) {
      ch2.bind('message.sent', handleIncoming);
      ch2.bind('MessageSent', handleIncoming);
    }
  };

  const initPusher = () => {
    const token = authService.getToken();
    if (!token) return;
    pusher = createPusher(token);
    if (!pusher) return;
    
    pusher.connection.bind('state_change', (/** @type {any} */ states) => {
      isPusherConnected.value = states.current === 'connected';
      logger.debug(`[Chat Pusher] State changed: ${states.previous} -> ${states.current}`);
    });
    isPusherConnected.value = pusher.connection.state === 'connected';

    conversations.value.forEach(c => subscribeToConversation(c.id));

    // Global listener for new messages (even for conversations not yet in list)
    if (currentUserId.value) {
      const globalChannel = `private-user-notifications.${currentUserId.value}`;
      try {
        const globalCh = pusher.subscribe(globalChannel);
        globalCh.bind('message.sent', (/** @type {any} */ data) => {
          const msgData = data.message ? data.message : data;
          const convId = msgData.conversation_id;
          if (convId) {
            // If already subscribed or in list, conversational listeners handle it.
            // But we can use this to refresh list for brand new threads.
            const exists = conversations.value.find(c => c.id === convId);
            if (!exists) {
              loadConversations();
            }
          }
        });
      } catch (err) {
        logger.warn(`[Chat Real-time] Global notification channel FAILED`, err);
      }
    }
  };

  /**
   * @param {any} conv
   */
  const selectConversation = async conv => {
    if (!conv) return;
    activeConversation.value = conv;
    messages.value = [];
    currentPage.value = 1;
    hasMoreMessages.value = false;
    showEmoji.value = false;
    newMessage.value = '';

    await loadMessages(conv.id);
    
    // Clear unread in local state
    const c = conversations.value.find(x => x.id === conv.id);
    if (c) c.unread_count = 0;
    
    // Mark as read in backend
    chatService.markAsRead(conv.id).catch(() => {});
    
    nextTick(scrollToBottom);
    if (composerInput.value) composerInput.value.focus();
  };

  /**
   * @param {any} convId
   */
  const loadMessages = async convId => {
    if (!convId) return;
    isLoadingMessages.value = true;
    try {
      const result = await chatService.getMessages(convId, 1, 50);
      const list = Array.isArray(result?.messages) ? result.messages : [];
      messages.value = sortAndDedupeMessages(list);
      hasMoreMessages.value = !!(result?.meta?.has_more_pages);
      currentPage.value = 1;
    } catch (e) {
      logger.error('loadMessages', e);
      notificationService.addNotification(getApiErrorMessage(e, 'تعذر تحميل الرسائل'), 'error');
    } finally {
      isLoadingMessages.value = false;
    }
  };

  const pollActiveConversation = async () => {
    const convId = activeConversation.value?.id;
    if (!convId) return;
    if (isLoadingMessages.value) return;
    try {
      const result = await chatService.getMessages(convId, 1, 50);
      const list = Array.isArray(result?.messages) ? result.messages : [];
      mergeIncomingMessages(list);
    } catch (_) {
      // silent
    }
  };

  const loadMoreMessages = async () => {
    if (!activeConversation.value || !hasMoreMessages.value || isLoadingMessages.value) return;
    
    const convId = activeConversation.value.id;
    const nextPage = currentPage.value + 1;
    
    try {
      const result = await chatService.getMessages(convId, nextPage, 50);
      const list = Array.isArray(result?.messages) ? result.messages : [];
      
      if (list.length > 0) {
        messages.value = sortAndDedupeMessages([...list, ...messages.value]);
        currentPage.value = nextPage;
        hasMoreMessages.value = !!(result?.meta?.has_more_pages);
      } else {
        hasMoreMessages.value = false;
      }
    } catch (e) {
      logger.error('loadMoreMessages', e);
    }
  };

  const sendMessage = async () => {
    const text = newMessage.value.trim();
    const file = selectedFile.value;
    if (!activeConversation.value || (!text && !file) || isSending.value) return;

    const convId = activeConversation.value.id;
    isSending.value = true;

    // Ensure we can distinguish mine/theirs for optimistic message
    if (currentUserId.value == null) {
      await ensureCurrentUserLoaded();
    }
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    /** @type {string|null} */
    const localObjectUrl = file ? URL.createObjectURL(file) : null;
    const tempMsg = {
      id: tempId,
      conversation_id: convId,
      sender_id: currentUserId.value,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
      _mine: true,
      attachment_type: file ? (file.type.startsWith('image/') ? 'image' : (file.type.startsWith('audio/') ? 'audio' : 'file')) : null,
      _isUploading: !!file,
      attachment: localObjectUrl,
      attachment_url: localObjectUrl,
      mime_type: file ? file.type : null,
      file_name: file ? file.name : null,
      file_size: file ? file.size : null,
    };
    
    messages.value = sortAndDedupeMessages([...messages.value, tempMsg]);
    newMessage.value = '';
    selectedFile.value = null;
    nextTick(scrollToBottom);

    try {
      /** @type {any} */
      let realMsg;
      if (file) {
        const formData = new FormData();
        formData.append('message', text);
        // TODO: Confirm backend multipart field name for chat attachments (attachment vs file vs media).
        // Keeping `attachment` because it was the existing convention in this frontend.
        formData.append('attachment', file);
        realMsg = await chatService.sendAttachment(convId, formData);
      } else {
        realMsg = await chatService.sendMessage(convId, text);
      }
      if (!realMsg || !realMsg.id) {
        throw new Error('Invalid message response');
      }
      
      // Replace optimistic message with real one (keep mine flag for UI if needed)
      messages.value = messages.value.map(m => (m.id === tempId ? { ...realMsg, _mine: true } : m));
      
      // Update sidebar preview
      const c = conversations.value.find(x => x.id === convId);
      if (c) {
        c._lastPreview = text || (file ? 'مرفق' : '');
        c.last_message_at = realMsg.created_at || new Date().toISOString();
      }
    } catch (e) {
      logger.error('sendMessage', e);
      notificationService.addNotification(getApiErrorMessage(e, 'فشل إرسال الرسالة'), 'error');
      // Mark optimistic message as failed or remove it
      messages.value = messages.value.filter(m => m.id !== tempId);
    } finally {
      if (localObjectUrl) {
        try {
          URL.revokeObjectURL(localObjectUrl);
        } catch (_) {
          // ignore
        }
      }
      isSending.value = false;
    }
  };

  /** @param {any} file */
  const handleFileUpload = (file) => {
    if (!file) return;
    selectedFile.value = file;
    if (composerInput.value) composerInput.value.focus();
  };

  const startRecording = async () => {
    try {
      if (typeof MediaRecorder === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        notificationService.addNotification('تسجيل الصوت غير مدعوم في هذا المتصفح', 'warning');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      /** Pick a supported mimeType when possible (Safari varies). */
      let mimeType = '';
      try {
        const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
        for (const mt of preferred) {
          if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(mt)) {
            mimeType = mt;
            break;
          }
        }
      } catch (_) {
        // ignore
      }

      mediaRecorder.value = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunks.value = [];

      mediaRecorder.value.ondataavailable = (/** @type {any} */ e) => {
        if (e.data.size > 0) audioChunks.value.push(e.data);
      };

      mediaRecorder.value.onstop = async () => {
        const type = mimeType || mediaRecorder.value?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks.value, { type });
        const ext = type.includes('mp4') ? 'mp4' : (type.includes('ogg') ? 'ogg' : 'webm');
        const file = new File([audioBlob], `voice-${Date.now()}.${ext}`, { type });
        await handleFileUpload(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.value.start();
      isRecording.value = true;
      recordingDuration.value = 0;
      recordingTimer = setInterval(() => {
        recordingDuration.value++;
      }, 1000);
    } catch (err) {
      logger.error('startRecording', err);
      notificationService.addNotification(getApiErrorMessage(err, 'تعذر الوصول إلى الميكروفون'), 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
    }
  };

  /**
   * @param {any} e
   * @param {any} msg
   */
  const openContextMenu = (e, msg) => {
    e.preventDefault();
    contextMenu.value = {
      visible: true,
      x: e.clientX,
      y: e.clientY,
      msg
    };
  };

  const closeContextMenu = () => {
    contextMenu.value.visible = false;
  };

  /** @param {any} msg */
  const deleteMessage = async msg => {
    if (!msg || msg._optimistic) return;
    try {
      await chatService.deleteMessage(msg.id);
      messages.value = messages.value.filter(m => m.id !== msg.id);
    } catch (e) {
      const err = (/** @type {any} */ (e));
      logger.error('deleteMessage', e);
      notificationService.addNotification(err.response?.data?.message || 'تعذر حذف الرسالة', 'error');
    } finally {
      closeContextMenu();
    }
  };

  /** @param {any} msg */
  const copyMessageText = msg => {
    if (!msg?.message) return;
    navigator.clipboard.writeText(msg.message);
    notificationService.addNotification('تم نسخ النص', 'success');
    closeContextMenu();
  };

  /** 
   * @param {any} e
   * @param {any} msg 
   */
  const handleMessageLongPress = (e, msg) => {
    openContextMenu(e, msg);
  };

  /** @param {any} e */
  const onEmojiSelect = (e) => {
    newMessage.value += e;
    showEmoji.value = false;
    if (composerInput.value) {
      nextTick(() => composerInput.value.focus());
    }
  };

  /**
   * Search employees/users for starting a new conversation.
   * Some backends require 2+ chars; others return a default list when empty.
   * @param {{ allowEmpty?: boolean }} [opts]
   */
  const searchUsers = async (opts = {}) => {
    const q = userSearchQuery.value.trim();
    const allowEmpty = Boolean(opts?.allowEmpty);
    if (q.length < 2 && !allowEmpty) {
      searchedUsers.value = [];
      return;
    }
    isSearchingUsers.value = true;
    try {
      const data = await chatService.listUsers(q ? { search: q } : {});
      searchedUsers.value = (Array.isArray(data) ? data : []).filter((/** @type {any} */ u) => u.id !== currentUserId.value);
    } catch (e) {
      logger.error('searchUsers', e);
    } finally {
      isSearchingUsers.value = false;
    }
  };

  /** @param {any} userId */
  const startNewConversation = async userId => {
    try {
      const conv = await chatService.getOrCreateConversation(userId);
      if (!conv || !conv.id) {
        throw new Error('Invalid conversation response');
      }
      
      const exists = conversations.value.find(c => c.id === conv.id);
      if (!exists) {
        conversations.value = [conv, ...conversations.value];
        subscribeToConversation(conv.id);
      }
      
      showNewChatModal.value = false;
      userSearchQuery.value = '';
      searchedUsers.value = [];
      
      await selectConversation(conv);
    } catch (e) {
      logger.error('startNewConversation', e);
      notificationService.addNotification(getApiErrorMessage(e, 'تعذر بدء المحادثة'), 'error');
    }
  };

  const closeNewChatModal = () => {
    showNewChatModal.value = false;
    userSearchQuery.value = '';
    searchedUsers.value = [];
  };

  /** @param {any} conv */
  const openConversation = conv => selectConversation(conv);

  /**
   * Remove conversation from the sidebar list (UI-only).
   * @param {string|number} conversationId
   */
  const removeConversation = conversationId => {
    const id = String(conversationId);
    conversations.value = conversations.value.filter(c => String(c.id) !== id);
    if (activeConversation.value && String(activeConversation.value.id) === id) {
      activeConversation.value = null;
      messages.value = [];
    }
  };

  const uploadFile = file => handleFileUpload(file);
  const clearSelectedFile = () => {
    selectedFile.value = null;
  };

  watch(userSearchQuery, () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => searchUsers(), 450);
  });

  watch(
    showNewChatModal,
    open => {
      if (open) {
        // Load an initial list when opening the modal (better UX than empty screen).
        searchUsers({ allowEmpty: true });
      }
    }
  );

  /** @param {any} convId */
  const isActive = convId => activeConversation.value?.id === convId;
  /** @param {any} convId */
  const getConversation = convId => conversations.value.find(c => c.id === convId);

  onMounted(() => {
    ensureCurrentUserLoaded().then(() =>
      loadConversations().then(() => {
      initPusher();
      })
    );

    window.addEventListener('click', closeContextMenu);
  });

  onBeforeUnmount(() => {
    if (pusher) {
      pusherSubscriptions.forEach(s => pusher.unsubscribe(s.channelName));
      pusher.disconnect();
    }
    window.removeEventListener('click', closeContextMenu);
    if (recordingTimer) clearInterval(recordingTimer);
    if (activePollTimer) clearInterval(activePollTimer);
  });

  watch(
    () => [activeConversation.value?.id, isPusherConnected.value],
    () => {
      if (activePollTimer) {
        clearInterval(activePollTimer);
        activePollTimer = null;
      }
      if (activeConversation.value?.id && !isPusherConnected.value) {
        activePollTimer = setInterval(pollActiveConversation, 8000);
      }
    }
  );

  return {
    conversations,
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
    messagesArea,
    composerInput,
    hasMoreMessages,
    contextMenu,
    isRecording,
    recordingDuration,
    selectedFile,
    currentUserId,
    emojiList,
    filteredConversations,
    totalUnreadCount,
    avatarLetter,
    avatarColor,
    relativeTime,
    formatMsgTime,
    isPusherConnected,

    // Aliases expected by ChatView.vue
    openConversation,
    loadMoreMessages,
    sendMessage,
    deleteMsg: deleteMessage,
    copyMsg: copyMessageText,
    onMessageContext: handleMessageLongPress,
    insertEmoji: onEmojiSelect,
    searchUsers,
    startConversation: startNewConversation,
    closeNewChatModal,
    removeConversation,
    uploadFile,
    clearSelectedFile,
    startVoiceRecording: startRecording,
    stopVoiceRecording: stopRecording,
    isActive,
    getConversation
  };
}

// @ts-check
/**
 * ERP دردشة داخلية — حالة ومنطق الواجهة (Rakez Chat API)
 * @module composables/chat/useErpChat
 */

import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import chatService from '@/services/chatService';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { createPusher } from '@/plugins/pusher';
import logger from '@/utils/logger';
import { localeOpts } from '@/utils/intlLatn';


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

  const currentUserId = computed(() => {
     const user = authService.getCurrentUser();
     return user?.id || (/** @type {any} */ (user))?.user_id;
   });

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

  const loadConversations = async () => {
    isLoadingConversations.value = true;
    try {
      const data = await chatService.getConversations();
      conversations.value = Array.isArray(data) ? data : [];
    } catch (e) {
      logger.error('loadConversations', e);
      notificationService.addNotification('تعذر تحميل المحادثات', 'error');
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
    
    // Laravel private channels use the private-* prefix; try private first (required for Broadcast::channel auth).
    const channelsToTry = [`private-conversation.${convId}`, `conversation.${convId}`];
    // Common event names in Laravel/Pusher setups
    const eventsToTry = ['message.sent', 'MessageSent', 'message-sent'];

    channelsToTry.forEach(channelName => {
      if (pusherSubscriptions.some(s => s.channelName === channelName)) return;
      
      try {
        logger.debug(`[Chat Real-time] Subscribing to: ${channelName}`);
        const ch = pusher.subscribe(channelName);
        
        eventsToTry.forEach(eventName => {
          ch.bind(eventName, (/** @type {any} */ data) => {
            logger.debug(`[Chat Real-time] Event '${eventName}' on '${channelName}':`, data);
            
            // Normalize data (handle both root object and nested .message)
            const msgData = data.message ? data.message : data;
            
            if (activeConversation.value?.id === convId && Number(msgData.sender_id) !== currentUserId.value) {
              const exists = messages.value.find(m => m.id === msgData.id);
              if (!exists) {
                messages.value = sortAndDedupeMessages([...messages.value, msgData]);
                nextTick(scrollToBottom);
                // Mark as read in backend if it's the active conversation
                chatService.markAsRead(convId).catch(() => {});
              }
            }
            
            // Update preview and unread count in sidebar
            const c = conversations.value.find(x => x.id === convId);
            if (c) {
              c._lastPreview = msgData.message || msgData.body || msgData.text || '';
              c.last_message_at = new Date().toISOString();
              if (Number(msgData.sender_id) !== currentUserId.value && activeConversation.value?.id !== convId) {
                c.unread_count = (c.unread_count || 0) + 1;
              }
            }
          });
        });

        pusherSubscriptions.push({ convId, channelName, ch });
        
        // Monitoring connection
        ch.bind('pusher:subscription_succeeded', () => {
          logger.debug(`[Chat Real-time] Subscription SUCCESS: ${channelName}`);
        });
        ch.bind('pusher:subscription_error', (/** @type {any} */ status) => {
          logger.warn(`[Chat Real-time] Subscription ERROR (${channelName}):`, status);
        });
      } catch (err) {
        logger.warn(`[Chat Real-time] Subscription FAILED: ${channelName}`, err);
      }
    });
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
      const response = await chatService.getMessages(convId, 1);
      const data = response?.data || response;
      const list = Array.isArray(data) ? data : (data?.items || []);
      messages.value = sortAndDedupeMessages(list);
      hasMoreMessages.value = !!(data?.next_page_url || data?.has_more);
      currentPage.value = 1;
    } catch (e) {
      logger.error('loadMessages', e);
      notificationService.addNotification('تعذر تحميل الرسائل', 'error');
    } finally {
      isLoadingMessages.value = false;
    }
  };

  const loadMoreMessages = async () => {
    if (!activeConversation.value || !hasMoreMessages.value || isLoadingMessages.value) return;
    
    const convId = activeConversation.value.id;
    const nextPage = currentPage.value + 1;
    
    try {
      const response = await chatService.getMessages(convId, nextPage);
      const data = response?.data || response;
      const list = Array.isArray(data) ? data : (data?.items || []);
      
      if (list.length > 0) {
        messages.value = sortAndDedupeMessages([...list, ...messages.value]);
        currentPage.value = nextPage;
        hasMoreMessages.value = !!(data?.next_page_url || data?.has_more);
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
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      conversation_id: convId,
      sender_id: currentUserId.value,
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
      attachment_type: file ? (file.type.startsWith('image/') ? 'image' : 'file') : null,
      _isUploading: !!file,
      attachment: file ? URL.createObjectURL(file) : null
    };
    
    messages.value = sortAndDedupeMessages([...messages.value, tempMsg]);
    newMessage.value = '';
    selectedFile.value = null;
    nextTick(scrollToBottom);

    try {
      /** @type {any} */
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('message', text);
        formData.append('attachment', file);
        response = await chatService.sendAttachment(convId, formData);
      } else {
        response = await chatService.sendMessage(convId, text);
      }
      const realMsg = response?.data || response;
      
      // Replace optimistic message with real one
      messages.value = messages.value.map(m => m.id === tempId ? realMsg : m);
      
      // Update sidebar preview
      const c = conversations.value.find(x => x.id === convId);
      if (c) {
        c._lastPreview = text || (file ? 'مرفق' : '');
        c.last_message_at = realMsg.created_at;
      }
    } catch (e) {
      logger.error('sendMessage', e);
      notificationService.addNotification('فشل إرسال الرسالة', 'error');
      // Mark optimistic message as failed or remove it
      messages.value = messages.value.filter(m => m.id !== tempId);
    } finally {
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.value = new MediaRecorder(stream);
      audioChunks.value = [];

      mediaRecorder.value.ondataavailable = (/** @type {any} */ e) => {
        if (e.data.size > 0) audioChunks.value.push(e.data);
      };

      mediaRecorder.value.onstop = async () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
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
      notificationService.addNotification('تعذر الوصول إلى الميكروفون', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;
      if (recordingTimer) clearInterval(recordingTimer);
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

  /** @param {any} e */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const searchUsers = async () => {
    if (userSearchQuery.value.trim().length < 2) {
      searchedUsers.value = [];
      return;
    }
    isSearchingUsers.value = true;
    try {
      const data = await chatService.listUsers({ search: userSearchQuery.value });
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
      const response = await chatService.getOrCreateConversation(userId);
      const conv = response?.data || response;
      
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
      const err = (/** @type {any} */ (e));
      logger.error('startNewConversation', e);
      notificationService.addNotification(err.response?.data?.message || 'تعذر بدء المحادثة', 'error');
    }
  };

  watch(userSearchQuery, () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(searchUsers, 500);
  });

  /** @param {any} convId */
  const isActive = convId => activeConversation.value?.id === convId;
  /** @param {any} convId */
  const getConversation = convId => conversations.value.find(c => c.id === convId);

  onMounted(() => {
    loadConversations().then(() => {
      initPusher();
    });

    window.addEventListener('click', closeContextMenu);
  });

  onBeforeUnmount(() => {
    if (pusher) {
      pusherSubscriptions.forEach(s => pusher.unsubscribe(s.channelName));
      pusher.disconnect();
    }
    window.removeEventListener('click', closeContextMenu);
    if (recordingTimer) clearInterval(recordingTimer);
  });

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
    selectConversation,
    loadMoreMessages,
    sendMessage,
    handleFileUpload,
    startRecording,
    stopRecording,
    openContextMenu,
    closeContextMenu,
    deleteMessage,
    copyMessageText,
    handleMessageLongPress,
    onEmojiSelect,
    handleKeyDown,
    startNewConversation,
    isActive,
    getConversation
  };
}

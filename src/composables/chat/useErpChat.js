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
  const conversations = ref([]);
  const activeConversation = ref(null);
  const messages = ref([]);
  const newMessage = ref('');
  const searchQuery = ref('');
  const isLoadingConversations = ref(false);
  const isLoadingMessages = ref(false);
  const isSending = ref(false);
  const showNewChatModal = ref(false);
  const userSearchQuery = ref('');
  const searchedUsers = ref([]);
  const isSearchingUsers = ref(false);
  const showEmoji = ref(false);
  const messagesArea = ref(null);
  const composerInput = ref(null);
  const currentPage = ref(1);
  const hasMoreMessages = ref(false);
  const contextMenu = ref({ visible: false, x: 0, y: 0, msg: null });
  const isRecording = ref(false);
  const recordingDuration = ref(0);
  const mediaRecorder = ref(null);
  const audioChunks = ref([]);
  let recordingTimer = null;
  const selectedFile = ref(null);

  let pusher = null;
  const isPusherConnected = ref(false);
  const pusherSubscriptions = [];
  let searchDebounce = null;

  const currentUserId = computed(() => {
    const user = authService.getCurrentUser();
    const id = user?.id ?? user?.user_id ?? localStorage.getItem('userId');
    return id ? Number(id) : 0;
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

  const avatarLetter = name => (name || 'U').charAt(0).toUpperCase();
  const avatarColor = name => {
    const colors = ['#27374D', '#B5A99A', '#5B7B9A', '#6B8F71', '#8B6F5E', '#7B6B8F', '#6B8B9B', '#8F7B5B'];
    let hash = 0;
    for (const ch of (name || 'U')) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  /**
   * Sort messages by date and deduplicate by ID.
   * Ensures UI remains consistent regardless of arrival order.
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
          ch.bind(eventName, data => {
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
        ch.bind('pusher:subscription_error', status => {
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
    
    pusher.connection.bind('state_change', states => {
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
        globalCh.bind('message.sent', data => {
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
        pusherSubscriptions.push({ channelName: globalChannel, ch: globalCh });
      } catch (err) {
        logger.warn(`[Chat Real-time] Global subscription failed`, err);
      }
    }
  };

  const updateConvPreview = (convId, text) => {
    const c = conversations.value.find(x => x.id === convId);
    if (c) {
      c._lastPreview = text && text.length > 40 ? `${text.slice(0, 40)}…` : (text || '');
      c.last_message_at = new Date().toISOString();
    }
  };

  const openConversation = async conv => {
    activeConversation.value = conv;
    messages.value = [];
    currentPage.value = 1;
    hasMoreMessages.value = false;
    isLoadingMessages.value = true;
    try {
      await chatService.markAsRead(conv.id);
      conv.unread_count = 0;
      const res = await chatService.getMessages(conv.id, 1, 50);
      messages.value = sortAndDedupeMessages(res.messages || []);
      hasMoreMessages.value = !!res.meta?.has_more_pages;
      currentPage.value = 1;
      await nextTick();
      scrollToBottom();
    } catch (e) {
      logger.error('openConversation', e);
      notificationService.addNotification('تعذر تحميل الرسائل', 'error');
    } finally {
      isLoadingMessages.value = false;
    }
    subscribeToConversation(conv.id);
  };

  const loadMoreMessages = async () => {
    if (!activeConversation.value || isLoadingMessages.value) return;
    isLoadingMessages.value = true;
    try {
      const nextPage = currentPage.value + 1;
      const res = await chatService.getMessages(activeConversation.value.id, nextPage, 50);
      messages.value = sortAndDedupeMessages([...(res.messages || []), ...messages.value]);
      hasMoreMessages.value = !!res.meta?.has_more_pages;
      currentPage.value = nextPage;
    } catch (e) {
      logger.error('loadMoreMessages', e);
      notificationService.addNotification('تعذر تحميل الرسائل الأقدم', 'error');
    } finally {
      isLoadingMessages.value = false;
    }
  };

  const sendMessage = async () => {
    const text = newMessage.value.trim();
    if (!text && !selectedFile.value) return;
    if (!activeConversation.value || isSending.value) return;
    
    isSending.value = true;
    const file = selectedFile.value;
    const isAttachment = !!file;
    
    // Type detection for UI optimistic message
    let attType = 'text';
    if (file) {
      if (file.type.startsWith('image/')) attType = 'image';
      else if (file.type.startsWith('audio/') || file.name.endsWith('.webm')) attType = 'voice';
      else attType = 'file';
    }

    const optimistic = {
      id: `tmp-${Date.now()}`,
      conversation_id: activeConversation.value.id,
      sender_id: currentUserId.value,
      message: text || (file ? file.name : ''),
      is_read: false,
      created_at: new Date().toISOString(),
      _optimistic: true,
      attachment_type: attType,
      _isUploading: isAttachment,
    };

    messages.value.push(optimistic);
    const savedText = text;
    newMessage.value = '';
    selectedFile.value = null; // Clear selection
    showEmoji.value = false;
    await nextTick();
    scrollToBottom();

    try {
      let saved;
      if (isAttachment) {
        const fd = new FormData();
        fd.append('file', file);
        if (savedText) fd.append('message', savedText);
        fd.append('attachment_type', attType);
        saved = await chatService.sendAttachment(activeConversation.value.id, fd);
      } else {
        saved = await chatService.sendMessage(activeConversation.value.id, savedText);
      }

      const idx = messages.value.findIndex(m => m.id === optimistic.id);
      if (idx !== -1) {
        if (saved && saved.id) {
          messages.value.splice(idx, 1, saved);
        } else {
          messages.value[idx]._isUploading = false;
        }
      }
      messages.value = sortAndDedupeMessages(messages.value);
      updateConvPreview(activeConversation.value.id, isAttachment ? `[\u0645\u0631\u0641\u0642] ${file.name}` : savedText);
    } catch (_e) {
      const idx = messages.value.findIndex(m => m.id === optimistic.id);
      if (idx !== -1) messages.value.splice(idx, 1);
      notificationService.addNotification('فشل الإرسال', 'error');
    } finally {
      isSending.value = false;
    }
  };

  const uploadFile = async (file) => {
    // Now this just selects the file
    selectedFile.value = file;
  };

  const clearSelectedFile = () => {
    selectedFile.value = null;
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.value = new MediaRecorder(stream);
      audioChunks.value = [];
      
      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.value.push(e.data);
      };
      
      mediaRecorder.value.onstop = async () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        await uploadFile(file);
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorder.value.start();
      isRecording.value = true;
      recordingDuration.value = 0;
      recordingTimer = setInterval(() => { recordingDuration.value++; }, 1000);
    } catch (_err) {
      notificationService.addNotification('تعذر الوصول للميكروفون', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;
      clearInterval(recordingTimer);
    }
  };

  const deleteMsg = async msg => {
    if (!msg || msg._optimistic) return;
    try {
      await chatService.deleteMessage(msg.id);
      messages.value = messages.value.filter(m => m.id !== msg.id);
      notificationService.addNotification('تم حذف الرسالة', 'success');
    } catch (e) {
      notificationService.addNotification(
        e?.response?.data?.message || 'تعذر حذف الرسالة',
        'error'
      );
    }
    contextMenu.value.visible = false;
  };

  const copyMsg = msg => {
    if (msg?.message) navigator.clipboard?.writeText(msg.message);
    contextMenu.value.visible = false;
  };

  const onMessageContext = (e, msg) => {
    contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, msg };
  };

  const hideContextMenu = () => {
    contextMenu.value.visible = false;
  };

  const insertEmoji = e => {
    if (isRecording.value) stopVoiceRecording();
    newMessage.value += e;
    nextTick(() => {
      composerInput.value?.focus();
    });
  };

  const searchUsers = () => {
    clearTimeout(searchDebounce);
    const q = userSearchQuery.value.trim();
    searchDebounce = setTimeout(async () => {
      isSearchingUsers.value = true;
      try {
        const params = q ? { search: q } : {};
        const list = await chatService.listUsers(params);
        searchedUsers.value = (list || [])
          .filter(u => Number(u.id) !== currentUserId.value)
          .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
      } catch {
        searchedUsers.value = [];
      } finally {
        isSearchingUsers.value = false;
      }
    }, 300);
  };

  const startConversation = async userId => {
    showNewChatModal.value = false;
    searchQuery.value = '';
    userSearchQuery.value = '';
    searchedUsers.value = [];
    try {
      const conv = await chatService.getOrCreateConversation(userId);
      if (conv) {
        // Move to top if exists, else unshift
        const idx = conversations.value.findIndex(c => c.id === conv.id);
        if (idx !== -1) {
          conversations.value.splice(idx, 1);
        }
        conversations.value.unshift(conv);
        await openConversation(conv);
      }
    } catch (e) {
      notificationService.addNotification(
        e?.response?.data?.message || 'تعذر بدء المحادثة',
        'error'
      );
    }
  };

  const closeNewChatModal = () => {
    showNewChatModal.value = false;
    userSearchQuery.value = '';
    searchedUsers.value = [];
  };

  /**
   * Watch modal opening to fetch initial list of employees
   */
  watch(showNewChatModal, (val) => {
    if (val && searchedUsers.value.length === 0) {
      searchUsers();
    }
  });

  onMounted(async () => {
    await loadConversations();
    initPusher();
    document.addEventListener('click', hideContextMenu);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', hideContextMenu);
    pusherSubscriptions.length = 0;
    if (pusher) {
      try {
        pusher.disconnect();
      } catch { /* */ }
      pusher = null;
    }
  });

  const removeConversation = async convId => {
    // Usually we just hide it locally for the session unless backend has delete endpoint
    conversations.value = conversations.value.filter(c => c.id !== convId);
    if (activeConversation.value?.id === convId) {
      activeConversation.value = null;
      messages.value = [];
    }
    
    // Unsubscribe from its channels
    const toRemove = pusherSubscriptions.filter(s => s.convId === convId);
    toRemove.forEach(s => {
      try {
        s.ch.unbind_all();
        pusher?.unsubscribe(s.channelName);
      } catch { /* */ }
    });
    
    // Update local subscriptions record
    const remains = pusherSubscriptions.filter(s => s.convId !== convId);
    pusherSubscriptions.length = 0;
    pusherSubscriptions.push(...remains);
  };

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
    emojiList,
    messagesArea,
    composerInput,
    currentPage,
    hasMoreMessages,
    contextMenu,
    filteredConversations,
    totalUnreadCount,
    currentUserId,
    avatarLetter,
    avatarColor,
    relativeTime,
    formatMsgTime,
    loadConversations,
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
    isRecording,
    recordingDuration,
    startVoiceRecording,
    stopVoiceRecording,
    uploadFile,
    selectedFile,
    clearSelectedFile,
  };
}

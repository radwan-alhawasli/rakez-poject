/**
 * شارة عدد الرسائل غير المقروءة للدردشة (GET /api/chat/unread-count).
 * يُستخدم في التخطيط الرئيسي — تحديث دوري + عند العودة للتبويب + عند زيارة /chat.
 * @module composables/chat/useChatUnreadBadge
 */

import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import chatService from '@/services/chatService';
import authService from '@/services/authService';

const POLL_MS = 60000;

export function useChatUnreadBadge() {
  const chatUnreadCount = ref(0);
  const route = useRoute();
  let pollTimer = null;

  const refreshChatUnreadCount = async () => {
    if (!authService.isAuthenticated()) {
      chatUnreadCount.value = 0;
      return;
    }
    try {
      const n = await chatService.getUnreadCount();
      chatUnreadCount.value = typeof n === 'number' && !Number.isNaN(n) ? n : 0;
    } catch {
      /* keep previous value */
    }
  };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      refreshChatUnreadCount();
    }
  };

  onMounted(() => {
    refreshChatUnreadCount();
    pollTimer = setInterval(refreshChatUnreadCount, POLL_MS);
    document.addEventListener('visibilitychange', onVisibility);
  });

  onBeforeUnmount(() => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    document.removeEventListener('visibilitychange', onVisibility);
  });

  // بعد زيارة الدردشة أو أي تنقّل — يحدّث الشارة (مثلاً بعد قراءة الرسائل ومغادرة /chat)
  watch(
    () => route.path,
    () => {
      refreshChatUnreadCount();
    }
  );

  return {
    chatUnreadCount,
    refreshChatUnreadCount,
  };
}

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import aiService from '@/services/aiService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useMarketingAiAssistant() {
  const aiQuery = ref('');
  const isAiTyping = ref(false);
  const isStreaming = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const chatMessages = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const conversations = ref([]);
  const isLoadingConversations = ref(false);
  /** @type {import('vue').Ref<any>} */
  const currentSessionId = ref(null);
  /** @type {import('vue').Ref<any>} */
  const chatScrollRef = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const aiSections = ref([]);
  const isLoadingAiSections = ref(false);
  const aiSelectedSectionKey = ref('general');
  /** @type {any} */
  const aiContext = reactive({});
  /** @type {AbortController | null} */
  let abortController = null;

  const currentAiSection = computed(() => {
    const key = aiSelectedSectionKey.value;
    return (/** @type {any[]} */ (aiSections.value) || []).find(s => String(s.key) === String(key)) || null;
  });

  /** @param {any} chat */
  const getConversationId = chat => chat?.id || chat?.session_id || chat?._id;

  const loadAiDashboard = async () => {
    isLoadingConversations.value = true;
    isLoadingAiSections.value = true;
    try {
      const [convs, sections] = await Promise.all([
        aiService.getConversations().catch(() => []),
        aiService.getAvailableSections().catch(() => []),
      ]);
      conversations.value = Array.isArray(convs) ? convs : [];
      aiSections.value = Array.isArray(sections) ? sections : [];
      const hasGeneral = (/** @type {any[]} */ (aiSections.value)).some(s => String(s.key) === 'general');
      if (hasGeneral) aiSelectedSectionKey.value = 'general';
      else if (aiSections.value[0]?.key) aiSelectedSectionKey.value = aiSections.value[0].key;
    } catch (error) {
      logger.error('Error loading AI dashboard:', error);
    } finally {
      isLoadingConversations.value = false;
      isLoadingAiSections.value = false;
    }
  };

  const startNewChat = () => {
    currentSessionId.value = null;
    chatMessages.value = [];
    aiQuery.value = '';
  };

  /** @param {any} sessionId */
  const loadChatSession = async sessionId => {
    currentSessionId.value = sessionId;
    chatMessages.value = [
      { role: 'assistant', content: 'تم اختيار هذه المحادثة. يمكنك المتابعة بإرسال رسالة وسيتم ربطها بنفس session_id.' },
    ];
  };

  /** @param {any} text */
  const sendPrompt = text => {
    aiQuery.value = text;
    sendAiMessage();
  };

  const scrollToBottom = () => {
    nextTick(() => {
      if (chatScrollRef.value) (/** @type {any} */ (chatScrollRef.value)).scrollTop = (/** @type {any} */ (chatScrollRef.value)).scrollHeight;
    });
  };

  const stopStreaming = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isStreaming.value = false;
    isAiTyping.value = false;
  };

  const sendAiMessage = async () => {
    if (!aiQuery.value.trim() || isAiTyping.value) return;
    const text = aiQuery.value;
    chatMessages.value.push({ role: 'user', content: text });
    aiQuery.value = '';
    isAiTyping.value = true;
    scrollToBottom();

    const context = {};
    const allowed = (/** @type {any} */ (currentAiSection.value))?.allowed_context_params || [];
    (allowed || []).forEach((/** @type {any} */ k) => {
      const v = aiContext[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') (/** @type {any} */ (context))[k] = v;
    });
    const payload = {
      message: text,
      session_id: currentSessionId.value,
      section: aiSelectedSectionKey.value || 'general',
      ...(Object.keys(context).length ? { context } : {}),
    };

    /** @type {any} */
    const assistantMsg = { role: 'assistant', content: '', streaming: true };
    chatMessages.value.push(assistantMsg);
    const msgIndex = chatMessages.value.length - 1;

    abortController = new AbortController();
    isStreaming.value = true;

    try {
      const { session_id } = await aiService.chatStream(
        payload,
        (/** @type {any} */ chunk) => {
          chatMessages.value[msgIndex] = {
            ...chatMessages.value[msgIndex],
            content: (/** @type {any} */ (chatMessages.value[msgIndex])).content + chunk,
          };
          scrollToBottom();
        },
        abortController.signal,
      );

      chatMessages.value[msgIndex] = {
        ...chatMessages.value[msgIndex],
        streaming: false,
      };

      if (!(/** @type {any} */ (chatMessages.value[msgIndex])).content) {
        (/** @type {any} */ (chatMessages.value[msgIndex])).content = 'عذراً، لم أتمكن من فهم طلبك.';
      }

      if (session_id && !currentSessionId.value) {
        currentSessionId.value = session_id;
        loadAiDashboard();
      }
    } catch (error) {
      if (/** @type {any} */ (error).name === 'AbortError') {
        chatMessages.value[msgIndex] = {
          ...chatMessages.value[msgIndex],
          streaming: false,
          content: (/** @type {any} */ (chatMessages.value[msgIndex])).content || 'تم إيقاف الاستجابة.',
        };
      } else {
        logger.error('Error sending AI message:', error);
        chatMessages.value[msgIndex] = {
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.',
          streaming: false,
        };
      }
    } finally {
      isAiTyping.value = false;
      isStreaming.value = false;
      abortController = null;
      scrollToBottom();
    }
  };

  /** @param {any} chatId */
  const deleteChat = async chatId => {
    try {
      await aiService.deleteConversation(chatId);
      conversations.value = conversations.value.filter(c => getConversationId(c) !== chatId);
      if (currentSessionId.value === chatId) startNewChat();
      toast.success('تم حذف المحادثة بنجاح');
    } catch (error) {
      logger.error('Error deleting chat:', error);
      toast.error('تعذر حذف المحادثة');
    }
  };

  onMounted(() => {
    loadAiDashboard();
  });

  onUnmounted(() => {
    stopStreaming();
  });

  return {
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
  };
}

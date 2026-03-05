import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import aiService from '@/services/aiService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useMarketingAiAssistant() {
  const aiQuery = ref('');
  const isAiTyping = ref(false);
  const isStreaming = ref(false);
  const chatMessages = ref([]);
  const conversations = ref([]);
  const isLoadingConversations = ref(false);
  const currentSessionId = ref(null);
  const chatScrollRef = ref(null);
  const aiSections = ref([]);
  const isLoadingAiSections = ref(false);
  const aiSelectedSectionKey = ref('general');
  const aiContext = reactive({});
  let abortController = null;

  const currentAiSection = computed(() => {
    const key = aiSelectedSectionKey.value;
    return (aiSections.value || []).find(s => String(s.key) === String(key)) || null;
  });

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
      const hasGeneral = aiSections.value.some(s => String(s.key) === 'general');
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

  const loadChatSession = async sessionId => {
    currentSessionId.value = sessionId;
    chatMessages.value = [
      { role: 'assistant', content: 'تم اختيار هذه المحادثة. يمكنك المتابعة بإرسال رسالة وسيتم ربطها بنفس session_id.' },
    ];
  };

  const sendPrompt = text => {
    aiQuery.value = text;
    sendAiMessage();
  };

  const scrollToBottom = () => {
    nextTick(() => {
      if (chatScrollRef.value) chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
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
    const allowed = currentAiSection.value?.allowed_context_params || [];
    (allowed || []).forEach(k => {
      const v = aiContext[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') context[k] = v;
    });
    const payload = {
      message: text,
      session_id: currentSessionId.value,
      section: aiSelectedSectionKey.value || 'general',
      ...(Object.keys(context).length ? { context } : {}),
    };

    const assistantMsg = { role: 'assistant', content: '', streaming: true };
    chatMessages.value.push(assistantMsg);
    const msgIndex = chatMessages.value.length - 1;

    abortController = new AbortController();
    isStreaming.value = true;

    try {
      const { session_id } = await aiService.chatStream(
        payload,
        (chunk) => {
          chatMessages.value[msgIndex] = {
            ...chatMessages.value[msgIndex],
            content: chatMessages.value[msgIndex].content + chunk,
          };
          scrollToBottom();
        },
        abortController.signal,
      );

      chatMessages.value[msgIndex] = {
        ...chatMessages.value[msgIndex],
        streaming: false,
      };

      if (!chatMessages.value[msgIndex].content) {
        chatMessages.value[msgIndex].content = 'عذراً، لم أتمكن من فهم طلبك.';
      }

      if (session_id && !currentSessionId.value) {
        currentSessionId.value = session_id;
        loadAiDashboard();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        chatMessages.value[msgIndex] = {
          ...chatMessages.value[msgIndex],
          streaming: false,
          content: chatMessages.value[msgIndex].content || 'تم إيقاف الاستجابة.',
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

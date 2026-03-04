import { ref, reactive, computed, onMounted } from 'vue';
import aiService from '@/services/aiService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export function useMarketingAiAssistant() {
  const aiQuery = ref('');
  const isAiTyping = ref(false);
  const chatMessages = ref([]);
  const conversations = ref([]);
  const isLoadingConversations = ref(false);
  const currentSessionId = ref(null);
  const chatScrollRef = ref(null);
  const aiSections = ref([]);
  const isLoadingAiSections = ref(false);
  const aiSelectedSectionKey = ref('general');
  const aiContext = reactive({});

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

  const sendAiMessage = async () => {
    if (!aiQuery.value.trim() || isAiTyping.value) return;
    const text = aiQuery.value;
    chatMessages.value.push({ role: 'user', content: text });
    aiQuery.value = '';
    isAiTyping.value = true;
    try {
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
      const response = await aiService.chat(payload);
      chatMessages.value.push({
        role: 'assistant',
        content: response.reply || response.answer || response.message || response.text || 'عذراً، لم أتمكن من فهم طلبك.',
      });
      if (response.session_id && !currentSessionId.value) {
        currentSessionId.value = response.session_id;
        loadAiDashboard();
      }
    } catch (error) {
      logger.error('Error sending AI message:', error);
      chatMessages.value.push({ role: 'assistant', content: 'عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.' });
    } finally {
      isAiTyping.value = false;
      setTimeout(() => {
        if (chatScrollRef.value) chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight;
      }, 100);
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

  return {
    aiQuery,
    isAiTyping,
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
  };
}

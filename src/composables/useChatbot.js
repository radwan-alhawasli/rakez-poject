/**
 * حالة الدردشة المشتركة ومنطق المساعد الذكي.
 * يُستخدم بواسطة ChatbotPanel و AiAssistantView.
 *
 * استراتيجية التراجع:
 *  1. تجربة V2 (POST /ai/v2/chat)
 *  2. التراجع إلى V1 (POST /ai/chat) في حال فشل V2
 */
import { ref, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as aiAssistantV2 from '@/services/aiAssistantV2';
import aiService from '@/services/aiService';
import { sanitizeHtml, sanitizeMarkdown, RICH_CHAT_HTML_OPTIONS } from '@/utils/safeHtml';
import { backendRouteToVuePath } from '@/utils/routeMapper';
import logger from '@/utils/logger';

const quickPrompts = ['كيف يمكنني مساعدتك؟', 'ما هي الخدمات المتاحة؟', 'أريد الاستفسار عن مشروع'];

const ERROR_MESSAGES = {
  403: 'لا يمكنك استخدام المساعد الذكي. تواصل مع المسؤول.',
  429: 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.',
  503: 'المساعد الذكي غير متاح حالياً. حاول لاحقاً.',
  404: 'خدمة المساعد الذكي غير متوفرة حالياً. يرجى المحاولة لاحقاً.',
  500: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
  502: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
  default: 'عذراً، حدث خطأ أثناء الاتصال. يرجى المحاولة لاحقاً.',
};

/** @param {any} status */
function getErrorContent(status) {
  return ERROR_MESSAGES[/** @type {keyof typeof ERROR_MESSAGES} */ (status)] || ERROR_MESSAGES.default;
}

/** 
 * التحقق مما إذا كان النص يبدو كرسالة خطأ من الخادم الخلفي 
 * @param {any} text
 */
function looksLikeBackendError(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return (
    (lower.includes('could not complete') && lower.includes('error')) ||
    (lower.includes('an error occurred') && lower.includes('try again')) ||
    lower.startsWith('error:') ||
    lower === 'internal server error'
  );
}

export { ERROR_MESSAGES };

export const STATUS_LABELS = {
  checking_permissions: 'جاري التحقق من الصلاحيات...',
  loading_catalog: 'جاري تحميل البيانات...',
  running_tool: 'جاري تنفيذ الأداة...',
  drafting_answer: 'جاري صياغة الإجابة...',
};

/**
 * @param {import('vue').Ref|Object} currentRouteRef - كائن المسار التفاعلي
 * @param {Object} [options]
 * @param {string|null} [options.initialSessionId] - معرّف الجلسة لاستئنافها
 * @param {string|null} [options.section] - مفتاح قسم المساعد الذكي
 */
export function useChatbot(currentRouteRef, options = {}) {
  const router = useRouter();
  const disposed = ref(false);
  /** @type {import('vue').Ref<any>} */
  const messagesRef = ref(null);
  /** @type {import('vue').Ref<any>} */
  const inputRef = ref(null);
  const inputText = ref('');
  /** @type {import('vue').Ref<any[]>} */
  const messages = ref([]);
  const isTyping = ref(false);
  const isStreaming = ref(false);
  const streamingHtml = ref('');
  const statusLabel = ref('');
  /** @type {import('vue').Ref<string|null>} */
  const sessionId = ref(options.initialSessionId || null);
  const section = ref(options.section || null);

  async function loadHistory() {
    if (!sessionId.value) return;
    try {
      isTyping.value = true;
      messages.value = []; // مسح الرسائل القديمة قبل تحميل الجديدة
      const data = /** @type {any} */ (await aiService.getConversation(sessionId.value));

      // استخراج الرسائل بناءً على هيكل الاستجابة المحتمل
      let historyMessages = [];
      if (data && Array.isArray(data.messages)) {
        historyMessages = data.messages;
      } else if (Array.isArray(data)) {
        historyMessages = data;
      } else if (data && data.data && Array.isArray(data.data.messages)) {
        historyMessages = data.data.messages;
      }

      if (historyMessages.length > 0) {
        messages.value = historyMessages.map(/** @param {any} m */ m => {
          const content = m.content || m.message || m.text || m.answer || m.answer_markdown || '';
          const role = m.role || (m.is_user || m.type === 'user' ? 'user' : 'assistant');
          return {
            role,
            content,
            contentHtml: sanitizeMarkdown(content),
            isError: false,
            sources: Array.isArray(m.sources) ? m.sources : [],
            links: Array.isArray(m.links) ? m.links : [],
            followUpQuestions: Array.isArray(m.follow_up_questions)
              ? m.follow_up_questions
              : Array.isArray(m.suggestions)
              ? m.suggestions
              : [],
            explainAccess: m.explain_access || m.access_notes || null,
          };
        });
        scrollToBottom();
      } else if (data && data.messages === undefined && !Array.isArray(data)) {
        // إذا لم يجد رسائل وكان الرد ليس مصفوفة (مثلاً فشل 405 تم اصطياده)
        logger.debug('لم يتم العثور على رسائل سابقة في هذه المحادثة.');
      }
    } catch (err) {
      logger.error('فشل تحميل المحادثة السابقة:', err);
    } finally {
      if (!disposed.value) {
        isTyping.value = false;
        scrollToBottom();
      }
    }
  }

  // جلب المحادثة عند تهيئة الكومبوزابل إذا كان هناك معرّف جلسة
  if (sessionId.value) {
    loadHistory();
  }

  let isSending = false;

  // مراقبة تغيير معرّف الجلسة (عند الضغط على محادثة أخرى من القائمة الجانبية)
  watch(sessionId, newVal => {
    if (newVal && !isSending) {
      loadHistory();
    }
  });

  function dispose() {
    disposed.value = true;
  }

  /** @param {string|null} newSessionId */
  function resetSession(newSessionId = null) {
    sessionId.value = newSessionId;
    messages.value = [];
  }

  /** بناء سياق الصفحة الحالية لإرساله مع الطلب */
  function buildPageContext() {
    const r = /** @type {any} */ (currentRouteRef);
    const rValue = r?.value ?? r ?? {};
    const path = rValue.path || '/';
    const entityId = rValue.params?.id
      ? isNaN(Number(rValue.params.id))
        ? null
        : Number(rValue.params.id)
      : null;
    let entityType = null;
    if (path.includes('lead') || path.includes('leads')) entityType = 'lead';
    else if (path.includes('contract')) entityType = 'contract';
    else if (path.includes('developer')) entityType = 'developer';
    else if (path.includes('project')) entityType = 'project';
    return {
      route: path,
      entity_id: entityId,
      entity_type: entityType,
      filters: {},
    };
  }

  /** @param {any} backendRoute */
  function navigateTo(backendRoute) {
    const path = backendRouteToVuePath(backendRoute);
    router.push(path);
  }

  /** @param {string} content */
  function pushErrorMessage(content) {
    messages.value.push(/** @type {any} */ ({
      role: 'assistant',
      content,
      contentHtml: sanitizeMarkdown(content),
      sources: [],
      links: [],
      followUpQuestions: [],
      explainAccess: null,
      isError: true,
    }));
  }

  /** @param {any} data */
  function pushAssistantMessage(data) {
    messages.value.push(/** @type {any} */ ({
      role: 'assistant',
      content: data.content || '',
      contentHtml: data.contentHtml
        ? sanitizeHtml(data.contentHtml, RICH_CHAT_HTML_OPTIONS)
        : sanitizeMarkdown(data.content || ''),
      sources: data.sources || [],
      links: data.links || [],
      followUpQuestions: data.followUpQuestions || [],
      explainAccess: data.explainAccess || null,
      isError: false,
    }));
  }

  // --------------- V2 streaming ---------------

  /** @param {string} text */
  async function sendMessageStream(text) {
    isStreaming.value = true;
    let accumulated = '';
    let meta = /** @type {any} */ ({});
    let sseError = /** @type {any} */ (null);

    const callbacks = {
      /** @param {{stage: string}} param0 */
      onStatus: ({ stage }) => {
        statusLabel.value = STATUS_LABELS[/** @type {keyof typeof STATUS_LABELS} */ (stage)] || '';
      },
      /** @param {{text: string}} param0 */
      onDelta: ({ text: chunk }) => {
        accumulated += chunk;
        streamingHtml.value = sanitizeMarkdown(accumulated);
      },
      /** @param {any} data */
      onMeta: data => {
        meta = data;
        if (data.session_id) sessionId.value = data.session_id;
      },
      /** @param {any} data */
      onError: data => {
        sseError = data;
      },
      onDone: () => {},
    };

    try {
      await aiAssistantV2.chatStream(text, sessionId.value, buildPageContext(), callbacks);
    } catch (err) {
      const error = /** @type {any} */ (err);
      if (error.name === 'AbortError') {
        if (accumulated) {
          pushAssistantMessage({ content: accumulated });
        }
        return;
      }
      throw error;
    }

    if (sseError) {
      const code = sseError.code;
      const content =
        code === 403
          ? aiAssistantV2.AI_V2_MESSAGES.FORBIDDEN
          : code === 503
          ? aiAssistantV2.AI_V2_MESSAGES.UNAVAILABLE
          : sseError.message || ERROR_MESSAGES.default;
      pushErrorMessage(content);
      return;
    }

    if (accumulated) {
      pushAssistantMessage({
        content: accumulated,
        contentHtml: sanitizeMarkdown(accumulated),
        sources: meta.sources || [],
        links: meta.links || [],
      });
    }
  }

  // --------------- V2 fetch ---------------

  /** @param {string} text */
  async function sendMessageV2(text) {
    const pageContext = buildPageContext();
    const response = /** @type {any} */ (await aiAssistantV2.chat(text, sessionId.value, pageContext));
    if (disposed.value) return true;

    // تشخيص: عرض الرد الكامل من الخادم
    logger.debug('[V2 تشخيص] الرد الكامل:', JSON.stringify(response, null, 2));

    const data = response?.data || {};
    let answerMarkdown =
      data.answer_markdown ||
      data.answer ||
      data.reply ||
      data.message ||
      response?.answer_markdown ||
      response?.answer ||
      '';

    logger.debug('[V2 تشخيص] answer_markdown:', answerMarkdown?.slice(0, 300));

    if (looksLikeBackendError(answerMarkdown)) {
      answerMarkdown = ERROR_MESSAGES.default;
    }

    const sid = data.session_id ?? response?.session_id;
    if (sid != null) {
      sessionId.value = sid;
    }

    const sources = Array.isArray(data.sources)
      ? data.sources
      : Array.isArray(response?.sources)
      ? response.sources
      : [];
    const links = Array.isArray(data.links)
      ? data.links
      : Array.isArray(response?.links)
      ? response.links
      : [];
    const followUpQuestions = Array.isArray(data.follow_up_questions)
      ? data.follow_up_questions
      : Array.isArray(response?.follow_up_questions)
      ? response.follow_up_questions
      : [];
    const accessNotes = data.access_notes || response?.access_notes || {};
    let explainAccessData = null;
    if (accessNotes.had_denied_request) {
      try {
        explainAccessData = await aiAssistantV2.explainAccess(
          pageContext.route,
          pageContext.entity_type,
          pageContext.entity_id
        );
      } catch (e) {
        logger.debug('فشل شرح الصلاحيات', e);
      }
    }

    pushAssistantMessage({
      content: answerMarkdown,
      contentHtml: sanitizeMarkdown(answerMarkdown),
      sources,
      links,
      followUpQuestions,
      explainAccess: explainAccessData,
    });
    return true;
  }

  // --------------- V1 احتياطي ---------------

  /** @param {string} text */
  async function sendMessageV1(text) {
    const payload = {
      message: text,
      session_id: sessionId.value || undefined,
      section: section.value || undefined,
      context: {},
    };
    const data = /** @type {any} */ (await aiService.chat(payload));
    if (disposed.value) return true;

    logger.debug('[V1 تشخيص] الرد:', JSON.stringify(data, null, 2));

    let answer = data?.answer || data?.answer_markdown || '';
    if (looksLikeBackendError(answer)) {
      answer = ERROR_MESSAGES.default;
    }

    if (data?.session_id) sessionId.value = data.session_id;

    pushAssistantMessage({
      content: answer,
      followUpQuestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
    });
    return true;
  }

  // --------------- بحث RAG ---------------

  /** @param {string} query */
  async function ragSearch(query) {
    if (!query || isTyping.value) return;

    messages.value.push(/** @type {any} */ ({ role: 'user', content: query }));
    isTyping.value = true;

    try {
      const sources = /** @type {any[]} */ (await aiAssistantV2.search(query));
      if (disposed.value) return;

      if (sources.length === 0) {
        pushAssistantMessage({ content: 'لم يتم العثور على نتائج مطابقة.' });
      } else {
        const summaryLines = sources.map(
          (s, i) => `${i + 1}. **${(/** @type {any} */ (s)).title || 'مصدر'}**${(/** @type {any} */ (s)).excerpt ? ': ' + (/** @type {any} */ (s)).excerpt : ''}`
        );
        const markdown = '### نتائج البحث\n\n' + summaryLines.join('\n');
        pushAssistantMessage({
          content: markdown,
          contentHtml: sanitizeMarkdown(markdown),
          sources,
        });
      }
    } catch (err) {
      if (disposed.value) return;
      const error = /** @type {any} */ (err);
      const status = error.status ?? error.response?.status;
      pushErrorMessage(getErrorContent(status));
      logger.error('خطأ في بحث RAG:', error);
    } finally {
      if (!disposed.value) {
        isTyping.value = false;
        scrollToBottom();
      }
    }
  }

  // --------------- الإرسال الرئيسي ---------------

  async function sendMessage() {
    const text = inputText.value?.trim();
    if (!text || isTyping.value) return;

    messages.value.push(/** @type {any} */ ({ role: 'user', content: text }));
    inputText.value = '';
    isTyping.value = true;
    isSending = true;

    try {
      try {
        await sendMessageStream(text);
      } catch (streamErr) {
        if (disposed.value) return;

        const error = /** @type {any} */ (streamErr);
        const status = error.status ?? error.response?.status;
        if (status === 403) {
          pushErrorMessage(aiAssistantV2.AI_V2_MESSAGES.FORBIDDEN);
          return;
        }

        logger.debug('فشل البث، جاري تجربة V2', status);

        try {
          await sendMessageV2(text);
        } catch (err) {
          if (disposed.value) return;
          const errorV2 = /** @type {any} */ (err);
          logger.debug('فشل V2، جاري تجربة V1', errorV2.status ?? errorV2.response?.status);

          try {
            await sendMessageV1(text);
          } catch (v1Err) {
            if (disposed.value) return;
            const errorV1 = /** @type {any} */ (v1Err);
            const v1Status = errorV1.status ?? errorV1.response?.status;
            pushErrorMessage(getErrorContent(v1Status));
            logger.error('فشلت جميع نقاط الوصول:', errorV1);
          }
        }
      }
    } finally {
      isSending = false;
      if (!disposed.value) {
        isTyping.value = false;
        isStreaming.value = false;
        streamingHtml.value = '';
        statusLabel.value = '';
        scrollToBottom();
      }
    }
  }

  function retryLastMessage() {
    if (messages.value.length < 2) return;
    /** @type {any} */
    const lastAssistant = messages.value[messages.value.length - 1];
    if (lastAssistant?.role !== 'assistant' || !lastAssistant.isError) return;
    messages.value.pop();
    /** @type {any} */
    const lastUser = messages.value[messages.value.length - 1];
    if (lastUser?.role === 'user') {
      inputText.value = lastUser.content;
      messages.value.pop();
      sendMessage();
    }
  }

  /** @param {string} text */
  function sendQuickPrompt(text) {
    inputText.value = text;
    sendMessage();
  }

  /** @param {string} content */
  function copyMessageContent(content) {
    if (!content) return Promise.resolve();
    return navigator.clipboard.writeText(content).catch(err => {
      logger.error('فشل النسخ إلى الحافظة:', err);
    });
  }

  function scrollToBottom() {
    nextTick(() => {
      if (disposed.value || !messagesRef.value) return;
      (/** @type {any} */ (messagesRef.value)).scrollTop = (/** @type {any} */ (messagesRef.value)).scrollHeight;
    });
  }

  return {
    messagesRef,
    inputRef,
    inputText,
    messages,
    isTyping,
    isStreaming,
    streamingHtml,
    statusLabel,
    sessionId,
    section,
    quickPrompts,
    sendMessage,
    sendQuickPrompt,
    ragSearch,
    navigateTo,
    scrollToBottom,
    retryLastMessage,
    copyMessageContent,
    resetSession,
    dispose,
  };
}

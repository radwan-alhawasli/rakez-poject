/**
 * عميل واجهة المساعد الذكي الإصدار الثاني
 * يستخدم apiClient الحالي (نفس عنوان الخادم ورمز Bearer).
 * نقاط الوصول: POST /ai/v2/chat، POST /ai/v2/search، POST /ai/v2/explain-access
 */

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import secureStorage from '@/utils/secureStorage';
import appConfig from '@/config/appConfig';

/** رسائل المستخدم للحالات 403/503 (عربي) */
export const AI_V2_MESSAGES = {
  FORBIDDEN: 'لا يمكنك استخدام المساعد الذكي. تواصل مع المسؤول.',
  UNAVAILABLE: 'المساعد الذكي غير متاح حالياً. حاول لاحقاً.',
};

/**
 * إعادة إلقاء الخطأ مع رمز الحالة والبيانات للتعامل معه في الواجهة
 * @param {Error} err
 * @returns {never}
 */
function rethrowWithStatus(err) {
  const status = err.response?.status ?? err.status ?? null;
  const apiError = err instanceof Error ? err : new Error(err?.message || 'فشل طلب المساعد الذكي');
  apiError.status = status;
  apiError.data = err.response?.data ?? err.data;
  apiError.response = err.response;
  throw apiError;
}

/**
 * دردشة V2
 * POST /ai/v2/chat
 * @param {string} message - رسالة المستخدم
 * @param {string|null} sessionId - معرّف الجلسة الاختياري للاستمرارية
 * @param {Object} pageContext - { route, entity_id, entity_type, filters }
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export async function chat(message, sessionId = null, pageContext = {}) {
  try {
    logger.debug('دردشة V2:', { message, sessionId, pageContext });
    const response = await apiClient.post('/ai/v2/chat', {
      message,
      session_id: sessionId,
      page_context: pageContext,
    });
    return response.data;
  } catch (err) {
    rethrowWithStatus(err);
  }
}

/**
 * بحث RAG فقط
 * POST /ai/v2/search
 * @param {string} query - نص البحث
 * @param {Object} filters - فلاتر اختيارية
 * @param {number} limit - حد النتائج
 * @returns {Promise<Array>} قائمة المصادر
 */
export async function search(query, filters = {}, limit = 10) {
  try {
    logger.debug('بحث V2:', { query, filters, limit });
    const response = await apiClient.post('/ai/v2/search', {
      query,
      filters,
      limit,
    });
    const data = response.data?.data;
    return Array.isArray(data?.sources) ? data.sources : [];
  } catch (err) {
    rethrowWithStatus(err);
  }
}

/**
 * شرح الصلاحيات
 * POST /ai/v2/explain-access
 * @param {string} route - المسار المراد شرحه (مثال: /api/marketing/leads)
 * @param {string|null} entityType - نوع الكيان
 * @param {number|null} entityId - معرّف الكيان
 * @returns {Promise<Object>} { allowed, missing_permissions, human_reason, suggested_routes }
 */
export async function explainAccess(route, entityType = null, entityId = null) {
  try {
    logger.debug('شرح الصلاحيات V2:', { route, entityType, entityId });
    const response = await apiClient.post('/ai/v2/explain-access', {
      route,
      entity_type: entityType || undefined,
      entity_id: entityId ?? undefined,
    });
    return response.data?.data ?? {};
  } catch (err) {
    rethrowWithStatus(err);
  }
}

/**
 * @param {string} buffer - Raw SSE text
 * @returns {{ events: Array<{event: string, data: string}>, remainder: string }}
 */
export function parseSSE(buffer) {
  const blocks = buffer.split('\n\n');
  const remainder = blocks.pop();
  const events = [];
  for (const block of blocks) {
    if (!block.trim()) continue;
    let event = 'message';
    const dataLines = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event: ')) {
        event = line.slice(7);
      } else if (line.startsWith('data: ')) {
        dataLines.push(line.slice(6));
      }
    }
    if (dataLines.length > 0) {
      events.push({ event, data: dataLines.join('\n') });
    }
  }
  return { events, remainder };
}

/**
 * Streaming chat via SSE
 * POST /ai/v2/chat/stream
 * @param {string} message
 * @param {string|null} sessionId
 * @param {Object} pageContext
 * @param {Object} callbacks - { onStatus, onDelta, onDone, onMeta, onError }
 * @param {AbortSignal} [signal]
 */
export async function chatStream(
  message,
  sessionId = null,
  pageContext = {},
  callbacks = {},
  signal
) {
  const { onStatus, onDelta, onDone, onMeta, onError } = callbacks;
  const token = secureStorage.getToken();
  const baseUrl = appConfig.apiBaseUrl;

  const response = await fetch(`${baseUrl}/ai/v2/chat/stream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      page_context: pageContext,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    sseBuffer += decoder.decode(value, { stream: true });
    const { events, remainder } = parseSSE(sseBuffer);
    sseBuffer = remainder;

    for (const evt of events) {
      let parsed;
      try {
        parsed = JSON.parse(evt.data);
      } catch {
        parsed = {};
      }

      switch (evt.event) {
        case 'status':
          onStatus?.(parsed);
          break;
        case 'delta':
          onDelta?.(parsed);
          break;
        case 'meta':
          onMeta?.(parsed);
          break;
        case 'error':
          onError?.(parsed);
          break;
        case 'done':
          onDone?.(parsed);
          break;
      }
    }
  }
}

export default {
  chat,
  search,
  explainAccess,
  chatStream,
  parseSSE,
  AI_V2_MESSAGES,
};

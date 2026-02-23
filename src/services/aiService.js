import apiClient from '../api/apiClient';
import logger from '../utils/logger';
import { handleServiceError } from '../utils/serviceErrorHandler';
import { extractPaginatedData } from '../utils/paginationUtils';

/**
 * خدمة المساعد الذكي
 * التكامل مع واجهة برمجة التطبيقات لميزات الذكاء الاصطناعي
 */
const aiService = {
  /**
   * سؤال مباشر (بدون سجل جلسة)
   * POST /api/ai/ask
   * @param {Object} payload - بيانات السؤال
   * @returns {Promise<Object>} الإجابة
   */
  async askQuestion(payload) {
    try {
      logger.debug('سؤال مباشر:', payload);
      const response = await apiClient.post('/ai/ask', payload);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'سؤال مباشر', 'post');
    }
  },

  /**
   * دردشة (مع سجل الجلسة)
   * POST /api/ai/chat
   * @param {Object} payload - بيانات الدردشة
   * @returns {Promise<Object>} الرد
   */
  async chat(payload) {
    try {
      logger.debug('دردشة:', payload);
      const response = await apiClient.post('/ai/chat', payload);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'دردشة', 'post');
    }
  },

  /**
   * جلب سجل المحادثات
   * GET /api/ai/v2/conversations  <-- تحديث المسار بناءً على رسالتك
   * @param {number} [perPage=20] - عدد النتائج بالصفحة (الحد الأقصى 100)
   * @param {string|null} [section] - تصفية حسب قسم المساعد الذكي
   * @returns {Promise<{ items: Array, pagination: Object }>}
   */
  async getConversations(perPage = 20, section = null) {
    try {
      logger.debug('جلب المحادثات...');
      const params = { per_page: perPage };
      if (section) params.section = section;
      const response = await apiClient.get('/ai/v2/conversations', { params });

      let { items, total } = extractPaginatedData(response);

      // استخراج بديل للطوارئ إذا كانت البنية غير مدعومة في extractPaginatedData
      if (!items || items.length === 0) {
        const raw = response.data?.data || response.data || {};
        if (Array.isArray(raw)) items = raw;
        else if (Array.isArray(raw.conversations)) items = raw.conversations;
        else if (Array.isArray(raw.items)) items = raw.items;
        else if (Array.isArray(raw.history)) items = raw.history;
      }

      logger.debug('المحادثات المسترجعة:', items?.length);

      return {
        items: items || [],
        pagination: { total: total || items?.length || 0 },
      };
    } catch (error) {
      return (
        handleServiceError(error, 'جلب المحادثات', 'get') || {
          items: [],
          pagination: { total: 0 },
        }
      );
    }
  },

  /**
   * جلب محادثة واحدة بالتفصيل (تاريخ الرسائل)
   * GET /api/ai/v2/conversations/:sessionId/messages  <-- تحديث المسار بناءً على رسالتك
   * @param {string} sessionId - معرّف الجلسة
   * @returns {Promise<Object>} المحادثة مع رسائلها
   */
  async getConversation(sessionId) {
    try {
      logger.debug('جلب محادثة...', sessionId);
      const response = await apiClient.get(`/ai/v2/conversations/${sessionId}/messages`);
      return response.data?.data || response.data || {};
    } catch (error) {
      if (
        error?.response?.status === 405 ||
        error?.status === 405 ||
        (error?.response?.status === 404 &&
          error?.response?.config?.url?.includes('/conversations/'))
      ) {
        // إذا كان الخادم لا يدعم GET
        logger.warn(
          'طريقة GET غير مدعومة لجلب محادثة (تم اصطياد خطأ 405/404). هذا المسار قد لا يكون متوفراً في الـ Backend.'
        );
        return { messages: [] };
      }
      return handleServiceError(error, 'جلب محادثة', 'get');
    }
  },

  /**
   * حذف محادثة
   * DELETE /api/ai/v2/conversations/:sessionId  <-- تحديث المسار بناءً على رسالتك
   * @param {string} sessionId - معرّف الجلسة
   * @returns {Promise<Object>} الاستجابة
   */
  async deleteConversation(sessionId) {
    try {
      logger.debug('حذف محادثة', sessionId);
      const response = await apiClient.delete(`/ai/v2/conversations/${sessionId}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'حذف محادثة', 'delete');
    }
  },

  /**
   * جلب الأقسام المتاحة
   * GET /api/ai/sections
   * @returns {Promise<Array>} قائمة الأقسام
   */
  async getAvailableSections() {
    try {
      logger.debug('جلب أقسام المساعد الذكي...');
      const response = await apiClient.get('/ai/sections');
      const data = response.data?.data ?? response.data;
      return data === null || data === undefined ? [] : Array.isArray(data) ? data : [];
    } catch (error) {
      return handleServiceError(error, 'جلب أقسام المساعد الذكي', 'get', []);
    }
  },

  // --- مساعد المساعدة السياقي ---

  /**
   * دردشة مساعد المساعدة حسب السياق
   * POST /ai/assistant/chat
   * @param {Object} params
   * @param {string} params.message - رسالة المستخدم (مطلوب، الحد الأقصى 6000 حرف)
   * @param {string} [params.module] - سياق القسم الحالي (مثل: 'contracts', 'hr')
   * @param {string} [params.page_key] - مفتاح الصفحة الحالية (مثل: 'contracts.create')
   * @param {string} [params.language='ar'] - لغة الرد (ar|en)
   * @param {number|null} [params.conversation_id] - معرّف المحادثة للاستمرار فيها
   * @returns {Promise<Object>} { reply, conversation_id, ... }
   */
  async assistantChat({ message, module, page_key, language = 'ar', conversation_id = null } = {}) {
    try {
      logger.debug('دردشة مساعد المساعدة:', {
        message,
        module,
        page_key,
        language,
        conversation_id,
      });
      const body = { message, language };
      if (module) body.module = module;
      if (page_key) body.page_key = page_key;
      if (conversation_id != null) body.conversation_id = conversation_id;
      const response = await apiClient.post('/ai/assistant/chat', body);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'دردشة مساعد المساعدة', 'post');
    }
  },

  /**
   * جلب مقالات قاعدة المعرفة (مع ترقيم الصفحات)
   * GET /ai/assistant/knowledge
   * @param {Object} params - module, language, is_active, page, per_page, search
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async getKnowledge(params = {}) {
    try {
      logger.debug('جلب مقالات قاعدة المعرفة...');
      const response = await apiClient.get('/ai/assistant/knowledge', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return (
        handleServiceError(error, 'جلب مقالات قاعدة المعرفة', 'get') || {
          items: [],
          total: 0,
        }
      );
    }
  },

  /**
   * إنشاء مقال في قاعدة المعرفة
   * POST /ai/assistant/knowledge
   * @param {Object} data - { module, title, content_md, language, tags, is_active, priority }
   * @returns {Promise<Object>} المقال المنشأ
   */
  async createKnowledge(data) {
    try {
      logger.debug('إنشاء مقال قاعدة المعرفة:', data);
      const response = await apiClient.post('/ai/assistant/knowledge', data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, 'إنشاء مقال قاعدة المعرفة', 'post');
    }
  },

  /**
   * تحديث مقال في قاعدة المعرفة
   * PUT /ai/assistant/knowledge/:id
   * @param {number|string} id - معرّف المقال
   * @param {Object} data - بيانات التحديث
   * @returns {Promise<Object>} المقال المحدّث
   */
  async updateKnowledge(id, data) {
    try {
      logger.debug(`تحديث مقال قاعدة المعرفة ${id}:`, data);
      const response = await apiClient.put(`/ai/assistant/knowledge/${id}`, data);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `تحديث مقال قاعدة المعرفة ${id}`, 'put');
    }
  },

  /**
   * حذف مقال من قاعدة المعرفة
   * DELETE /ai/assistant/knowledge/:id
   * @param {number|string} id - معرّف المقال
   * @returns {Promise<Object>} الاستجابة
   */
  async deleteKnowledge(id) {
    try {
      logger.debug(`حذف مقال قاعدة المعرفة ${id}`);
      const response = await apiClient.delete(`/ai/assistant/knowledge/${id}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      return handleServiceError(error, `حذف مقال قاعدة المعرفة ${id}`, 'delete');
    }
  },
};

export default aiService;

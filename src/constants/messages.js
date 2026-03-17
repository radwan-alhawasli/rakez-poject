/**
 * Centralized user-facing messages (Arabic).
 * Use for toasts, fallback error messages, and loading labels.
 */

/** @type {string} General error/success/loading messages */
export const MSG_ERROR = 'حدث خطأ';
export const MSG_SUCCESS = 'تمت العملية بنجاح';
export const MSG_SAVED = 'تم الحفظ بنجاح';
export const MSG_LOADING = 'جاري التحميل';
export const MSG_SAVING = 'جاري الحفظ';
export const MSG_SERVER_ERROR = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';

/** @type {string} Contextual fallbacks for showApiError / useAsyncAction */
export const MSG_ERROR_LOADING = 'حدث خطأ أثناء التحميل';
export const MSG_ERROR_SAVING = 'حدث خطأ أثناء الحفظ';
export const MSG_ERROR_DELETING = 'حدث خطأ أثناء الحذف';
export const MSG_ERROR_GENERIC = 'حدث خطأ أثناء تنفيذ العملية';

const messages = {
  MSG_ERROR,
  MSG_SUCCESS,
  MSG_SAVED,
  MSG_LOADING,
  MSG_SAVING,
  MSG_SERVER_ERROR,
  MSG_ERROR_LOADING,
  MSG_ERROR_SAVING,
  MSG_ERROR_DELETING,
  MSG_ERROR_GENERIC,
};

export default messages;

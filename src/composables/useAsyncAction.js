/**
 * Composable for async actions with loading state and toast feedback.
 * Reduces repetition of try/catch + loading + toast.success/error.
 */

import { ref } from 'vue';
import { toast } from '@/composables/useToast';
import { showApiError, getApiErrorMessage } from '@/utils/errorHandler';
import { MSG_ERROR_GENERIC } from '@/constants/messages';

/**
 * @param {Object} [options] - Options
 * @param {string} [options.loadingKey='isLoading'] - Name of the loading ref (e.g. 'isLoading', 'isSaving', 'isGeneratingClaimFile')
 * @returns {{ run, [loadingKey]: Ref<boolean>, resetLoading, getApiErrorMessage }}
 */
export function useAsyncAction(options = {}) {
  const loadingKey = options.loadingKey || 'isLoading';
  const loading = ref(false);

  /**
   * Run an async function with loading state and optional toast messages.
   * @param {Function} fn - Async function (no args, or pass args via run(() => apiCall(a,b)))
   * @param {Object} [runOptions] - Options
   * @param {string} [runOptions.successMessage] - Toast success message (if provided, shown on success)
   * @param {string} [runOptions.errorMessage] - Fallback error message for toast (default: MSG_ERROR_GENERIC)
   * @param {boolean} [runOptions.showLoading=true] - Whether to set loading to true during execution
   * @returns {Promise<*>} Result of fn, or undefined on error
   */
  const run = async (fn, runOptions = {}) => {
    const {
      successMessage = null,
      errorMessage = MSG_ERROR_GENERIC,
      showLoading = true,
    } = runOptions;

    if (showLoading) loading.value = true;
    try {
      const result = await fn();
      if (successMessage != null && successMessage !== '') {
        toast.success(successMessage);
      }
      return result;
    } catch (err) {
      showApiError(err, errorMessage);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  const resetLoading = () => {
    loading.value = false;
  };

  const out = { run, resetLoading, getApiErrorMessage };
  out[loadingKey] = loading;
  return out;
}

export default useAsyncAction;

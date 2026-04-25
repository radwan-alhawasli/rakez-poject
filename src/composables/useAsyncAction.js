/**
 * Composable for async actions with loading state and toast feedback.
 * Reduces repetition of try/catch + loading + toast.success/error.
 */

import { ref } from 'vue';
import { toast } from '@/composables/useToast';
import { showApiError, getApiErrorMessage } from '@/utils/errorHandler';
import { MSG_ERROR_GENERIC } from '@/constants/messages';

/**
 * @param {any} [options] - Options
 * @returns {{ run: Function, resetLoading: Function, getApiErrorMessage: Function, [key: string]: any }}
 */
export function useAsyncAction(options = {}) {
  const loadingKey = options.loadingKey || 'isLoading';
  const loading = ref(false);

  /**
   * Run an async function with loading state and optional toast messages.
   * @param {Function} fn - Async function (no args, or pass args via run(() => apiCall(a,b)))
   * @param {any} [runOptions] - Options
   * @returns {Promise<any>} Result of fn, or undefined on error
   */
  const run = async (fn, runOptions = {}) => {
    const {
      successMessage = null,
      errorMessage = MSG_ERROR_GENERIC,
      showLoading = true,
    } = /** @type {any} */ (runOptions);

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

  /** @type {any} */
  const out = { run, resetLoading, getApiErrorMessage };
  out[loadingKey] = loading;
  return out;
}

export default useAsyncAction;

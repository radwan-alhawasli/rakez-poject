/**
 * Error Handling Composable
 * Provides error handling functionality for Vue components
 */

import { ref } from 'vue';
import { handleError, retryWithBackoff, getApiErrorMessage } from '@/utils/errorHandler';
import { toast } from '@/composables/useToast';

/**
 * Error handling composable
 * @param {Object} options - Options
 * @returns {Object} Error handling utilities
 */
export function useError(options = {}) {
  const { showNotifications = true, autoLog = true } = options;

  const error = ref(null);
  const isLoading = ref(false);
  const isRetrying = ref(false);

  /**
   * Handle error and show notification
   * @param {Error} err - Error object
   * @param {Object} context - Additional context
   */
  const handle = (err, context = {}) => {
    error.value = err;

    const errorInfo = handleError(err, {
      context,
      showNotification: showNotifications,
      log: autoLog,
    });

    return errorInfo;
  };

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Execute function with error handling
   * @param {Function} fn - Function to execute
   * @param {Object} options - Options
   * @returns {Promise} Function result
   */
  const execute = async (fn, execOptions = {}) => {
    const { showLoading = true, retry = false, retryOptions = {} } = execOptions;

    clearError();

    if (showLoading) {
      isLoading.value = true;
    }

    try {
      if (retry) {
        isRetrying.value = true;
        const result = await retryWithBackoff(fn, retryOptions);
        return result;
      } else {
        return await fn();
      }
    } catch (err) {
      return handle(err, { function: fn.name });
    } finally {
      isLoading.value = false;
      isRetrying.value = false;
    }
  };

  /**
   * Create error handler for async operations
   * @param {Function} fn - Async function
   * @returns {Function} Wrapped function with error handling
   */
  const wrap = fn => {
    return async (...args) => {
      return execute(() => fn(...args));
    };
  };

  /**
   * Show API error as toast (use in catch blocks: catch (err) { showApiError(err); })
   * @param {Error} err - Caught error
   * @param {string} [fallback] - Optional fallback message
   */
  const showApiError = (err, fallback) => {
    const msg = getApiErrorMessage(err, fallback);
    if (msg) toast.error(msg);
  };

  return {
    error,
    isLoading,
    isRetrying,
    handle,
    clearError,
    execute,
    wrap,
    getApiErrorMessage,
    showApiError,
  };
}

export { getApiErrorMessage };
export default useError;

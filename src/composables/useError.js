/**
 * Error Handling Composable
 * Provides error handling functionality for Vue components
 */

import { ref } from 'vue';
import { handleError, retryWithBackoff, getApiErrorMessage, showApiError as showApiErrorUtil } from '@/utils/errorHandler';

/**
 * Error handling composable. Use for loading state, execute/wrap for async calls, and showApiError in catch blocks.
 * @param {Object} [options] - Options
 * @param {boolean} [options.showNotifications=true] - Whether to show toast on error
 * @param {boolean} [options.autoLog=true] - Whether to log errors
 * @returns {{ error, isLoading, isRetrying, handle, clearError, execute, wrap, getApiErrorMessage, showApiError }}
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

  /** Show API error as toast (delegates to centralized showApiError in errorHandler). */
  const showApiError = showApiErrorUtil;

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

export { getApiErrorMessage, showApiError };
export default useError;

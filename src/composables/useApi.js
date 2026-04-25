/**
 * API Composable – reusable API calls with loading state and error handling (delegates to useError).
 * Use call() or createCall() for requests that return response data.
 */

import { useError } from './useError';

/**
 * @param {Object} [options] - Passed to useError (e.g. showNotifications, autoLog)
 * @returns {{ call: Function, createCall: Function, isLoading: import('vue').Ref<boolean>, error: import('vue').Ref<any>, handle: Function }}
 */
export function useApi(options = {}) {
  const { handle, execute, isLoading, error } = useError(options);

  /**
   * Make API call with error handling
   * @param {Function} apiCall - API call function
   * @param {any} [callOptions] - Call options
   * @returns {Promise<any>} API response
   */
  const call = async (apiCall, callOptions = {}) => {
    const { retry = false, retryOptions = {}, showLoading = true } = /** @type {any} */ (callOptions);

    return execute(
      async () => {
        const response = await apiCall();
        return response?.data || response;
      },
      {
        retry,
        retryOptions,
        showLoading,
      }
    );
  };

  /**
   * Create API call wrapper
   * @param {Function} apiCall - API call function
   * @param {any} [callOptions] - Call options
   * @returns {Function} Wrapped API call
   */
  const createCall = (apiCall, callOptions = {}) => {
    return (/** @type {any[]} */ ...args) => call(() => apiCall(...args), callOptions);
  };

  return {
    call,
    createCall,
    isLoading,
    error,
    handle,
  };
}

export default useApi;

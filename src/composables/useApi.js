/**
 * API Composable
 * Provides reusable API call functionality with error handling
 */

import { useError } from './useError';

/**
 * API composable
 * @param {Object} options - Options
 * @returns {Object} API utilities
 */
export function useApi(options = {}) {
  const { handle, execute, isLoading, error } = useError(options);

  /**
   * Make API call with error handling
   * @param {Function} apiCall - API call function
   * @param {Object} callOptions - Call options
   * @returns {Promise} API response
   */
  const call = async (apiCall, callOptions = {}) => {
    const { retry = false, retryOptions = {}, showLoading = true } = callOptions;

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
   * @param {Object} callOptions - Call options
   * @returns {Function} Wrapped API call
   */
  const createCall = (apiCall, callOptions = {}) => {
    return (...args) => call(() => apiCall(...args), callOptions);
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

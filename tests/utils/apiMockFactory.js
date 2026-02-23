/**
 * API Mock Factory
 * Creates axios mock adapters for testing API services
 *
 * Note: Mocks for dependencies should be set up in individual test files
 * to avoid conflicts and ensure proper isolation
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

/**
 * Create a new axios mock adapter
 * @param {Object} options - Configuration options
 * @param {Object} axiosInstance - Axios instance to mock (defaults to axios)
 * @returns {MockAdapter} Mock adapter instance
 */
export function createApiMock(options = {}, axiosInstance = axios) {
  const { delayResponse = 0 } = options;
  return new MockAdapter(axiosInstance, { delayResponse });
}

/**
 * Create mock response for successful API call
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Array} Mock response array [status, responseData]
 */
export function createSuccessResponse(data, status = 200) {
  // Return format: [statusCode, responseData]
  // The responseData will be in response.data when using axios
  return [status, data];
}

/**
 * Create mock response for error API call
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Array} Mock error response
 */
export function createErrorResponse(message = 'Error occurred', status = 400) {
  return [status, { success: false, message, errors: {} }];
}

/**
 * Create mock response for validation error
 * @param {Object} errors - Validation errors object
 * @param {number} status - HTTP status code
 * @returns {Array} Mock validation error response
 */
export function createValidationErrorResponse(errors, status = 422) {
  return [status, { success: false, message: 'Validation failed', errors }];
}

/**
 * Setup common API mocks
 * @param {MockAdapter} mock - Mock adapter instance
 */
export function setupCommonMocks(mock) {
  // Mock CSRF token endpoint
  mock.onGet('/sanctum/csrf-cookie').reply(200, {});

  // Mock 404 for unmatched routes
  mock.onAny().reply(config => {
    // eslint-disable-next-line no-console
    console.warn(`Unmatched API call: ${config.method.toUpperCase()} ${config.url}`);
    return [404, { success: false, message: 'Endpoint not found' }];
  });
}

/**
 * Reset all mocks
 * @param {MockAdapter} mock - Mock adapter instance
 */
export function resetMocks(mock) {
  mock.reset();
}

/**
 * Restore axios to original state
 * @param {MockAdapter} mock - Mock adapter instance
 */
export function restoreMocks(mock) {
  mock.restore();
}

export default {
  createApiMock,
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  setupCommonMocks,
  resetMocks,
  restoreMocks,
};

import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';

// ==================== Performance Tracking APIs (Mocked if not in Postman) ====================

/**
 * Get marketer performance data (api: GET /hr/marketers/performance)
 */
export const getMarketerPerformance = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/marketers/performance', { params });
    return response.data?.data ?? response.data ?? [];
  } catch (error) {
    logger.error('Error fetching marketer performance:', error);
    throw error;
  }
};

/**
 * Update marketer goal (no dedicated route in api.php; kept for backward compat, may no-op)
  * @param {any} marketerId
  * @param {any} goalData
 */
export const setMarketerGoal = async (marketerId, goalData) => {
  try {
    const response = await apiClient
      .post(`/hr/marketers/${marketerId}/goal`, goalData)
      .catch(() => ({ data: {} }));
    return response?.data ?? {};
  } catch (error) {
    logger.error(`Error setting goal for marketer ${marketerId}:`, error);
    throw error;
  }
};

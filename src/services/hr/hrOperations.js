import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

// ==================== Missing Endpoints ====================

/**
 * Refresh dashboard
 * POST /hr/dashboard/refresh
 */
export const refreshDashboard = async () => {
  try {
    const response = await apiClient.post('/hr/dashboard/refresh');
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error refreshing dashboard:', error);
    throw error;
  }
};

/**
 * Create team (HR endpoint)
 * POST /hr/teams
  * @param {any} teamData
 */
export const createHRTeam = async teamData => {
  try {
    const response = await apiClient.post('/hr/teams', teamData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error creating HR team:', error);
    throw error;
  }
};

/**
 * Update team (HR endpoint)
 * PUT /hr/teams/:id
  * @param {any} teamId
  * @param {any} teamData
 */
export const updateHRTeam = async (teamId, teamData) => {
  try {
    const response = await apiClient.put(`/hr/teams/${teamId}`, teamData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error updating HR team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Delete team (HR endpoint)
 * DELETE /hr/teams/:id
  * @param {any} teamId
 */
export const deleteHRTeam = async teamId => {
  try {
    const response = await apiClient.delete(`/hr/teams/${teamId}`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error deleting HR team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Assign member to team
 * POST /hr/teams/:id/members
 * @param {number|string} teamId - Team ID
 * @param {any} data - Body (e.g. user_id, role)
 */
export const assignTeamMember = async (teamId, data) => {
  try {
    const response = await apiClient.post(`/hr/teams/${teamId}/members`, data);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error assigning team member:', error);
    throw error;
  }
};

/**
 * Remove member from team
 * DELETE /hr/teams/:id/members/:userId
 * @param {number|string} teamId - Team ID
 * @param {number|string} userId - User ID to remove
 */
export const removeTeamMember = async (teamId, userId) => {
  try {
    const response = await apiClient.delete(`/hr/teams/${teamId}/members/${userId}`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error removing team member:', error);
    throw error;
  }
};

/**
 * Unwrap list payload from GET /hr/marketers/performance (array or { marketers|items|data }).
 */
function extractMarketerPerformanceList(response) {
  const raw = response?.data?.data ?? response?.data;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.marketers)) return raw.marketers;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.users)) return raw.users;
  }
  return [];
}

/**
 * List marketer performance
 * GET /hr/marketers/performance
 */
export const listMarketerPerformance = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/marketers/performance', { params });
    return extractMarketerPerformanceList(response);
  } catch (error) {
    logger.error('Error fetching marketer performance list:', error);
    throw error;
  }
};

/**
 * Show marketer performance details
 * GET /hr/marketers/:id/performance
  * @param {any} marketerId
 */
export const showMarketerPerformance = async marketerId => {
  try {
    const response = await apiClient.get(`/hr/marketers/${marketerId}/performance`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error fetching marketer performance ${marketerId}:`, error);
    throw error;
  }
};

/**
 * List users (HR)
 * GET /hr/users
 * @param {any} params - page, per_page, search, etc.
 * @returns {Promise<{ items: unknown[], total: number }>}
 */
export const listUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/users', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Create user
 * POST /hr/users
  * @param {any} userData
 */
export const createUser = async userData => {
  try {
    const response = await apiClient.post('/hr/users', userData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Show user details
 * GET /hr/users/:id
  * @param {any} userId
 */
export const showUser = async userId => {
  try {
    const response = await apiClient.get(`/hr/users/${userId}`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update user
 * PUT /hr/users/:id
  * @param {any} userId
  * @param {any} userData
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/hr/users/${userId}`, userData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Toggle user status
 * PATCH /hr/users/:id/status
 * @param {number|string} userId - User ID
 * @param {any} [data] - Optional body (e.g. reason)
 */
export const toggleUserStatus = async (userId, data = {}) => {
  try {
    const response = await apiClient.patch(`/hr/users/${userId}/status`, data);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error toggling user status:', error);
    throw error;
  }
};

/**
 * Delete user
 * DELETE /hr/users/:id
  * @param {any} userId
 */
export const deleteUser = async userId => {
  try {
    const response = await apiClient.delete(`/hr/users/${userId}`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * Upload user files
 * POST /hr/users/:id/files
 * @param {number|string} userId - User ID
 * @param {FormData} formData - File(s) to upload
 */
export const uploadUserFiles = async (userId, formData) => {
  try {
    const response = await apiClient.post(`/hr/users/${userId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error uploading user files:', error);
    throw error;
  }
};

/**
 * Get paginated warnings for a user
 * GET /hr/users/:user_id/warnings
 * @param {number|string} userId - User ID
 * @param {any} params - page, per_page, year, type
 * @returns {Promise<{ items: unknown[], total: number }>}
 */
export const getUserWarnings = async (userId, params = {}) => {
  try {
    const response = await apiClient.get(`/hr/users/${userId}/warnings`, { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  } catch (error) {
    return (
      handleServiceError(error, `Error fetching warnings for user ${userId}`, 'get') || {
        items: [],
        total: 0,
      }
    );
  }
};

/**
 * @deprecated Use getUserWarnings(userId, params) instead
 * List user warnings - requires userId
  * @param {any} userId
 */
export const listUserWarnings = async (userId, params = {}) => {
  return getUserWarnings(userId, params);
};

/**
 * Create warning for user
 * POST /hr/users/:user_id/warnings
  * @param {any} userId
  * @param {any} warningData
 */
export const createWarning = async (userId, warningData) => {
  try {
    const response = await apiClient.post(`/hr/users/${userId}/warnings`, warningData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error creating warning:', error);
    throw error;
  }
};

/**
 * Delete warning
 * DELETE /hr/warnings/:id
  * @param {any} warningId
 */
export const deleteWarning = async warningId => {
  try {
    const response = await apiClient.delete(`/hr/warnings/${warningId}`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error deleting warning ${warningId}:`, error);
    throw error;
  }
};

/**
 * Get paginated employment contracts for a user
 * GET /hr/users/:user_id/contracts
 * @param {number|string} userId - User ID
 * @param {any} params - page, per_page
 * @returns {Promise<{ items: unknown[], total: number }>}
 */
export const getUserContracts = async (userId, params = {}) => {
  try {
    const response = await apiClient.get(`/hr/users/${userId}/contracts`, { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  } catch (error) {
    return (
      handleServiceError(error, `Error fetching contracts for user ${userId}`, 'get') || {
        items: [],
        total: 0,
      }
    );
  }
};

/**
 * @deprecated Use getUserContracts(userId, params) instead
 * List user contracts - requires userId
  * @param {any} userId
 */
export const listUserContracts = async (userId, params = {}) => {
  return getUserContracts(userId, params);
};

/**
 * Create user contract
 * POST /hr/users/:user_id/contracts
  * @param {any} userId
  * @param {any} contractData
 */
export const createUserContract = async (userId, contractData) => {
  try {
    const response = await apiClient.post(`/hr/users/${userId}/contracts`, contractData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error creating user contract:', error);
    throw error;
  }
};

/**
 * Show HR contract
 * GET /hr/contracts/:id
  * @param {any} contractId
 */
export const showHRContract = async contractId => {
  try {
    const response = await apiClient.get(`/hr/contracts/${contractId}`);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error fetching HR contract ${contractId}:`, error);
    throw error;
  }
};

/**
 * Update HR contract
 * PUT /hr/contracts/:id
  * @param {any} contractId
  * @param {any} contractData
 */
export const updateHRContract = async (contractId, contractData) => {
  try {
    const response = await apiClient.put(`/hr/contracts/${contractId}`, contractData);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error updating HR contract ${contractId}:`, error);
    throw error;
  }
};

/**
 * Generate contract PDF
 * POST /hr/contracts/pdf
  * @param {any} contractId
 */
export const generateContractPDF = async contractId => {
  try {
    const response = await apiClient.post(
      `/hr/contracts/${contractId}/pdf`,
      {},
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    logger.error(`Error generating contract PDF ${contractId}:`, error);
    throw error;
  }
};

/**
 * Download contract PDF
 * GET /hr/contracts/pdf/:id
  * @param {any} contractId
 */
export const downloadContractPDF = async contractId => {
  try {
    const response = await apiClient.get(`/hr/contracts/${contractId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    logger.error(`Error downloading contract PDF ${contractId}:`, error);
    throw error;
  }
};

/**
 * Activate contract
 * POST /hr/contracts/activate
  * @param {any} contractId
 */
export const activateContract = async (contractId, data = {}) => {
  try {
    const response = await apiClient.post(`/hr/contracts/${contractId}/activate`, data);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error activating contract ${contractId}:`, error);
    throw error;
  }
};

/**
 * Terminate contract
 * POST /hr/contracts/terminate
  * @param {any} contractId
 */
export const terminateContract = async (contractId, data = {}) => {
  try {
    const response = await apiClient.post(`/hr/contracts/${contractId}/terminate`, data);
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error(`Error terminating contract ${contractId}:`, error);
    throw error;
  }
};

/**
 * Get team performance report
 * GET /hr/reports/team-performance
 */
export const getTeamPerformanceReport = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/reports/team-performance', { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error fetching team performance report:', error);
    throw error;
  }
};

/**
 * Get marketer performance report
 * GET /hr/reports/marketer-performance
 */
export const getMarketerPerformanceReport = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/reports/marketer-performance', { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error fetching marketer performance report:', error);
    throw error;
  }
};

/**
 * Get employee count report
 * GET /hr/reports/employee-count
 */
export const getEmployeeCountReport = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/reports/employee-count', { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    logger.error('Error fetching employee count report:', error);
    throw error;
  }
};

/**
 * Get expiring contracts report
 * GET /hr/reports/expiring-contracts
 */
export const getExpiringContractsReport = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/reports/expiring-contracts', { params });
    const contracts = response.data?.data || response.data || [];
    return Array.isArray(contracts) ? contracts : [];
  } catch (error) {
    logger.error('Error fetching expiring contracts report:', error);
    throw error;
  }
};

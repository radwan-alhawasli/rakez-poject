import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

// ==================== Team Management APIs ====================

/**
 * Get paginated HR teams with performance data.
 * Tries GET /hr/teams first; if backend returns 404 (route not in API collection),
 * falls back to GET /project_management/teams/index so HR view still gets teams.
 * @param {Object} params - page, per_page (1-100), year, month
 * @returns {Promise<{ items: Array, total: number }>}
 */
export const getTeams = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/teams', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items: items ?? [], total: total ?? 0 };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) {
      try {
        const fallback = await apiClient.get('/project_management/teams/index', { params });
        const { items, total } = extractPaginatedData(fallback, []);
        return { items: items ?? [], total: total ?? 0 };
      } catch (_) {
        return { items: [], total: 0 };
      }
    }
    return handleServiceError(error, 'Error fetching HR teams', 'get') || { items: [], total: 0 };
  }
};

/**
 * Get HR team members (list)
 * GET /hr/teams/:id/members → HrTeamController::members
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Optional query params
 * @returns {Promise<Array>} List of team members
 */
export const getHRTeamMembers = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/hr/teams/${teamId}/members`, { params });
    const data = response?.data;
    const raw =
      data?.data ??
      data?.members ??
      data?.users ??
      data?.items ??
      (Array.isArray(data) ? data : []);
    const list = Array.isArray(raw) ? raw : [];
    return list;
  } catch (error) {
    return handleServiceError(error, `Error fetching team ${teamId} members`, 'get', []);
  }
};

/**
 * Get team details by ID
 * GET /teams/show/:id
 */
export const getTeamById = async teamId => {
  try {
    const response = await apiClient.get(`/teams/show/${teamId}`);
    return response.data.data || response.data;
  } catch (error) {
    logger.error(`Error fetching team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Create a new team
 * POST /project_management/teams/store
 */
export const createTeam = async teamData => {
  try {
    const response = await apiClient.post('/project_management/teams/store', teamData);
    return response.data;
  } catch (error) {
    logger.error('Error creating team:', error);
    throw error;
  }
};

/**
 * Update an existing team
 * PUT /project_management/teams/update/:id
 */
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await apiClient.put(`/project_management/teams/update/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    logger.error(`Error updating team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Delete a team
 * DELETE /project_management/teams/delete/:id
 */
export const deleteTeam = async teamId => {
  try {
    const response = await apiClient.delete(`/project_management/teams/delete/${teamId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error deleting team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Link marketers to team (api.php: POST hr/teams/{id}/members)
 */
export const linkMarketersToTeam = async (teamId, marketerIds) => {
  try {
    const response = await apiClient.post(`/hr/teams/${teamId}/members`, {
      user_ids: marketerIds,
    });
    return response.data;
  } catch (error) {
    logger.error(`Error linking marketers to team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get team contracts (projects)
 * GET /hr/teams/contracts/:id
 */
export const getTeamContracts = async teamId => {
  try {
    const response = await apiClient.get(`/hr/teams/contracts/${teamId}`);
    return response.data.data || response.data || [];
  } catch (error) {
    logger.error(`Error fetching contracts for team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get team contract locations by team ID
 * GET /hr/teams/contracts/locations/:id
 */
export const getTeamContractLocations = async teamId => {
  try {
    const response = await apiClient.get(`/hr/teams/contracts/locations/${teamId}`);
    return response.data.data || response.data || [];
  } catch (error) {
    logger.error(`Error fetching locations for team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get teams for a specific contract
 * GET /hr/teams/getTeamsForContract/:contractId
 */
export const getTeamsForContract = async contractId => {
  try {
    const response = await apiClient.get(`/hr/teams/getTeamsForContract/${contractId}`);
    return response.data.data || response.data || [];
  } catch (error) {
    logger.error(`Error fetching teams for contract ${contractId}:`, error);
    throw error;
  }
};

/**
 * Get team sales average
 * GET /hr/teams/sales-average/:teamId
 * Returns: { average_sales: { sold_units_per_sales_employee: number } }
 */
export const getTeamSalesAverage = async teamId => {
  try {
    const response = await apiClient.get(`/hr/teams/sales-average/${teamId}`);
    return response.data.data || response.data || {};
  } catch (error) {
    logger.error(`Error fetching sales average for team ${teamId}:`, error);
    throw error;
  }
};

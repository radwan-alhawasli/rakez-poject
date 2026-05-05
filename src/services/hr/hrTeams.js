import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { getCaughtStatus } from '@/utils/caughtError';

// ==================== Team Management APIs ====================

/**
 * Get paginated teams for HR views.
 * Primary route: GET /project_management/teams/index
 * Fallback route: GET /hr/teams
 * @param {any} params - page, per_page (1-100), year, month
 * @returns {Promise<{ items: unknown[], total: number }>}
 */
export const getTeams = async (params = {}) => {
  try {
    const hasSearch = Boolean(String(params?.search ?? '').trim());
    const endpoint = hasSearch ? '/teams/index' : '/hr/teams';
    const response = await apiClient.get(endpoint, {
      params,
      useCache: true,
      usePersistentCache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
    const { items, total } = extractPaginatedData(response, []);
    if (Array.isArray(items) && items.length) return { items, total: total ?? items.length };
    const data = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(data)) return { items: data, total: data.length };
    if (Array.isArray(data?.items)) return { items: data.items, total: data.total ?? data.items.length };
    if (Array.isArray(data?.teams)) return { items: data.teams, total: data.total ?? data.teams.length };
    return { items: [], total: 0 };
  } catch (error) {
    const status = getCaughtStatus(error);
    if (status === 404) {
      try {
        const fallback = await apiClient.get('/teams/index', {
          params,
          useCache: true,
          usePersistentCache: true,
          cacheTTL: 10 * 60 * 1000,
        });
        const { items, total } = extractPaginatedData(fallback, []);
        if (Array.isArray(items) && items.length) return { items, total: total ?? items.length };
        const data = fallback?.data?.data ?? fallback?.data ?? [];
        if (Array.isArray(data)) return { items: data, total: data.length };
        if (Array.isArray(data?.items)) return { items: data.items, total: data.total ?? data.items.length };
        if (Array.isArray(data?.teams)) return { items: data.teams, total: data.total ?? data.teams.length };
        return { items: [], total: 0 };
      } catch (_) {
        return { items: [], total: 0 };
      }
    }
    return handleServiceError(error, 'Error fetching HR teams', 'get') || { items: [], total: 0 };
  }
};

/**
 * Get team members (list)
 * Primary route: GET /project_management/teams/members/:id
 * Fallback route: GET /hr/teams/:id/members
 * @param {number|string} teamId - Team ID
 * @param {any} params - Optional query params
 * @returns {Promise<unknown[]>} List of team members
 */
export const getHRTeamMembers = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/hr/teams/${teamId}`, { params });
    const data = response?.data;
    const raw = data?.data?.members ?? data?.members ?? data?.users ?? data?.items ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(member => ({
      ...member,
      user_id: member?.user_id ?? member?.id ?? member?.user?.id ?? null,
    }));
  } catch (error) {
    const status = getCaughtStatus(error);
    if (status === 404) {
      try {
        const fallback = await apiClient.get(`/teams/show/${teamId}`, { params });
        const data = fallback?.data;
        const raw =
          data?.data?.members ??
          data?.members ??
          data?.users ??
          data?.items ??
          (Array.isArray(data) ? data : []);
        const list = Array.isArray(raw) ? raw : [];
        return list.map(member => ({
          ...member,
          user_id: member?.user_id ?? member?.id ?? member?.user?.id ?? null,
        }));
      } catch (_) {
        return [];
      }
    }
    return handleServiceError(error, `Error fetching team ${teamId} members`, 'get', []);
  }
};

/**
 * Get team details by ID.
 * Primary route: GET /project_management/teams/show/:id
 * Fallback route: GET /teams/show/:id
  * @param {any} teamId
 */
export const getTeamById = async teamId => {
  try {
    const response = await apiClient.get(`/teams/show/${teamId}`);
    return response.data?.data || response.data;
  } catch (error) {
    const status = getCaughtStatus(error);
    if (status === 404) {
      const fallback = await apiClient.get(`/hr/teams/${teamId}`);
      return fallback.data?.data || fallback.data;
    }
    logger.error(`Error fetching team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Create a new team
 * POST /project_management/teams/store
  * @param {any} teamData
 */
export const createTeam = async teamData => {
  try {
    const response = await apiClient.post('/hr/teams', teamData);
    return response.data;
  } catch (error) {
    logger.error('Error creating team:', error);
    throw error;
  }
};

/**
 * Update an existing team
 * PUT /project_management/teams/update/:id
  * @param {any} teamId
  * @param {any} teamData
 */
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await apiClient.put(`/hr/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    logger.error(`Error updating team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Delete a team
 * DELETE /project_management/teams/delete/:id
  * @param {any} teamId
 */
export const deleteTeam = async teamId => {
  try {
    const response = await apiClient.delete(`/hr/teams/${teamId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error deleting team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Link marketers to team (api.php: POST hr/teams/{id}/members)
  * @param {any} teamId
  * @param {any} marketerIds
 */
export const linkMarketersToTeam = async (teamId, marketerIds) => {
  const rows = Array.isArray(marketerIds) ? marketerIds : [marketerIds];
  const members = rows
    .map(v => ({
      user_id: Number(v?.user_id ?? v?.id ?? v),
      team_group_id:
        v && typeof v === "object" && v.team_group_id != null && v.team_group_id !== ''
          ? String(v.team_group_id)
          : null,
    }))
    .filter(v => Number.isFinite(v.user_id) && v.user_id > 0);
  if (members.length === 0) return {};
  try {
    await Promise.all(
      members.map(member =>
        apiClient.post(`/hr/teams/${teamId}/members`, {
          user_id: member.user_id,
          team_group_id: member.team_group_id,
        })
      )
    );
    return { success: true };
  } catch (error) {
    logger.error(`Error linking marketers to team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get team contracts (projects)
 * Primary route: GET /project_management/teams/contracts/:id
 * Fallback route: GET /hr/teams/contracts/:id
  * @param {any} teamId
 */
export const getTeamContracts = async teamId => {
  try {
    const response = await apiClient.get(`/project_management/teams/contracts/${teamId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    const status = getCaughtStatus(error);
    if (status === 404) {
      const fallback = await apiClient.get(`/hr/teams/contracts/${teamId}`);
      return fallback.data?.data || fallback.data || [];
    }
    logger.error(`Error fetching contracts for team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get team contract locations by team ID
 * Primary route: GET /project_management/teams/contracts/locations/:id
 * Fallback route: GET /hr/teams/contracts/locations/:id
  * @param {any} teamId
 */
export const getTeamContractLocations = async teamId => {
  try {
    const response = await apiClient.get(`/project_management/teams/contracts/locations/${teamId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    const status = getCaughtStatus(error);
    if (status === 404) {
      const fallback = await apiClient.get(`/hr/teams/contracts/locations/${teamId}`);
      return fallback.data?.data || fallback.data || [];
    }
    logger.error(`Error fetching locations for team ${teamId}:`, error);
    throw error;
  }
};

/**
 * Get teams for a specific contract
 * Primary route: GET /project_management/teams/index/:contractId
 * Fallback route: GET /hr/teams/getTeamsForContract/:contractId
  * @param {any} contractId
 */
export const getTeamsForContract = async contractId => {
  try {
    const response = await apiClient.get(`/project_management/teams/index/${contractId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    const status = getCaughtStatus(error);
    if (status === 404) {
      const fallback = await apiClient.get(`/hr/teams/getTeamsForContract/${contractId}`);
      return fallback.data?.data || fallback.data || [];
    }
    logger.error(`Error fetching teams for contract ${contractId}:`, error);
    throw error;
  }
};

/**
 * Get team sales average
 * GET /hr/teams/sales-average/:teamId
 * Returns: { average_sales: { sold_units_per_sales_employee: number } }
  * @param {any} teamId
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

import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Team Service - Manages team operations
 *
 * POSTMAN HAS THREE TEAM MODULES:
 * 1. Project Management Teams: /project_management/teams/* (index, store, show, update, delete, add, remove, contracts, contracts/locations)
 *    - Use for: Project Tracker, assigning teams to contracts, team CRUD
 * 2. HR Teams: /hr/teams/* (paginated list, members) - Use hrService.getTeams(), hrService.getHRTeamMembers()
 *    - Use for: HR dashboard, performance metrics, staff teams
 * 3. Teams Management: /teams/* (list, contracts, locations, members, stats, performance, sales-average)
 *    - Use for: Standalone teams module, team analytics
 */

// --- Project Management Dashboard ---

/**
 * Get project management dashboard
 * GET /project_management/dashboard
 * @param {Object} params - Query parameters (date ranges, filters)
 * @returns {Promise<Object>} Dashboard data with KPIs and statistics
 */
export const getProjectManagementDashboard = async (params = {}) => {
  try {
    const response = await apiClient.get('/project_management/dashboard', { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, 'Fetch project management dashboard', 'get', {});
  }
};

/**
 * Get units statistics
 * GET /project_management/dashboard/units-statistics
 * @param {Object} params - Query parameters (date ranges, filters)
 * @returns {Promise<Object>} Units statistics data
 */
export const getUnitsStatistics = async (params = {}) => {
  try {
    const response = await apiClient.get('/project_management/dashboard/units-statistics', {
      params,
    });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, 'Fetch units statistics', 'get', {});
  }
};

/**
 * Get all teams (Project Management module) – used for dropdown / list of teams to assign
 * GET {{base_url}}/project_management/teams/index
 * @param {string|Object} searchOrParams - Search string or params object { search, page, per_page }
 * @returns {Promise<Array>} List of teams
 */
export const getTeams = async (searchOrParams = '') => {
  try {
    const params =
      typeof searchOrParams === 'string'
        ? searchOrParams
          ? { search: searchOrParams }
          : {}
        : { ...searchOrParams };
    const response = await apiClient.get('/project_management/teams/index', { params });
    const { items } = extractPaginatedData(response, []);
    let list = Array.isArray(items) ? items : [];
    if (list.length === 0) {
      const data = response?.data ?? response;
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.teams)) list = data.teams;
    }
    return list;
  } catch (error) {
    return handleServiceError(error, 'Fetch teams', 'get', []);
  }
};

/**
 * Create a new team
 * POST /project_management/teams/store
 * @param {Object} teamData - Team data (name, description, etc.)
 * @returns {Promise<Object>} Created team
 */
export const createTeam = async teamData => {
  try {
    const response = await apiClient.post('/project_management/teams/store', teamData);
    return response.data;
  } catch (error) {
    return handleServiceError(error, 'Create team', 'post');
  }
};

/**
 * Update an existing team
 * PUT /project_management/teams/update/:id
 * @param {number|string} id - Team ID
 * @param {Object} teamData - Update data (name, description, etc.)
 * @returns {Promise<Object>} Updated team
 */
export const updateTeam = async (id, teamData) => {
  try {
    const response = await apiClient.put(`/project_management/teams/update/${id}`, teamData);
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Update team ${id}`, 'put');
  }
};

/**
 * Get team details by ID
 * GET /project_management/teams/show/:id
 */
export const getTeamById = async id => {
  try {
    const response = await apiClient.get(`/project_management/teams/show/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    return handleServiceError(error, `Fetch team ${id}`, 'get', null);
  }
};

/**
 * Delete a team
 * DELETE /project_management/teams/delete/:id
 */
export const deleteTeam = async id => {
  try {
    const response = await apiClient.delete(`/project_management/teams/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Delete team ${id}`, 'delete');
  }
};

/**
 * Get contracts assigned to a specific team
 * GET /project_management/teams/contracts/:id
 * @param {number|string} id - Team ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of contracts
 */
export const getTeamContracts = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/project_management/teams/contracts/${id}`, { params });
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Fetch contracts for team ${id}`, 'get', []);
  }
};

/**
 * Get contract locations for a specific team
 * GET /project_management/teams/contracts/locations/:id
 * @param {number|string} id - Team ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of contract locations
 */
export const getTeamContractLocations = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/project_management/teams/contracts/locations/${id}`, {
      params,
    });
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Fetch contract locations for team ${id}`, 'get', []);
  }
};

/**
 * Add teams to a contract
 * POST /project_management/teams/add/:contract_id
 * @param {number|string} contractId - Contract ID
 * @param {Array<number|string>} teamIds - Array of team IDs
 * @returns {Promise<Object>} Assignment result
 */
export const addTeamsToContract = async (contractId, teamIds) => {
  try {
    const response = await apiClient.post(`/project_management/teams/add/${contractId}`, {
      team_ids: teamIds,
    });
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Add teams to contract ${contractId}`, 'post');
  }
};

/**
 * Remove teams from a contract
 * POST /project_management/teams/remove/:contract_id
 * @param {number|string} contractId - Contract ID
 * @param {Array<number|string>} teamIds - Array of team IDs to remove
 * @returns {Promise<Object>} Removal result
 */
export const removeTeamsFromContract = async (contractId, teamIds) => {
  try {
    const response = await apiClient.post(`/project_management/teams/remove/${contractId}`, {
      team_ids: teamIds,
    });
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Remove teams from contract ${contractId}`, 'post');
  }
};

/**
 * Get teams assigned to a specific contract
 * Tries project_management first (same source as add/remove), then fallback to project_teams
 * GET /project_management/teams/index/:contractId | GET /project_teams/teams/:contractId
 * @param {number|string} contractId - Contract ID
 * @returns {Promise<Array>} List of teams assigned to contract
 */
export const getContractTeams = async contractId => {
  const toItems = response => {
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  };
  try {
    const response = await apiClient.get(`/project_management/teams/index/${contractId}`);
    return toItems(response);
  } catch (error) {
    return handleServiceError(error, `Fetch teams for contract ${contractId}`, 'get', []);
  }
};

// --- Project Teams API (assign project to team) ---

/**
 * Get teams assigned to a project (by contract/project id)
 * GET {{base_url}}/project_management/teams/index/:contract_id
 * @param {number|string} contractId - Project/contract ID
 * @returns {Promise<Array>} List of assigned teams (items may include project_team_id for remove)
 */
export const getProjectTeams = async contractId => {
  try {
    const response = await apiClient.get(`/project_management/teams/index/${contractId}`);
    const raw = response?.data ?? response;
    let data = raw?.data ?? raw;
    if (!Array.isArray(data) && Array.isArray(raw?.teams)) data = raw.teams;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return handleServiceError(error, `Fetch project teams ${contractId}`, 'get', []);
  }
};

/**
 * Assign teams to a project
 * POST {{server}}/project_teams/teams/add/:projectId
 * Body: { team_ids: [1] }
 * @param {number|string} projectId - Project ID
 * @param {Array<number|string>} teamIds - Team IDs to assign
 * @returns {Promise<Object>}
 */
export const addProjectTeams = async (projectId, teamIds) => {
  try {
    const response = await apiClient.post(`/project_teams/teams/add/${projectId}`, {
      team_ids: teamIds,
    });
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Add teams to project ${projectId}`, 'post');
  }
};

/**
 * Remove a team assignment from a project
 * DELETE {{server}}/project_teams/teams/remove/:projectTeamId
 * @param {number|string} projectTeamId - Project-team assignment ID (from getProjectTeams item.id or project_team_id)
 * @returns {Promise<Object>}
 */
export const removeProjectTeam = async projectTeamId => {
  try {
    const response = await apiClient.delete(`/project_teams/teams/remove/${projectTeamId}`);
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Remove project team ${projectTeamId}`, 'delete');
  }
};

/**
 * Get team contracts (api.php: GET project_management/teams/contracts/{teamId})
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 */
export const getTeamContractsByTeamId = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/project_management/teams/contracts/${teamId}`, {
      params,
    });
    const contracts = response.data?.data || response.data || [];
    return Array.isArray(contracts) ? contracts : [];
  } catch (error) {
    return handleServiceError(error, `Fetch contracts for team ${teamId}`, 'get', []);
  }
};

/**
 * Get contract count for team
 * GET /teams/contracts/count/:teamId
 * @param {number|string} teamId - Team ID
 */
export const getContractCount = async teamId => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/contracts/count`);
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch contract count for team ${teamId}`, 'get', {});
  }
};

/**
 * Get team locations
 * GET /teams/locations/:teamId
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 */
export const getTeamLocations = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/locations`, { params });
    const locations = response.data?.data || response.data || [];
    return Array.isArray(locations) ? locations : [];
  } catch (error) {
    return handleServiceError(error, `Fetch locations for team ${teamId}`, 'get', []);
  }
};

/**
 * Assign location to team
 * POST /teams/locations
 * @param {number|string} teamId - Team ID
 * @param {Object} data - Location assignment data
 */
export const assignLocation = async (teamId, data) => {
  try {
    const response = await apiClient.post(`/teams/${teamId}/locations`, data);
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Assign location to team ${teamId}`, 'post');
  }
};

/**
 * Get sales average for team
 * GET /teams/sales-average/:teamId
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 */
export const getSalesAverage = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/sales-average`, { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch sales average for team ${teamId}`, 'get', {});
  }
};

/**
 * Get team performance
 * GET /teams/performance/:teamId
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 */
export const getTeamPerformance = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/performance`, { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch performance for team ${teamId}`, 'get', {});
  }
};

/**
 * Get team members
 * GET /teams/members/:teamId
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 */
export const getTeamMembers = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/members`, { params });
    const members = response.data?.data || response.data || [];
    return Array.isArray(members) ? members : [];
  } catch (error) {
    return handleServiceError(error, `Fetch members for team ${teamId}`, 'get', []);
  }
};

/**
 * Get team statistics
 * GET /teams/stats/:teamId
 * @param {number|string} teamId - Team ID
 * @param {Object} params - Query parameters
 */
export const getTeamStats = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/stats`, { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch stats for team ${teamId}`, 'get', {});
  }
};

export default {
  // Project Management Dashboard
  getProjectManagementDashboard,
  getUnitsStatistics,
  // Teams
  getTeams,
  createTeam,
  updateTeam,
  getTeamById,
  deleteTeam,
  getTeamContracts,
  getTeamContractLocations,
  addTeamsToContract,
  removeTeamsFromContract,
  getContractTeams,
  getProjectTeams,
  addProjectTeams,
  removeProjectTeam,
  getTeamContractsByTeamId,
  getContractCount,
  getTeamLocations,
  assignLocation,
  getSalesAverage,
  getTeamPerformance,
  getTeamMembers,
  getTeamStats,
};

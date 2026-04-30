// @ts-nocheck
import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';
import {
  getProjectManagementReservations,
  getProjectManagementUnitReservationContext,
  createProjectManagementReservation,
  confirmProjectManagementReservation,
  cancelProjectManagementReservation,
  logProjectManagementReservationAction,
  downloadProjectManagementReservationVoucher,
  getProjectManagementReservationVoucherData,
  fetchProjectManagementReservationVoucherDataBlob,
} from '@/services/teamReservationService';

export {
  getProjectManagementReservations,
  getProjectManagementUnitReservationContext,
  createProjectManagementReservation,
  confirmProjectManagementReservation,
  cancelProjectManagementReservation,
  logProjectManagementReservationAction,
  downloadProjectManagementReservationVoucher,
  getProjectManagementReservationVoucherData,
  fetchProjectManagementReservationVoucherDataBlob,
};
// --- Project Management Dashboard ---
export const getProjectManagementDashboard = async (params = {}) => {
  try {
    const response = await apiClient.get('/project_management/dashboard', { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, 'Fetch project management dashboard', 'get', {});
  }
};
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
const resolveTeamsSource = options => (options?.source === 'hr' ? 'hr' : 'project_management');
const teamsBasePath = source => (source === 'hr' ? '/hr' : '/project_management');
const normalizeList = response => {
  const { items } = extractPaginatedData(response, []);
  if (Array.isArray(items) && items.length > 0) return items;
  const data = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.teams)) return data.teams;
  if (Array.isArray(data?.groups)) return data.groups;
  if (Array.isArray(data?.leaders)) return data.leaders;
  if (Array.isArray(data?.members)) return data.members;
  return [];
};

const normalizeDetail = response => response?.data?.data ?? response?.data ?? null;

export const getTeams = async (searchOrParams = '', options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const params =
      typeof searchOrParams === 'string'
        ? searchOrParams
          ? { search: searchOrParams }
          : {}
        : { ...searchOrParams };

    if (source === 'hr') {
      const hasSearch = Boolean(params?.search);
      const response = hasSearch
        ? await apiClient.get('/teams/index', { params })
        : await apiClient.get('/hr/teams', { params });
      return normalizeList(response);
    }

    const response = await apiClient.get('/project_management/teams/index', { params });
    return normalizeList(response);
  } catch (error) {
    return handleServiceError(error, 'Fetch teams', 'get', []);
  }
};

export const createTeam = async (teamData, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response =
      source === 'hr'
        ? await apiClient.post('/hr/teams', teamData)
        : await apiClient.post('/project_management/teams/store', teamData);
    return response.data;
  } catch (error) {
    return handleServiceError(error, 'Create team', 'post');
  }
};

export const updateTeam = async (id, teamData, options = {}) => {
  const source = resolveTeamsSource(options);
  if (source === 'hr') {
    try {
      const response = await apiClient.put(`/hr/teams/${id}`, teamData);
      return response.data;
    } catch (error) {
      return handleServiceError(error, `Update team ${id}`, 'put');
    }
  }

  try {
    const response = await apiClient.put(`/project_management/teams/update/${id}`, teamData);
    return response.data;
  } catch (_error) {
    try {
      const fallback = await apiClient.post(`/project_management/teams/update/${id}`, teamData);
      return fallback.data;
    } catch (fallbackError) {
      return handleServiceError(fallbackError, `Update team ${id}`, 'put');
    }
  }
};

export const getTeamById = async (id, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    if (source === 'hr') {
      let response;
      try {
        response = await apiClient.get(`/teams/show/${id}`);
      } catch (_) {
        response = await apiClient.get(`/hr/teams/${id}`);
      }
      return normalizeDetail(response);
    }

    const response = await apiClient.get(`/project_management/teams/show/${id}`);
    return normalizeDetail(response);
  } catch (error) {
    return handleServiceError(error, `Fetch team ${id}`, 'get', null);
  }
};

export const deleteTeam = async (id, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response =
      source === 'hr'
        ? await apiClient.delete(`/hr/teams/${id}`)
        : await apiClient.delete(`/project_management/teams/delete/${id}`);
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Delete team ${id}`, 'delete');
  }
};

export const createTeamGroup = async (data, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.post(`${teamsBasePath(source)}/team-groups`, data);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, 'Create team group', 'post');
  }
};

export const getTeamGroups = async (params = {}, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.get(`${teamsBasePath(source)}/team-groups`, { params });
    return normalizeList(response);
  } catch (error) {
    return handleServiceError(error, 'Fetch team groups', 'get', []);
  }
};

export const getTeamGroupById = async (teamGroupId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.get(`${teamsBasePath(source)}/team-groups/${teamGroupId}`);
    return normalizeDetail(response);
  } catch (error) {
    return handleServiceError(error, `Fetch team group ${teamGroupId}`, 'get', null);
  }
};

export const getTeamGroupMembers = async (teamGroupId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.get(`${teamsBasePath(source)}/team-groups/${teamGroupId}/members`);
    return normalizeList(response);
  } catch (error) {
    return handleServiceError(error, `Fetch team group ${teamGroupId} members`, 'get', []);
  }
};

export const removeTeamGroupMember = async (teamGroupId, userId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.delete(
      `${teamsBasePath(source)}/team-groups/${teamGroupId}/members/${userId}`
    );
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Remove member ${userId} from team group ${teamGroupId}`, 'delete');
  }
};

export const addTeamGroupMember = async (teamGroupId, userId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.post(`${teamsBasePath(source)}/team-groups/${teamGroupId}/members`, {
      user_id: Number(userId),
    });
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Add member ${userId} to team group ${teamGroupId}`, 'post');
  }
};

export const updateTeamGroup = async (teamGroupId, data, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.put(`${teamsBasePath(source)}/team-groups/${teamGroupId}`, data);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Update team group ${teamGroupId}`, 'put');
  }
};

export const deleteTeamGroup = async (teamGroupId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.delete(`${teamsBasePath(source)}/team-groups/${teamGroupId}`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Delete team group ${teamGroupId}`, 'delete');
  }
};

export const setTeamGroupLeader = async (teamGroupId, userId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.post(`${teamsBasePath(source)}/team-groups/${teamGroupId}/leader`, {
      user_id: Number(userId),
    });
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Set team group ${teamGroupId} leader`, 'post');
  }
};

export const getTeamGroupLeaders = async (params = {}, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.get(`${teamsBasePath(source)}/team-group-leaders`, { params });
    return normalizeList(response);
  } catch (error) {
    return handleServiceError(error, 'Fetch team group leaders', 'get', []);
  }
};

export const removeTeamGroupLeader = async (teamGroupId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.delete(`${teamsBasePath(source)}/team-groups/${teamGroupId}/leader`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Remove team group ${teamGroupId} leader`, 'delete');
  }
};

export const assignSalesLeaderToTeam = async (teamId, userId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.post(`${teamsBasePath(source)}/teams/${teamId}/sales-leader`, {
      user_id: Number(userId),
    });
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Assign sales leader to team ${teamId}`, 'post');
  }
};

export const removeSalesLeaderFromTeam = async (teamId, userId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.delete(
      `${teamsBasePath(source)}/teams/${teamId}/sales-leader/${userId}`
    );
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Remove sales leader ${userId} from team ${teamId}`, 'delete');
  }
};

export const getSalesLeaders = async (params = {}, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.get(`${teamsBasePath(source)}/teams/sales-leaders`, { params });
    return normalizeList(response);
  } catch (error) {
    return handleServiceError(error, 'Fetch sales leaders', 'get', []);
  }
};

export const getSalesWithoutTeam = async (options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response = await apiClient.get(`${teamsBasePath(source)}/teams/sales-without-team`);
    return normalizeList(response);
  } catch (error) {
    return handleServiceError(error, 'Fetch sales without team', 'get', []);
  }
};

export const getProjectManagementTeamMembers = async (teamId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    if (source === 'hr') {
      let response;
      try {
        response = await apiClient.get(`/hr/teams/${teamId}`);
      } catch (_) {
        response = await apiClient.get(`/hr/teams/members/${teamId}`);
      }
      const data = response?.data?.data ?? response?.data ?? {};
      const raw =
        data?.members ??
        data?.users ??
        data?.items ??
        (Array.isArray(data) ? data : []);
      return Array.isArray(raw) ? raw : [];
    }

    const response = await apiClient.get(`/project_management/teams/members/${teamId}`);
    const data = response?.data?.data ?? response?.data ?? {};
    const raw =
      data?.members ??
      data?.users ??
      data?.items ??
      (Array.isArray(data) ? data : []);
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    return handleServiceError(error, `Fetch team ${teamId} members`, 'get', []);
  }
};

export const addProjectManagementTeamMember = async (teamId, userId, teamGroupId = null, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const payload = {
      user_id: userId != null ? String(userId) : '',
    };
    if (teamGroupId != null && teamGroupId !== '') {
      payload.team_group_id = String(teamGroupId);
    }

    const response =
      source === 'hr'
        ? await apiClient.post(`/hr/teams/${teamId}/members`, payload)
        : await apiClient.post(`/project_management/teams/members/${teamId}`, payload);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Add member to team ${teamId}`, 'post');
  }
};

export const removeProjectManagementTeamMember = async (teamId, userId, options = {}) => {
  const source = resolveTeamsSource(options);
  try {
    const response =
      source === 'hr'
        ? await apiClient.delete(`/hr/teams/${teamId}/members/${userId}`)
        : await apiClient.delete(`/project_management/teams/members/${teamId}/${userId}`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    return handleServiceError(error, `Remove member from team ${teamId}`, 'delete');
  }
};
export const getTeamContracts = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/project_management/teams/contracts/${id}`, { params });
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Fetch contracts for team ${id}`, 'get', []);
  }
};
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
export const getProjectTeams = async contractId => getContractTeams(contractId);
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
export const removeProjectTeam = async projectTeamId => {
  try {
    const response = await apiClient.delete(`/project_teams/teams/remove/${projectTeamId}`);
    return response.data;
  } catch (error) {
    return handleServiceError(error, `Remove project team ${projectTeamId}`, 'delete');
  }
};
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
export const getContractCount = async teamId => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/contracts/count`);
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch contract count for team ${teamId}`, 'get', {});
  }
};
export const getTeamLocations = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/locations`, { params });
    const locations = response.data?.data || response.data || [];
    return Array.isArray(locations) ? locations : [];
  } catch (error) {
    return handleServiceError(error, `Fetch locations for team ${teamId}`, 'get', []);
  }
};
export const assignLocation = async (teamId, data) => {
  try {
    const response = await apiClient.post(`/teams/${teamId}/locations`, data);
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Assign location to team ${teamId}`, 'post');
  }
};
export const getSalesAverage = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/sales-average`, { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch sales average for team ${teamId}`, 'get', {});
  }
};
export const getTeamPerformance = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/performance`, { params });
    return response.data?.data || response.data || {};
  } catch (error) {
    return handleServiceError(error, `Fetch performance for team ${teamId}`, 'get', {});
  }
};
export const getTeamMembers = async (teamId, params = {}) => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/members`, { params });
    const members = response.data?.data || response.data || [];
    return Array.isArray(members) ? members : [];
  } catch (error) {
    return handleServiceError(error, `Fetch members for team ${teamId}`, 'get', []);
  }
};
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
  createTeamGroup,
  getTeamGroups,
  getTeamGroupById,
  getTeamGroupMembers,
  addTeamGroupMember,
  removeTeamGroupMember,
  updateTeamGroup,
  deleteTeamGroup,
  setTeamGroupLeader,
  getTeamGroupLeaders,
  removeTeamGroupLeader,
  assignSalesLeaderToTeam,
  removeSalesLeaderFromTeam,
  getSalesLeaders,
  getSalesWithoutTeam,
  getProjectManagementTeamMembers,
  addProjectManagementTeamMember,
  removeProjectManagementTeamMember,
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
  getProjectManagementReservations,
  getProjectManagementUnitReservationContext,
  createProjectManagementReservation,
  confirmProjectManagementReservation,
  cancelProjectManagementReservation,
  logProjectManagementReservationAction,
  downloadProjectManagementReservationVoucher,
  getProjectManagementReservationVoucherData,
  fetchProjectManagementReservationVoucherDataBlob,
};







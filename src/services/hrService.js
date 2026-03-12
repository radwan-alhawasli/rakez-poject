import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

/**
 * Ensure response is successful and blob is PDF; otherwise throw with a clear message.
 * Prevents saving API error pages (e.g. 401 HTML/JSON) as .pdf files.
 */
async function ensurePdfBlob(response) {
  const status = response?.status ?? 0;
  if (status < 200 || status >= 300) {
    const blob = response?.data;
    let msg = 'فشل إنشاء التقرير.';
    if (blob instanceof Blob) {
      try {
        const text = await blob.text();
        try {
          const j = JSON.parse(text);
          msg = j?.message || msg;
        } catch (_) {
          if (text && text.length < 300) msg = text;
        }
      } catch (_) {
        void 0; // blob.text() failed; keep default msg
      }
    }
    throw new Error(msg);
  }
  const blob = response?.data;
  if (!(blob instanceof Blob)) return blob;
  const type = (blob.type || '').toLowerCase();
  // Reject only when Content-Type clearly indicates an error body (not PDF)
  if (type && !type.includes('pdf')) {
    if (
      type.includes('json') ||
      type.includes('html') ||
      (type.includes('text/plain') && blob.size < 500)
    ) {
      throw new Error('الخادم لم يُرجع ملف PDF صالح.');
    }
  }
  return blob;
}

/**
 * HR Service - Manages HR-related API calls
 *
 * TEAMS: Use getTeams() for HR teams (GET /hr/teams) - paginated, with performance data.
 * For Project Management teams use teamService.getTeams() (/project_management/teams/index).
 * For Teams Management module use teamService methods with /teams/* base.
 */

// ==================== Dashboard APIs ====================

/**
 * Get dashboard KPIs and metrics
 * GET /hr/dashboard
 */
export const getDashboardMetrics = async () => {
  try {
    const response = await apiClient.get('/hr/dashboard');
    return response.data;
  } catch (error) {
    logger.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

// ==================== Employee/User Management APIs (aligned with API collection) ====================

/**
 * Get all employees (api: GET /hr/list_employees)
 * @param {Object} params - Query parameters including search term
 */
export const getEmployees = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/list_employees', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  } catch (error) {
    return handleServiceError(error, 'Error fetching employees', 'get') || { items: [], total: 0 };
  }
};

/**
 * Get employee by ID (api: GET /hr/show_employee/:id)
 */
export const getEmployeeById = async employeeId => {
  try {
    const response = await apiClient.get(`/hr/show_employee/${employeeId}`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`Error fetching employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Create new employee (api: POST /hr/add_employee)
 * @param {Object} employeeData - Employee info (name, email, type, password, etc.)
 */
export const createEmployee = async employeeData => {
  try {
    const response = await apiClient.post('/hr/add_employee', employeeData);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error('Error creating employee:', error);
    throw error;
  }
};

/**
 * Update employee (api: PUT /hr/update_employee/:id)
 */
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await apiClient.put(`/hr/update_employee/${employeeId}`, employeeData);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`Error updating employee ${employeeId}:`, error);
    throw error;
  }
};

/**
 * Delete employee (api: DELETE /hr/delete_employee/:id)
 */
export const deleteEmployee = async employeeId => {
  try {
    const response = await apiClient.delete(`/hr/delete_employee/${employeeId}`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`Error deleting employee ${employeeId}:`, error);
    throw error;
  }
};

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

// ==================== Reporting APIs (Mocked if not in Postman) ====================

/**
 * Generate monthly team performance report
 * GET /hr/reports/team-performance (params: month, year, format)
 */
export const generateTeamPerformanceReport = async (month, year, format = 'pdf') => {
  try {
    const response = await apiClient.get('/hr/reports/team-performance', {
      params: { month, year, format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });

    if (format === 'pdf' && response.data instanceof Blob) {
      const blob = await ensurePdfBlob(response);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team_performance_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response.data;
  } catch (error) {
    logger.error('Error generating team performance report:', error);
    throw error;
  }
};

/**
 * Generate marketer performance report (PDF built on frontend from API data).
 * GET /hr/reports/marketer-performance (params: marketer_id, month, year, format)
 */
export const generateMarketerReport = async (marketerId, month, year, format = 'pdf') => {
  try {
    if (format === 'pdf') {
      try {
        const dataResponse = await apiClient.get('/hr/reports/marketer-performance', {
          params: { marketer_id: marketerId, month, year, format: 'json' },
          responseType: 'json',
        });
        const report = dataResponse?.data?.data ?? dataResponse?.data ?? dataResponse;
        const { generateMarketerPerformanceReportPdf } = await import('@/services/pdfService');
        const pdfBytes = await generateMarketerPerformanceReportPdf(report, new Date().toISOString().slice(0, 10));
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `marketer_performance_${marketerId}_${month}_${year}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return blob;
      } catch (_err) {
        const response = await apiClient.get('/hr/reports/marketer-performance', {
          params: { marketer_id: marketerId, month, year, format: 'pdf' },
          responseType: 'blob',
        });
        if (response.data instanceof Blob) {
          const blob = await ensurePdfBlob(response);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `marketer_performance_${marketerId}_${month}_${year}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
        return response.data;
      }
    }
    const response = await apiClient.get('/hr/reports/marketer-performance', {
      params: { marketer_id: marketerId, month, year, format },
      responseType: 'json',
    });
    return response.data;
  } catch (error) {
    logger.error('Error generating marketer performance report:', error);
    throw error;
  }
};

/**
 * Generate employee list report
 * GET /hr/reports/employee-count (params: format)
 */
export const generateEmployeesReport = async (format = 'pdf') => {
  try {
    const response = await apiClient.get('/hr/reports/employee-count', {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });

    if (format === 'pdf' && response.data instanceof Blob) {
      const blob = await ensurePdfBlob(response);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employee_list_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response.data;
  } catch (error) {
    logger.error('Error generating employees report:', error);
    throw error;
  }
};

/**
 * Generate expiring/ended contracts report (PDF built on frontend from API data).
 * GET /hr/reports/expiring-contracts (params: days, format)
 */
export const generateExpiringContractsReport = async (days = 30, format = 'pdf') => {
  try {
    if (format === 'pdf') {
      try {
        const dataResponse = await apiClient.get('/hr/reports/expiring-contracts', {
          params: { days, format: 'json' },
          responseType: 'json',
        });
        const report = dataResponse?.data?.data ?? dataResponse?.data ?? dataResponse;
        const { generateExpiringContractsReportPdf } = await import('@/services/pdfService');
        const pdfBytes = await generateExpiringContractsReportPdf(report, days);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `expiring_contracts_${days}days.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return blob;
      } catch (_err) {
        const response = await apiClient.get('/hr/reports/expiring-contracts', {
          params: { days, format: 'pdf' },
          responseType: 'blob',
        });
        if (response.data instanceof Blob) {
          const blob = await ensurePdfBlob(response);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `expiring_contracts_${days}days.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
        return response.data;
      }
    }
    const response = await apiClient.get('/hr/reports/expiring-contracts', {
      params: { days, format },
      responseType: 'json',
    });
    return response.data;
  } catch (error) {
    logger.error('Error generating expiring contracts report:', error);
    throw error;
  }
};

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
 * @param {Object} data - Body (e.g. user_id, role)
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
 * List marketer performance
 * GET /hr/marketers/performance
 */
export const listMarketerPerformance = async (params = {}) => {
  try {
    const response = await apiClient.get('/hr/marketers/performance', { params });
    const performance = response.data?.data || response.data || [];
    return Array.isArray(performance) ? performance : [];
  } catch (error) {
    logger.error('Error fetching marketer performance list:', error);
    throw error;
  }
};

/**
 * Show marketer performance details
 * GET /hr/marketers/:id/performance
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
 * @param {Object} params - page, per_page, search, etc.
 * @returns {Promise<{ items: Array, total: number }>}
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
 * @param {Object} [data] - Optional body (e.g. reason)
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
 * @param {Object} params - page, per_page, year, type
 * @returns {Promise<{ items: Array, total: number }>}
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
 */
export const listUserWarnings = async (userId, params = {}) => {
  return getUserWarnings(userId, params);
};

/**
 * Create warning for user
 * POST /hr/users/:user_id/warnings
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
 * @param {Object} params - page, per_page
 * @returns {Promise<{ items: Array, total: number }>}
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
 */
export const listUserContracts = async (userId, params = {}) => {
  return getUserContracts(userId, params);
};

/**
 * Create user contract
 * POST /hr/users/:user_id/contracts
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

export default {
  // Dashboard
  getDashboardMetrics,
  refreshDashboard,

  // Employees
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,

  // Teams
  getTeams,
  getHRTeamMembers,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  linkMarketersToTeam,
  getTeamContracts,
  getTeamContractLocations,
  getTeamsForContract,
  getTeamSalesAverage,
  createHRTeam,
  updateHRTeam,
  deleteHRTeam,
  assignTeamMember,
  removeTeamMember,

  // Performance
  getMarketerPerformance,
  setMarketerGoal,
  listMarketerPerformance,
  showMarketerPerformance,

  // Users
  listUsers,
  createUser,
  showUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  uploadUserFiles,

  // Warnings
  getUserWarnings,
  listUserWarnings,
  createWarning,
  deleteWarning,

  // Contracts
  getUserContracts,
  listUserContracts,
  createUserContract,
  showHRContract,
  updateHRContract,
  generateContractPDF,
  downloadContractPDF,
  activateContract,
  terminateContract,

  // Reports
  generateTeamPerformanceReport,
  generateMarketerReport,
  generateEmployeesReport,
  generateExpiringContractsReport,
  getTeamPerformanceReport,
  getMarketerPerformanceReport,
  getEmployeeCountReport,
  getExpiringContractsReport,
};

/**
 * Sales Department Service (Modularized Aggregator)
 * This file serves as a clean entry point that delegates to specialized modules.
 * This approach keeps this file well under the 500-line limit while maintaining backward compatibility.
 */

import apiClient from '@/api/apiClient';
import projectsApi from '@/modules/sales/services/salesProjectsApi';
import reservationsApi from '@/modules/sales/services/salesReservationsApi';
import targetsApi from '@/modules/sales/services/salesTargetsApi';
import attendanceApi from '@/modules/sales/services/salesAttendanceApi';
import teamApi from '@/modules/sales/services/salesTeamApi';
import tasksApi from '@/modules/sales/services/salesTasksApi';
import searchApi from '@/modules/sales/services/salesSearchApi';
import analyticsApi from '@/modules/sales/services/salesAnalyticsApi';

const salesService = {
  // Core / Dashboard
  getDashboard(params = {}) {
    return apiClient.get('/sales/dashboard', { params });
  },

  // Delegate all other methods to specialized modules
  ...projectsApi,
  ...reservationsApi,
  ...targetsApi,
  ...attendanceApi,
  ...teamApi,
  ...tasksApi,
  ...searchApi,
  ...analyticsApi,

  // Add any legacy methods or aliases if needed
  logAction(id, data) { return reservationsApi.logAction(id, data); },
  updateMyTarget(id, data) { return targetsApi.updateMyTarget(id, data); },
  saveProjectSchedules(projectId, schedules, date) { return attendanceApi.saveProjectSchedules(projectId, schedules, date); }
};

export default salesService;

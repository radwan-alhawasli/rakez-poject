/**
 * HR domain routes (nested under main layout).
 * @module core/router/routes/domainHr
 */

import { ROLE_HR } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

export default {
  path: 'hr',
  component: () => import('@/views/HRView.vue'),
  meta: { roles: [ROLE_HR], permissions: [PERMISSIONS.HR_DASHBOARD_VIEW] },
  children: [
    { path: '', name: 'HR', redirect: { name: 'HRDashboard' } },
    { path: 'dashboard', name: 'HRDashboard', component: () => import('@/views/HRView.vue'), meta: { permissions: [PERMISSIONS.HR_DASHBOARD_VIEW] } },
    { path: 'teams', name: 'HRTeams', component: () => import('@/views/HRView.vue'), meta: { permissions: [PERMISSIONS.HR_TEAMS_MANAGE] } },
    { path: 'team-performance', name: 'HRTeamPerformance', component: () => import('@/views/HRView.vue'), meta: { permissions: [PERMISSIONS.HR_PERFORMANCE_VIEW] } },
    { path: 'employee-performance', name: 'HREmployeePerformance', component: () => import('@/views/HRView.vue'), meta: { permissions: [PERMISSIONS.HR_PERFORMANCE_VIEW] } },
    { path: 'users', name: 'HRUsers', component: () => import('@/views/HRView.vue'), meta: { permissions: [PERMISSIONS.HR_USERS_CREATE] } },
    { path: 'reports', name: 'HRReports', component: () => import('@/views/HRView.vue'), meta: { permissions: [PERMISSIONS.HR_REPORTS_VIEW] } },
  ],
};

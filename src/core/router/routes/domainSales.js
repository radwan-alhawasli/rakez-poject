/**
 * Sales domain routes (nested under main layout).
 * @module core/router/routes/domainSales
 */

import { ROLE_ADMIN, ROLE_SALES, ROLE_SALES_LEADER } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

export default {
  path: 'sales',
  component: () => import('@/modules/sales/views/SalesViewExtended.vue'),
  meta: { roles: [ROLE_SALES, ROLE_SALES_LEADER], permissions: [PERMISSIONS.SALES_DASHBOARD_VIEW] },
  children: [
    { path: '', name: 'Sales', redirect: { name: 'SalesDashboard' } },
    { path: 'dashboard', name: 'SalesDashboard', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_DASHBOARD_VIEW] } },
    { path: 'targets', name: 'SalesTargets', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_TARGETS_VIEW] } },
    { path: 'my-rating', name: 'SalesMyRating', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_TARGETS_VIEW] } },
    { path: 'projects', name: 'SalesProjects', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_PROJECTS_VIEW] } },
    { path: 'unit-search', name: 'SalesUnitSearch', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_PROJECTS_VIEW] } },
    {
      path: 'unit-requests',
      name: 'SalesUnitRequests',
      /**
       * Legacy route: search alerts are now embedded inside "بحث الوحدات".
       * Keep the URL working for old bookmarks and deep-links.
       */
      redirect: { name: 'SalesUnitSearch', query: { section: 'alerts' } },
      meta: { roles: [ROLE_ADMIN, ROLE_SALES, ROLE_SALES_LEADER] },
    },
    {
      path: 'unit-requests/:alertId',
      name: 'SalesUnitRequestDetail',
      /**
       * Legacy route: open alert details inside the embedded alerts panel in "بحث الوحدات".
       */
      redirect: to => ({
        name: 'SalesUnitSearch',
        query: { section: 'alerts', alertId: String(to.params?.alertId ?? '') },
      }),
      meta: { roles: [ROLE_ADMIN, ROLE_SALES, ROLE_SALES_LEADER] },
    },
    { path: 'reservations', name: 'SalesReservations', component: () => import('@/modules/sales/views/ReservationsView.vue'), meta: { permissions: [PERMISSIONS.SALES_RESERVATIONS_VIEW] } }, 
    { path: 'attendance', name: 'SalesAttendance', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_ATTENDANCE_VIEW] } },
    { path: 'negotiations', name: 'SalesNegotiations', redirect: { name: 'SalesReservations' } },
    { path: 'team', name: 'SalesTeam', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_TEAM_MANAGE] } },
    { path: 'tasks', name: 'SalesTasks', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_TASKS_MANAGE] } },
    { path: 'waiting-list', name: 'SalesWaitingList', redirect: { name: 'SalesReservations' } },
    { path: 'assignments', name: 'SalesAssignments', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_PROJECTS_ALLOCATE_SHIFTS] } },
    { path: 'payment-plans', name: 'SalesPaymentPlans', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE] } },
    { path: 'project-schedules', name: 'SalesProjectSchedules', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_PROJECT_SCHEDULES_MANAGE] } },
    { path: 'project-schedules/:projectId', name: 'SalesProjectScheduleDetail', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_PROJECT_SCHEDULES_MANAGE] } },
    { path: 'sold-units', name: 'SalesSoldUnits', component: () => import('@/modules/sales/views/SalesViewExtended.vue'), meta: { permissions: [PERMISSIONS.SALES_SOLD_UNITS_VIEW] } },
  ],
};

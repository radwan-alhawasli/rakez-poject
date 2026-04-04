/**
 * Accounting domain routes (nested under main layout).
 * @module core/router/routes/domainAccounting
 */

import { ROLE_ACCOUNTING, ROLE_ACCOUNTANT } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

export default {
  path: 'accounting',
  component: () => import('@/modules/accounting/views/AccountingView.vue'),
  meta: { roles: [ROLE_ACCOUNTING, ROLE_ACCOUNTANT], permissions: [PERMISSIONS.ACCOUNTING_DASHBOARD_VIEW] },
  children: [
    { path: '', name: 'Accounting', redirect: { name: 'AccountingDashboard' } },
    { path: 'dashboard', name: 'AccountingDashboard', component: () => import('@/modules/accounting/views/AccountingView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_DASHBOARD_VIEW] } },
    { path: 'notifications', name: 'AccountingNotifications', component: () => import('@/modules/accounting/views/AccountingView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_NOTIFICATIONS_VIEW] } },
    { path: 'sold-units', name: 'AccountingSoldUnits', component: () => import('@/modules/accounting/views/AccountingView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_SOLD_UNITS_VIEW] } },
    { path: 'salaries', name: 'AccountingSalaries', component: () => import('@/modules/accounting/views/AccountingView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_SALARIES_VIEW] } },
  ],
};

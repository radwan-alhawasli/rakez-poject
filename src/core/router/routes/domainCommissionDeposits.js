/**
 * Commission/Deposits domain routes (nested under main layout).
 * @module core/router/routes/domainCommissionDeposits
 */

import { ROLE_ADMIN, ROLE_ACCOUNTING, ROLE_ACCOUNTANT, ROLE_HR } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

export default {
  path: 'commission-deposits',
  component: () => import('@/views/CommissionDepositsView.vue'),
  meta: { roles: [ROLE_ADMIN, ROLE_ACCOUNTING, ROLE_ACCOUNTANT, ROLE_HR] },
  children: [
    { path: '', name: 'CommissionDeposits', redirect: { name: 'CommissionsDashboard' } },
    { path: 'dashboard', name: 'CommissionsDashboard', component: () => import('@/views/CommissionDepositsView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_DASHBOARD_VIEW] } },
    { path: 'commissions', name: 'CommissionsList', component: () => import('@/views/CommissionDepositsView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_COMMISSIONS_APPROVE] } },
    { path: 'deposits', name: 'DepositsTracking', component: () => import('@/views/CommissionDepositsView.vue'), meta: { permissions: [PERMISSIONS.ACCOUNTING_DEPOSITS_VIEW] } },
  ],
};

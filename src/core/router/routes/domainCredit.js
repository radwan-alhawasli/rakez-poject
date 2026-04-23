/**
 * Credit domain routes (nested under main layout).
 * @module core/router/routes/domainCredit
 */

import { ROLE_CREDIT } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

export default {
  path: 'credit',
  component: () => import('@/modules/credit/views/CreditView.vue'),
  meta: { roles: [ROLE_CREDIT], permissions: [PERMISSIONS.CREDIT_DASHBOARD_VIEW] },
  children: [
    { path: '', name: 'Credit', redirect: { name: 'CreditDashboard' } },
    { path: 'dashboard', name: 'CreditDashboard', component: () => import('@/modules/credit/views/CreditView.vue'), meta: { permissions: [PERMISSIONS.CREDIT_DASHBOARD_VIEW] } },
    { path: 'notifications', name: 'CreditNotifications', component: () => import('@/modules/credit/views/CreditView.vue'), meta: { permissions: [PERMISSIONS.CREDIT_DASHBOARD_VIEW] } },
    { path: 'bookings', name: 'CreditBookings', component: () => import('@/modules/credit/views/CreditView.vue'), meta: { permissions: [PERMISSIONS.CREDIT_BOOKINGS_VIEW] } },
    { path: 'financing', name: 'CreditFinancing', component: () => import('@/modules/credit/views/CreditView.vue'), meta: { permissions: [PERMISSIONS.CREDIT_FINANCING_MANAGE] } },
    { path: 'title-transfer', name: 'CreditTitleTransfer', component: () => import('@/modules/credit/views/CreditView.vue'), meta: { permissions: [PERMISSIONS.CREDIT_TITLE_TRANSFER_MANAGE] } },
    { path: 'sold-projects', name: 'CreditSoldProjects', component: () => import('@/modules/credit/views/CreditView.vue'), meta: { permissions: [PERMISSIONS.CREDIT_BOOKINGS_VIEW] } },
    { path: 'marketing-requests', name: 'CreditMarketingRequests', component: () => import('@/modules/credit/views/CreditView.vue') },
  ],
};

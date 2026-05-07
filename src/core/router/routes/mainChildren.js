/**
 * Flat main layout children (no nested layout).
 * @module core/router/routes/mainChildren
 */

import { PERMISSIONS } from '@/constants/permissions';
import {
  ROLE_ADMIN,
  ROLE_PROJECT_MANAGEMENT,
  ROLE_ACCOUNTING,
  ROLE_HR,
} from '@/constants/roles';

export default [
  { path: '', redirect: '/dashboard' },
  { path: 'dashboard', name: 'Dashboard', component: () => import('@/modules/app/views/DashboardView.vue') },
  { path: 'ai-assistant', name: 'AiAssistant', component: () => import('@/modules/app/views/AiAssistantView.vue') },
  { path: 'chat', name: 'Chat', component: () => import('@/modules/app/views/ChatView.vue') },
  {
    path: 'project-management',
    name: 'ProjectManagement',
    component: () => import('@/modules/projects/views/ProjectManagementView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT] },
  },
  {
    path: 'developers',
    name: 'Developers',
    component: () => import('@/modules/projects/views/DevelopersView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT, ROLE_ACCOUNTING] },
  },
  {
    path: 'developers/:id',
    name: 'DeveloperDetail',
    component: () => import('@/modules/projects/views/DeveloperDetailView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT, ROLE_ACCOUNTING] },
  },
  {
    path: 'developers/:id/project/:projectId',
    name: 'DeveloperProjectUnits',
    component: () => import('@/modules/projects/views/DeveloperProjectUnitsView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT, ROLE_ACCOUNTING] },
  },
  {
    path: 'notifications',
    name: 'Notifications',
    component: () => import('@/modules/app/views/NotificationsView.vue'),
    meta: { permissions: [PERMISSIONS.NOTIFICATIONS_VIEW] },
  },
  {
    path: 'contracts',
    name: 'Contracts',
    component: () => import('@/modules/contracts/views/ContractsView.vue'),
    meta: { permissions: [PERMISSIONS.CONTRACTS_VIEW] },
  },
  {
    path: 'users',
    name: 'Users',
    component: () => import('@/modules/hr/views/UsersView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_HR], permissions: [PERMISSIONS.HR_USERS_CREATE] },
  },
  {
    path: 'admin/locations',
    name: 'AdminLocations',
    component: () => import('@/modules/admin/views/AdminLocationsView.vue'),
    meta: { roles: [ROLE_ADMIN] },
  },
  {
    path: 'admin/contracts',
    name: 'AdminContracts',
    component: () => import('@/modules/contracts/views/ContractsView.vue'),
    meta: { roles: [ROLE_ADMIN] },
  },
  {
    path: 'admin/order-marketing-developers',
    name: 'AdminOrderMarketingDevelopers',
    component: () => import('@/modules/admin/views/AdminLocationsView.vue'),
    meta: { roles: [ROLE_ADMIN] },
  },
  {
    path: 'admin/commission-rules',
    name: 'AdminCommissionRules',
    component: () => import('@/modules/admin/views/AdminCommissionRulesPage.vue'),
    meta: { roles: [ROLE_ADMIN] },
  },
  { path: 'exclusive-request', name: 'ExclusiveRequest', component: () => import('@/modules/projects/views/ExclusiveProjectView.vue') },
  { path: 'my-requests', name: 'MyRequests', component: () => import('@/modules/projects/views/MyRequestsView.vue') },
  {
    path: 'contract-form',
    name: 'ContractFormNew',
    component: () => import('@/modules/contracts/views/ContractFormView.vue'),
    /** استكمال عقد المشروع الحصري: من لديه طلب حصري أو إكمال عقد دون عرض كل العقود */
    meta: {
      permissions: [
        PERMISSIONS.CONTRACTS_VIEW,
        PERMISSIONS.EXCLUSIVE_PROJECTS_REQUEST,
        PERMISSIONS.EXCLUSIVE_PROJECTS_CONTRACT_COMPLETE,
      ],
    },
  },
  {
    path: 'contract-form/:id',
    name: 'ContractForm',
    component: () => import('@/modules/contracts/views/ContractFormView.vue'),
    meta: {
      permissions: [
        PERMISSIONS.CONTRACTS_VIEW,
        PERMISSIONS.EXCLUSIVE_PROJECTS_REQUEST,
        PERMISSIONS.EXCLUSIVE_PROJECTS_CONTRACT_COMPLETE,
      ],
    },
  },
  {
    path: 'project-tracker/:id',
    name: 'ProjectTracker',
    component: () => import('@/modules/projects/views/ProjectTrackerView.vue'),
  },
  { path: 'reservations', name: 'Reservations', component: () => import('@/modules/sales/views/ReservationsView.vue') },
  {
    path: 'cancelled-reservations',
    name: 'CancelledReservations',
    component: () => import('@/modules/sales/views/CancelledReservationsView.vue'),
  },
  { path: 'profile', name: 'Profile', component: () => import('@/modules/app/views/ProfileView.vue') },
  { path: 'tasks', name: 'Tasks', component: () => import('@/modules/app/views/TasksView.vue') },
  { path: 'teams', name: 'Teams', component: () => import('@/modules/hr/views/TeamsView.vue') },
  { path: 'team-management', name: 'TeamManagement', component: () => import('@/modules/hr/views/TeamManagementView.vue') },
  { path: 'image-approval', name: 'ImageApproval', component: () => import('@/modules/editor/views/ImageApprovalView.vue') },
];

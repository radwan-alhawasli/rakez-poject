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
  { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: 'ai-assistant', name: 'AiAssistant', component: () => import('@/views/AiAssistantView.vue') },
  { path: 'chat', name: 'Chat', component: () => import('@/views/ChatView.vue') },
  {
    path: 'knowledge-management',
    name: 'KnowledgeManagement',
    component: () => import('@/views/KnowledgeManagementView.vue'),
    meta: { permissions: [PERMISSIONS.MANAGE_AI_KNOWLEDGE] },
  },
  {
    path: 'project-management',
    name: 'ProjectManagement',
    component: () => import('@/views/ProjectManagementView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT] },
  },
  {
    path: 'developers',
    name: 'Developers',
    component: () => import('@/views/DevelopersView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT, ROLE_ACCOUNTING] },
  },
  {
    path: 'developers/:id',
    name: 'DeveloperDetail',
    component: () => import('@/views/DeveloperDetailView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT, ROLE_ACCOUNTING] },
  },
  {
    path: 'developers/:id/project/:projectId',
    name: 'DeveloperProjectUnits',
    component: () => import('@/views/DeveloperProjectUnitsView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT, ROLE_ACCOUNTING] },
  },
  {
    path: 'notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationsView.vue'),
    meta: { permissions: [PERMISSIONS.NOTIFICATIONS_VIEW] },
  },
  {
    path: 'contracts',
    name: 'Contracts',
    component: () => import('@/views/ContractsView.vue'),
    meta: { permissions: [PERMISSIONS.CONTRACTS_VIEW] },
  },
  {
    path: 'users',
    name: 'Users',
    component: () => import('@/views/UsersView.vue'),
    meta: { roles: [ROLE_ADMIN, ROLE_HR], permissions: [PERMISSIONS.HR_USERS_CREATE] },
  },
  {
    path: 'agents',
    name: 'Agents',
    component: () => import('@/views/AgentsView.vue'),
    meta: { roles: [ROLE_ADMIN], permissions: [PERMISSIONS.AGENTS_MANAGE] },
  },
  { path: 'exclusive-request', name: 'ExclusiveRequest', component: () => import('@/views/ExclusiveProjectView.vue') },
  { path: 'my-requests', name: 'MyRequests', component: () => import('@/views/MyRequestsView.vue') },
  {
    path: 'contract-form',
    name: 'ContractFormNew',
    component: () => import('@/views/ContractFormView.vue'),
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
    component: () => import('@/views/ContractFormView.vue'),
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
    component: () => import('@/views/ProjectTrackerView.vue'),
  },
  { path: 'reservations', name: 'Reservations', component: () => import('@/views/ReservationsView.vue') },
  {
    path: 'cancelled-reservations',
    name: 'CancelledReservations',
    component: () => import('@/views/CancelledReservationsView.vue'),
  },
  { path: 'profile', name: 'Profile', component: () => import('@/views/ProfileView.vue') },
  { path: 'tasks', name: 'Tasks', component: () => import('@/views/TasksView.vue') },
  { path: 'teams', name: 'Teams', component: () => import('@/views/TeamsView.vue') },
  { path: 'team-management', name: 'TeamManagement', component: () => import('@/views/TeamManagementView.vue') },
  { path: 'image-approval', name: 'ImageApproval', component: () => import('@/views/ImageApprovalView.vue') },
];

/**
 * Marketing domain routes (nested under main layout).
 * @module core/router/routes/domainMarketing
 */

import { ROLE_MARKETING } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

export default {
  path: 'marketing',
  component: () => import('@/modules/marketing/views/MarketingView.vue'),
  meta: { roles: [ROLE_MARKETING], permissions: [PERMISSIONS.MARKETING_DASHBOARD_VIEW] },
  children: [
    { path: '', name: 'Marketing', redirect: { name: 'MarketingDashboard' } },
    { path: 'dashboard', name: 'MarketingDashboard', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_DASHBOARD_VIEW] } },
    { path: 'projects', name: 'MarketingProjects', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_PROJECTS_VIEW] } },
    { path: 'teams', name: 'MarketingTeams', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_PROJECTS_VIEW] } },
    { path: 'tasks', name: 'MarketingTasks', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_TASKS_VIEW] } },
    { path: 'leads', name: 'MarketingLeads', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_TEAMS_VIEW] } },
    { path: 'expected-sales', name: 'MarketingExpectedSales', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_REPORTS_VIEW] } },
    { path: 'plans', name: 'MarketingPlans', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_PLANS_CREATE] } },
    { path: 'ai-assistant', name: 'MarketingAiAssistant', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.USE_AI_ASSISTANT] } },
    { path: 'developer-plan', name: 'MarketingDeveloperPlan', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_PLANS_CREATE] } },
    { path: 'employee-plans', name: 'MarketingEmployeePlans', component: () => import('@/modules/marketing/views/MarketingView.vue'), meta: { permissions: [PERMISSIONS.MARKETING_PLANS_CREATE] } },
  ],
};

import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import authService from '@/services/authService';
import { canAccessRoute, getDashboardPathForUser, isSalesLeader } from '@/utils/rbac';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import {
  ROLE_ADMIN,
  ROLE_PROJECT_MANAGEMENT,
  ROLE_ACCOUNTING,
  ROLE_HR,
  ROLE_MARKETING,
  ROLE_SALES,
  ROLE_CREDIT,
  ROLE_EDITOR,
} from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true },
  },

  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
      },
      {
        path: 'ai-assistant',
        name: 'AiAssistant',
        component: () => import('../views/AiAssistantView.vue'),
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('../views/ChatView.vue'),
      },
      {
        path: 'knowledge-management',
        name: 'KnowledgeManagement',
        component: () => import('../views/KnowledgeManagementView.vue'),
        meta: { permissions: [PERMISSIONS.MANAGE_AI_KNOWLEDGE] },
      },
      {
        path: 'project-management',
        name: 'ProjectManagement',
        component: () => import('../views/ProjectManagementView.vue'),
        meta: { roles: [ROLE_ADMIN, ROLE_PROJECT_MANAGEMENT] },
      },
      {
        path: 'developers',
        name: 'Developers',
        component: () => import('../views/DevelopersView.vue'),
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
        component: () => import('../views/NotificationsView.vue'),
        meta: { permissions: [PERMISSIONS.NOTIFICATIONS_VIEW] },
      },
      {
        path: 'contracts',
        name: 'Contracts',
        component: () => import('../views/ContractsView.vue'),
        meta: { permissions: [PERMISSIONS.CONTRACTS_VIEW] },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue'),
        meta: { roles: [ROLE_ADMIN, ROLE_HR], permissions: [PERMISSIONS.HR_USERS_CREATE] },
      },
      {
        path: 'agents',
        name: 'Agents',
        component: () => import('../views/AgentsView.vue'),
        meta: { roles: [ROLE_ADMIN], permissions: [PERMISSIONS.AGENTS_MANAGE] },
      },
      {
        path: 'exclusive-request',
        name: 'ExclusiveRequest',
        component: () => import('../views/ExclusiveProjectView.vue'),
      },
      {
        path: 'my-requests',
        name: 'MyRequests',
        component: () => import('../views/MyRequestsView.vue'),
      },

      {
        path: 'contract-form/:id',
        name: 'ContractForm',
        component: () => import('../views/ContractFormView.vue'),
      },
      {
        path: 'project-tracker/:id',
        name: 'ProjectTracker',
        component: () => import('../views/ProjectTrackerView.vue'),
      },
      {
        path: 'reservations',
        name: 'Reservations',
        component: () => import('../views/ReservationsView.vue'),
      },
      {
        path: 'cancelled-reservations',
        name: 'CancelledReservations',
        component: () => import('../views/CancelledReservationsView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfileView.vue'),
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('../views/TasksView.vue'),
      },
      {
        path: 'teams',
        name: 'Teams',
        component: () => import('../views/TeamsView.vue'),
      },
      {
        path: 'team-management',
        name: 'TeamManagement',
        component: () => import('../views/TeamManagementView.vue'),
      },
      {
        path: 'image-approval',
        name: 'ImageApproval',
        component: () => import('../views/ImageApprovalView.vue'),
      },
      {
        path: 'hr',
        component: () => import('../views/HRView.vue'),
        meta: { roles: [ROLE_HR], permissions: [PERMISSIONS.HR_DASHBOARD_VIEW] },
        children: [
          { path: '', name: 'HR', redirect: { name: 'HRDashboard' } },
          {
            path: 'dashboard',
            name: 'HRDashboard',
            component: () => import('../views/HRView.vue'),
            meta: { permissions: [PERMISSIONS.HR_DASHBOARD_VIEW] },
          },
          {
            path: 'teams',
            name: 'HRTeams',
            component: () => import('../views/HRView.vue'),
            meta: { permissions: [PERMISSIONS.HR_TEAMS_MANAGE] },
          },
          {
            path: 'team-performance',
            name: 'HRTeamPerformance',
            component: () => import('../views/HRView.vue'),
            meta: { permissions: [PERMISSIONS.HR_PERFORMANCE_VIEW] },
          },
          {
            path: 'employee-performance',
            name: 'HREmployeePerformance',
            component: () => import('../views/HRView.vue'),
            meta: { permissions: [PERMISSIONS.HR_PERFORMANCE_VIEW] },
          },
          {
            path: 'users',
            name: 'HRUsers',
            component: () => import('../views/HRView.vue'),
            meta: { permissions: [PERMISSIONS.HR_USERS_CREATE] },
          },
          {
            path: 'reports',
            name: 'HRReports',
            component: () => import('../views/HRView.vue'),
            meta: { permissions: [PERMISSIONS.HR_REPORTS_VIEW] },
          },
        ],
      },
      {
        path: 'marketing',
        component: () => import('../views/MarketingView.vue'),
        meta: { roles: [ROLE_MARKETING], permissions: [PERMISSIONS.MARKETING_DASHBOARD_VIEW] },
        children: [
          { path: '', name: 'Marketing', redirect: { name: 'MarketingDashboard' } },
          {
            path: 'dashboard',
            name: 'MarketingDashboard',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_DASHBOARD_VIEW] },
          },
          {
            path: 'projects',
            name: 'MarketingProjects',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_PROJECTS_VIEW] },
          },
          {
            path: 'tasks',
            name: 'MarketingTasks',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_TASKS_VIEW] },
          },
          {
            path: 'leads',
            name: 'MarketingLeads',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_TEAMS_VIEW] },
          },
          {
            path: 'expected-sales',
            name: 'MarketingExpectedSales',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_REPORTS_VIEW] },
          },
          {
            path: 'reports',
            name: 'MarketingReports',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_REPORTS_VIEW] },
          },

          // New consolidated screens (MainLayout links rely on these)
          {
            path: 'plans',
            name: 'MarketingPlans',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_PLANS_CREATE] },
          },
          {
            path: 'ai-assistant',
            name: 'MarketingAiAssistant',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.USE_AI_ASSISTANT] },
          },

          // Backward-compatible routes -> standalone tabs now
          {
            path: 'developer-plan',
            name: 'MarketingDeveloperPlan',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_PLANS_CREATE] },
          },
          {
            path: 'employee-plans',
            name: 'MarketingEmployeePlans',
            component: () => import('../views/MarketingView.vue'),
            meta: { permissions: [PERMISSIONS.MARKETING_PLANS_CREATE] },
          },
        ],
      },
      {
        path: 'sales',
        component: () => import('../views/SalesViewExtended.vue'),
        meta: { roles: [ROLE_SALES], permissions: [PERMISSIONS.SALES_DASHBOARD_VIEW] },
        children: [
          { path: '', name: 'Sales', redirect: { name: 'SalesDashboard' } },
          {
            path: 'dashboard',
            name: 'SalesDashboard',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_DASHBOARD_VIEW] },
          },
          {
            path: 'targets',
            name: 'SalesTargets',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_TARGETS_VIEW] },
          },
          {
            path: 'projects',
            name: 'SalesProjects',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_PROJECTS_VIEW] },
          },
          {
            path: 'unit-search',
            name: 'SalesUnitSearch',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_PROJECTS_VIEW] },
          },
          {
            path: 'reservations',
            name: 'SalesReservations',
            component: () => import('../views/ReservationsView.vue'),
            meta: { permissions: [PERMISSIONS.SALES_RESERVATIONS_VIEW] },
          },
          {
            path: 'attendance',
            name: 'SalesAttendance',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_ATTENDANCE_VIEW] },
          },
          {
            path: 'negotiations',
            name: 'SalesNegotiations',
            redirect: { name: 'SalesReservations' },
          },
          {
            path: 'team',
            name: 'SalesTeam',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_TEAM_MANAGE] },
          },
          {
            path: 'tasks',
            name: 'SalesTasks',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_TASKS_MANAGE] },
          },
          {
            path: 'waiting-list',
            name: 'SalesWaitingList',
            redirect: { name: 'SalesReservations' },
          },
          {
            path: 'assignments',
            name: 'SalesAssignments',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_PROJECTS_ALLOCATE_SHIFTS] },
          },
          {
            path: 'payment-plans',
            name: 'SalesPaymentPlans',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE] },
          },
          {
            path: 'project-schedules',
            name: 'SalesProjectSchedules',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_PROJECT_SCHEDULES_MANAGE] },
          },
          {
            path: 'project-schedules/:projectId',
            name: 'SalesProjectScheduleDetail',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_PROJECT_SCHEDULES_MANAGE] },
          },
          {
            path: 'sold-units',
            name: 'SalesSoldUnits',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_SOLD_UNITS_VIEW] },
          },
          {
            path: 'deposits',
            name: 'SalesDeposits',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_DEPOSITS_VIEW] },
          },
          {
            path: 'analytics',
            name: 'SalesAnalytics',
            component: () => import('../views/SalesViewExtended.vue'),
            meta: { permissions: [PERMISSIONS.SALES_ANALYTICS_VIEW] },
          },
        ],
      },
      {
        path: 'credit',
        component: () => import('../views/CreditView.vue'),
        meta: { roles: [ROLE_CREDIT], permissions: [PERMISSIONS.CREDIT_DASHBOARD_VIEW] },
        children: [
          { path: '', name: 'Credit', redirect: { name: 'CreditDashboard' } },
          {
            path: 'dashboard',
            name: 'CreditDashboard',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_DASHBOARD_VIEW] },
          },
          {
            path: 'notifications',
            name: 'CreditNotifications',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_DASHBOARD_VIEW] },
          },
          {
            path: 'bookings',
            name: 'CreditBookings',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_BOOKINGS_VIEW] },
          },
          {
            path: 'financing',
            name: 'CreditFinancing',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_FINANCING_MANAGE] },
          },
          {
            path: 'title-transfer',
            name: 'CreditTitleTransfer',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_TITLE_TRANSFER_MANAGE] },
          },
          {
            path: 'sold-projects',
            name: 'CreditSoldProjects',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_BOOKINGS_VIEW] },
          },
          {
            path: 'claim-files',
            name: 'CreditClaimFiles',
            component: () => import('../views/CreditView.vue'),
            meta: { permissions: [PERMISSIONS.CREDIT_CLAIM_FILES_GENERATE] },
          },
        ],
      },
      {
        path: 'accounting',
        component: () => import('../views/AccountingView.vue'),
        meta: { roles: [ROLE_ACCOUNTING], permissions: [PERMISSIONS.ACCOUNTING_DASHBOARD_VIEW] },
        children: [
          { path: '', name: 'Accounting', redirect: { name: 'AccountingDashboard' } },
          {
            path: 'dashboard',
            name: 'AccountingDashboard',
            component: () => import('../views/AccountingView.vue'),
            meta: { permissions: [PERMISSIONS.ACCOUNTING_DASHBOARD_VIEW] },
          },
          {
            path: 'notifications',
            name: 'AccountingNotifications',
            component: () => import('../views/AccountingView.vue'),
            meta: { permissions: [PERMISSIONS.ACCOUNTING_NOTIFICATIONS_VIEW] },
          },
          {
            path: 'sold-units',
            name: 'AccountingSoldUnits',
            component: () => import('../views/AccountingView.vue'),
            meta: { permissions: [PERMISSIONS.ACCOUNTING_SOLD_UNITS_VIEW] },
          },
          {
            path: 'deposits',
            name: 'AccountingDeposits',
            component: () => import('../views/AccountingView.vue'),
            meta: { permissions: [PERMISSIONS.ACCOUNTING_DEPOSITS_VIEW] },
          },
          {
            path: 'salaries',
            name: 'AccountingSalaries',
            component: () => import('../views/AccountingView.vue'),
            meta: { permissions: [PERMISSIONS.ACCOUNTING_SALARIES_VIEW] },
          },
        ],
      },
      {
        path: 'commission-deposits',
        component: () => import('../views/CommissionDepositsView.vue'),
        meta: { roles: [ROLE_ADMIN, ROLE_ACCOUNTING, ROLE_HR] },
        children: [
          { path: '', name: 'CommissionDeposits', redirect: { name: 'CommissionsDashboard' } },
          {
            path: 'dashboard',
            name: 'CommissionsDashboard',
            component: () => import('../views/CommissionDepositsView.vue'),
          },
          {
            path: 'commissions',
            name: 'CommissionsList',
            component: () => import('../views/CommissionDepositsView.vue'),
          },
          {
            path: 'deposits',
            name: 'DepositsTracking',
            component: () => import('../views/CommissionDepositsView.vue'),
          },
        ],
      },
      {
        path: 'editor',
        component: () => import('../layouts/EditorLayout.vue'),
        meta: { roles: [ROLE_EDITOR] },
        children: [
          { path: '', name: 'Editor', redirect: { name: 'EditorDashboard' } },
          {
            path: 'dashboard',
            name: 'EditorDashboard',
            component: () => import('../views/editor/EditorDashboardView.vue'),
          },
          {
            path: 'projects/not-montaged',
            name: 'EditorProjectsNotMontaged',
            component: () => import('../views/editor/EditorProjectsNotMontagedView.vue'),
          },
          {
            path: 'projects/after-montage',
            name: 'EditorProjectsAfterMontage',
            component: () => import('../views/editor/EditorProjectsAfterMontageView.vue'),
          },
          {
            path: 'teams',
            name: 'EditorTeams',
            component: () => import('../views/editor/EditorTeamsView.vue'),
          },
          {
            path: 'ratings',
            name: 'EditorRatings',
            component: () => import('../views/editor/EditorRatingsView.vue'),
          },
          {
            path: 'contracts',
            name: 'EditorContracts',
            component: () => import('../views/EditorView.vue'),
          },
          {
            path: 'contracts/:id',
            name: 'EditorContractDetail',
            component: () => import('../views/EditorDetailView.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: import.meta.env?.VITEST ? createMemoryHistory() : createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Check if session is expired
  if (isAuthenticated && authService.isSessionExpiring()) {
    // Show warning (could trigger a modal/notification)
    logger.warn('Session expiring soon');
  }

  // Public routes - allow access
  if (to.meta.public) {
    // If already authenticated and trying to access login, redirect to dashboard
    if (to.name === 'Login' && isAuthenticated) {
      return redirectByRole(user, next);
    }
    return next();
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    logger.warn('Unauthenticated access attempt to:', to.path);
    next('/login');
    return;
  }

  // Check role-based access control
  if (!canAccessRoute(user, to.meta)) {
    logger.warn('Access denied for user:', user?.email, 'to route:', to.path);
    const salesLeader = isSalesLeader(user);
    if (salesLeader && to.path.startsWith('/marketing')) {
      notificationService.addNotification('غير مصرح لك بالوصول إلى واجهات التسويق', 'warning');
      if (canAccessRoute(user, { permissions: [PERMISSIONS.SALES_TASKS_MANAGE] })) {
        next('/sales/tasks');
        return;
      }
      next('/sales/dashboard');
      return;
    }
    // Redirect to appropriate dashboard based on role
    redirectByRole(user, next);
    return;
  }

  // Handle root path and login redirect
  if (to.path === '/' || (to.name === 'Login' && isAuthenticated)) {
    redirectByRole(user, next);
    return;
  }

  next();
});

/**
 * Redirect user based on their role
 * @param {Object} user - User object
 * @param {Function} next - Router next function
 */
function redirectByRole(user, next) {
  next(getDashboardPathForUser(user));
}

export default router;

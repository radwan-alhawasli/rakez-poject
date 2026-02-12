import { createRouter, createWebHistory } from 'vue-router'
import authService from '../services/authService'
import { canAccessRoute, normalizeRole } from '../utils/rbac'
import notificationService from '../services/notificationService'
import logger from '../utils/logger'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { public: true }
    },

    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                redirect: '/dashboard'
            },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/DashboardView.vue')
            },
            {
                path: 'project-management',
                name: 'ProjectManagement',
                component: () => import('../views/ProjectManagementView.vue')
            },
            {
                path: 'developers',
                name: 'Developers',
                component: () => import('../views/DevelopersView.vue')
            },
            {
                path: 'notifications',
                name: 'Notifications',
                component: () => import('../views/NotificationsView.vue'),
                meta: { permissions: ['notifications.view'] }
            },
            {
                path: 'contracts',
                name: 'Contracts',
                component: () => import('../views/ContractsView.vue'),
                meta: { permissions: ['contracts.view'] }
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('../views/UsersView.vue'),
                meta: { roles: [1, 8], permissions: ['hr.users.create'] } // Admin and HR only
            },
            {
                path: 'exclusive-request',
                name: 'ExclusiveRequest',
                component: () => import('../views/ExclusiveProjectView.vue')
            },
            {
                path: 'my-requests',
                name: 'MyRequests',
                component: () => import('../views/MyRequestsView.vue')
            },

            {
                path: 'contract-form/:id',
                name: 'ContractForm',
                component: () => import('../views/ContractFormView.vue')
            },
            {
                path: 'project-tracker/:id',
                name: 'ProjectTracker',
                component: () => import('../views/ProjectTrackerView.vue')
            },
            {
                path: 'reservations',
                name: 'Reservations',
                component: () => import('../views/ReservationsView.vue')
            },
            /*
                        {
                            path: 'boards',
                            name: 'Boards',
                            component: () => import('../views/BoardsView.vue')
                        },
            */
            {
                path: 'cancelled-reservations',
                name: 'CancelledReservations',
                component: () => import('../views/CancelledReservationsView.vue')
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('../views/ProfileView.vue')
            },
            {
                path: 'teams',
                name: 'Teams',
                component: () => import('../views/TeamsView.vue')
            },
            {
                path: 'team-management',
                name: 'TeamManagement',
                component: () => import('../views/TeamManagementView.vue')
            },
            {
                path: 'image-approval',
                name: 'ImageApproval',
                component: () => import('../views/ImageApprovalView.vue')
            },
            {
                path: 'hr',
                name: 'HR',
                component: () => import('../views/HRView.vue'),
                meta: { roles: [8, 9, 'hr'], permissions: ['hr.dashboard.view'] },
                children: [
                    { path: '', redirect: { name: 'HRDashboard' } },
                    { path: 'dashboard', name: 'HRDashboard', component: () => import('../views/HRView.vue'), meta: { permissions: ['hr.dashboard.view'] } },
                    { path: 'teams', name: 'HRTeams', component: () => import('../views/HRView.vue'), meta: { permissions: ['hr.teams.manage'] } },
                    { path: 'team-performance', name: 'HRTeamPerformance', component: () => import('../views/HRView.vue'), meta: { permissions: ['hr.performance.view'] } },
                    { path: 'employee-performance', name: 'HREmployeePerformance', component: () => import('../views/HRView.vue'), meta: { permissions: ['hr.performance.view'] } },
                    { path: 'users', name: 'HRUsers', component: () => import('../views/HRView.vue'), meta: { permissions: ['hr.users.create'] } },
                    { path: 'reports', name: 'HRReports', component: () => import('../views/HRView.vue'), meta: { permissions: ['hr.reports.view'] } }
                ]
            },
            {
                path: 'marketing',
                name: 'Marketing',
                component: () => import('../views/MarketingView.vue'),
                meta: { roles: [0, 'marketing'], permissions: ['marketing.dashboard.view'] },
                children: [
                    { path: '', redirect: { name: 'MarketingDashboard' } },
                    { path: 'dashboard', name: 'MarketingDashboard', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.dashboard.view'] } },
                    { path: 'projects', name: 'MarketingProjects', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.projects.view'] } },
                    { path: 'tasks', name: 'MarketingTasks', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.tasks.view'] } },
                    { path: 'leads', name: 'MarketingLeads', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.teams.view'] } },
                    { path: 'expected-sales', name: 'MarketingExpectedSales', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.reports.view'] } },
                    { path: 'reports', name: 'MarketingReports', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.reports.view'] } },

                    // New consolidated screens (MainLayout links rely on these)
                    { path: 'plans', name: 'MarketingPlans', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['marketing.plans.create'] } },
                    { path: 'ai-assistant', name: 'MarketingAiAssistant', component: () => import('../views/MarketingView.vue'), meta: { permissions: ['use-ai-assistant'] } },

                    // Backward-compatible routes -> redirect into /marketing/plans
                    { path: 'developer-plan', name: 'MarketingDeveloperPlan', redirect: { name: 'MarketingPlans', query: { sub: 'developer' } } },
                    { path: 'employee-plans', name: 'MarketingEmployeePlans', redirect: { name: 'MarketingPlans', query: { sub: 'employee' } } }
                ]
            },
            {
                path: 'sales',
                name: 'Sales',
                component: () => import('../views/SalesViewExtended.vue'),
                meta: { roles: [5, 'sales'], permissions: ['sales.dashboard.view'] },
                children: [
                    { path: '', redirect: { name: 'SalesDashboard' } },
                    { path: 'dashboard', name: 'SalesDashboard', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.dashboard.view'] } },
                    { path: 'targets', name: 'SalesTargets', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.targets.view'] } },
                    { path: 'projects', name: 'SalesProjects', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.projects.view'] } },
                    { path: 'reservations', name: 'SalesReservations', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.reservations.view'] } },
                    { path: 'attendance', name: 'SalesAttendance', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.attendance.view'] } },
                    { path: 'negotiations', name: 'SalesNegotiations', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.negotiation.approve'] } },
                    { path: 'team', name: 'SalesTeam', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.team.manage'] } },
                    { path: 'tasks', name: 'SalesTasks', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.tasks.manage'] } },
                    { path: 'waiting-list', name: 'SalesWaitingList', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.waiting_list.create'] } },
                    { path: 'assignments', name: 'SalesAssignments', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.projects.allocate_shifts'] } },
                    { path: 'payment-plans', name: 'SalesPaymentPlans', component: () => import('../views/SalesViewExtended.vue'), meta: { permissions: ['sales.payment-plan.manage'] } }
                ]
            },
            {
                path: 'teams',
                name: 'Teams',
                component: () => import('../views/TeamsView.vue')
            },
            {
                path: 'credit',
                name: 'Credit',
                component: () => import('../views/CreditView.vue'),
                meta: { roles: [6, 'credit'], permissions: ['credit.dashboard.view'] },
                children: [
                    { path: '', redirect: { name: 'CreditDashboard' } },
                    { path: 'dashboard', name: 'CreditDashboard', component: () => import('../views/CreditView.vue'), meta: { permissions: ['credit.dashboard.view'] } },
                    { path: 'bookings', name: 'CreditBookings', component: () => import('../views/CreditView.vue'), meta: { permissions: ['credit.bookings.view'] } },
                    { path: 'financing', name: 'CreditFinancing', component: () => import('../views/CreditView.vue'), meta: { permissions: ['credit.financing.manage'] } },
                    { path: 'title-transfer', name: 'CreditTitleTransfer', component: () => import('../views/CreditView.vue'), meta: { permissions: ['credit.title_transfer.manage'] } },
                    { path: 'sold-projects', name: 'CreditSoldProjects', component: () => import('../views/CreditView.vue'), meta: { permissions: ['credit.bookings.view'] } },
                    { path: 'claim-files', name: 'CreditClaimFiles', component: () => import('../views/CreditView.vue'), meta: { permissions: ['credit.claim_files.generate'] } }
                ]
            },
            {
                path: 'accounting',
                name: 'Accounting',
                component: () => import('../views/AccountingView.vue'),
                meta: { roles: [7, 'accounting'], permissions: ['accounting.dashboard.view'] },
                children: [
                    { path: '', redirect: { name: 'AccountingDashboard' } },
                    { path: 'dashboard', name: 'AccountingDashboard', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.dashboard.view'] } },
                    { path: 'notifications', name: 'AccountingNotifications', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.notifications.view'] } },
                    { path: 'sold-units', name: 'AccountingSoldUnits', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.sold-units.view'] } },
                    { path: 'commissions', name: 'AccountingCommissions', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.commissions.approve'] } },
                    { path: 'deposits', name: 'AccountingDeposits', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.deposits.view'] } },
                    { path: 'salaries', name: 'AccountingSalaries', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.salaries.view'] } },
                    { path: 'confirmations', name: 'AccountingConfirmations', component: () => import('../views/AccountingView.vue'), meta: { permissions: ['accounting.down_payment.confirm'] } }
                ]
            },
            {
                path: 'commission-deposits',
                name: 'CommissionDeposits',
                component: () => import('../views/CommissionDepositsView.vue'),
                meta: { roles: [1, 7, 8] },
                children: [
                    { path: '', redirect: { name: 'CommissionsDashboard' } },
                    { path: 'dashboard', name: 'CommissionsDashboard', component: () => import('../views/CommissionDepositsView.vue') },
                    { path: 'commissions', name: 'CommissionsList', component: () => import('../views/CommissionDepositsView.vue') },
                    { path: 'deposits', name: 'DepositsTracking', component: () => import('../views/CommissionDepositsView.vue') }
                ]
            },
            {
                path: 'editor',
                name: 'Editor',
                component: () => import('../views/EditorView.vue'),
                meta: { roles: [4, 'editor'] },
                children: [
                    { path: '', redirect: { name: 'EditorContracts' } },
                    { path: 'contracts', name: 'EditorContracts', component: () => import('../views/EditorView.vue') },
                    { path: 'photography', name: 'EditorPhotography', component: () => import('../views/EditorView.vue') },
                    { path: 'media', name: 'EditorMedia', component: () => import('../views/EditorView.vue') }
                ]
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = authService.isAuthenticated()
    const user = authService.getCurrentUser()

    // Check if session is expired
    if (isAuthenticated && authService.isSessionExpiring()) {
        // Show warning (could trigger a modal/notification)
        logger.warn('Session expiring soon')
    }

    // Public routes - allow access
    if (to.meta.public) {
        // If already authenticated and trying to access login, redirect to dashboard
        if (to.name === 'Login' && isAuthenticated) {
            return redirectByRole(user, next)
        }
        return next()
    }

    // Protected routes - require authentication
    if (!isAuthenticated) {
        logger.warn('Unauthenticated access attempt to:', to.path)
        next('/login')
        return
    }

    // Check role-based access control
    if (!canAccessRoute(user, to.meta)) {
        logger.warn('Access denied for user:', user?.email, 'to route:', to.path)
        const norm = normalizeRole(user?.type)
        const isSalesLeader = norm === 5 && (user?.is_leader === true || user?.is_leader === 1 || user?.is_leader === '1')
        if (isSalesLeader && to.path.startsWith('/marketing')) {
            notificationService.addNotification('غير مصرح لك بالوصول إلى واجهات التسويق', 'warning')
            if (canAccessRoute(user, { permissions: ['sales.tasks.manage'] })) {
                next('/sales/tasks')
                return
            }
            next('/sales/dashboard')
            return
        }
        // Redirect to appropriate dashboard based on role
        redirectByRole(user, next)
        return
    }

    // Handle root path and login redirect
    if (to.path === '/' || (to.name === 'Login' && isAuthenticated)) {
        redirectByRole(user, next)
        return
    }

    next()
})

/**
 * Redirect user based on their role
 * @param {Object} user - User object
 * @param {Function} next - Router next function
 */
function redirectByRole(user, next) {
    if (!user) {
        next('/dashboard')
        return
    }

    // Normalize role type to ensure consistent comparison
    const normalizedRole = normalizeRole(user.type)
    
    // Redirection based on user role (using normalized numeric values)
    if (normalizedRole === 8 || normalizedRole === 9) {
        // HR roles (8 and 9)
        next('/hr/dashboard')
    } else if (normalizedRole === 0) {
        // Marketing
        next('/marketing/dashboard')
    } else if (normalizedRole === 5) {
        // Sales
        next('/sales/dashboard')
    } else if (normalizedRole === 6) {
        // Credit
        next('/credit/dashboard')
    } else if (normalizedRole === 7) {
        // Accounting
        next('/accounting/dashboard')
    } else if (normalizedRole === 4) {
        // Editor
        next('/editor/contracts')
    } else {
        // Default dashboard for admin and other roles
        next('/dashboard')
    }
}

export default router

import { createRouter, createWebHistory } from 'vue-router'
import authService from '../services/authService'

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
                component: () => import('../views/NotificationsView.vue')
            },
            {
                path: 'contracts',
                name: 'Contracts',
                component: () => import('../views/ContractsView.vue')
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('../views/UsersView.vue')
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
                children: [
                    { path: '', redirect: { name: 'HRDashboard' } },
                    { path: 'dashboard', name: 'HRDashboard', component: () => import('../views/HRView.vue') },
                    { path: 'teams', name: 'HRTeams', component: () => import('../views/HRView.vue') },
                    { path: 'team-performance', name: 'HRTeamPerformance', component: () => import('../views/HRView.vue') },
                    { path: 'employee-performance', name: 'HREmployeePerformance', component: () => import('../views/HRView.vue') },
                    { path: 'users', name: 'HRUsers', component: () => import('../views/HRView.vue') },
                    { path: 'reports', name: 'HRReports', component: () => import('../views/HRView.vue') }
                ]
            },
            {
                path: 'marketing',
                name: 'Marketing',
                component: () => import('../views/MarketingView.vue'),
                children: [
                    { path: '', redirect: { name: 'MarketingDashboard' } },
                    { path: 'dashboard', name: 'MarketingDashboard', component: () => import('../views/MarketingView.vue') },
                    { path: 'projects', name: 'MarketingProjects', component: () => import('../views/MarketingView.vue') },
                    { path: 'developer-plan', name: 'MarketingDeveloperPlan', component: () => import('../views/MarketingView.vue') },
                    { path: 'employee-plans', name: 'MarketingEmployeePlans', component: () => import('../views/MarketingView.vue') },
                    { path: 'tasks', name: 'MarketingTasks', component: () => import('../views/MarketingView.vue') },
                    { path: 'leads', name: 'MarketingLeads', component: () => import('../views/MarketingView.vue') }
                ]
            },
            {
                path: 'teams',
                name: 'Teams',
                component: () => import('../views/TeamsView.vue')
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

    if (!to.meta.public && !isAuthenticated) {
        next('/login')
    } else if (to.path === '/' || (to.name === 'Login' && isAuthenticated)) {
        const user = authService.getCurrentUser()
        // Redirection based on user role
        if (user && (user.type == 8 || user.type == 9 || String(user.type).toLowerCase() === 'hr')) {
            next('/hr/dashboard')
        } else if (user && (user.type == 0 || String(user.type).toLowerCase() === 'marketing')) {
            next('/marketing/dashboard')
        } else {
            next('/dashboard')
        }
    } else {
        next()
    }
})

export default router

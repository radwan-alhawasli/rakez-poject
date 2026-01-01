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
                path: 'reservations',
                name: 'Reservations',
                component: () => import('../views/ReservationsView.vue')
            },
            {
                path: 'cancelled-reservations',
                name: 'CancelledReservations',
                component: () => import('../views/CancelledReservationsView.vue')
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('../views/ProfileView.vue')
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
    } else if (to.name === 'Login' && isAuthenticated) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router

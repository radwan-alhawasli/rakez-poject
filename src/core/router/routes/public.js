/**
 * Public (unauthenticated) routes.
 * @module core/router/routes/public
 */

export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { public: true },
  },
];

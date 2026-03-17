/**
 * Public (unauthenticated) routes.
 * @module core/router/routes/public
 */

export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
];

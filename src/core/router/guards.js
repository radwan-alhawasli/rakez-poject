/**
 * Navigation guards and route helpers.
 * @module core/router/guards
 */

import authService from '@/services/authService';
import { canAccessRoute, getDashboardPathForUser, isSalesLeader } from '@/utils/rbac';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { PERMISSIONS } from '@/constants/permissions';
import { LOGIN_PATH, ROOT_PATH, LOGIN_ROUTE_NAME } from './config';

export function isPublicRoute(route) {
  return Boolean(route?.meta?.public);
}

export function isLoginRoute(route) {
  return route?.name === LOGIN_ROUTE_NAME;
}

export function handleUnauthenticatedAccess(to, next) {
  logger.warn('Unauthenticated access attempt to:', to.path);
  next(LOGIN_PATH);
}

export function redirectByRole(user, next, toPath) {
  const dest = getDashboardPathForUser(user);
  if (dest === toPath) {
    next();
    return;
  }
  next(dest);
}

/**
 * Register global beforeEach guard on the router.
 * @param {import('vue-router').Router} router
 */
export function registerGuards(router) {
  router.beforeEach((to, from, next) => {
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    if (isAuthenticated && authService.isSessionExpiring()) {
      logger.warn('Session expiring soon');
    }

    if (isPublicRoute(to)) {
      if (isLoginRoute(to) && isAuthenticated) {
        return redirectByRole(user, next, to.path);
      }
      return next();
    }

    if (!isAuthenticated) return handleUnauthenticatedAccess(to, next);

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
      redirectByRole(user, next, to.path);
      return;
    }

    if (to.path === ROOT_PATH || (isLoginRoute(to) && isAuthenticated)) {
      redirectByRole(user, next, to.path);
      return;
    }

    next();
  });
}

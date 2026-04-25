/**
 * Permissions Composable
 * Provides permission checks for components (hide/show UI based on permissions)
 */

import { computed } from 'vue';
import authService from '@/services/authService';
import {
  getUserPermissions,
  hasPermission as rbacHasPermission,
  hasAnyPermission as rbacHasAnyPermission,
} from '@/utils/rbac';

/**
 * Use permissions in a component
 * @returns {{ hasPermission: function, hasAnyPermission: function, permissions: import('vue').ComputedRef<string[]>, user: import('vue').ComputedRef<any> }}
 */
export function usePermissions() {
  const user = computed(() => authService.getCurrentUser());
  const permissions = computed(() => getUserPermissions(/** @type {any} */ (user.value)));

  /** @param {any} permission */
  const hasPermission = permission => {
    return rbacHasPermission(/** @type {any} */ (user.value), permission);
  };

  /** @param {any[]} perms */
  const hasAnyPermission = perms => {
    return rbacHasAnyPermission(/** @type {any} */ (user.value), perms);
  };

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
  };
}

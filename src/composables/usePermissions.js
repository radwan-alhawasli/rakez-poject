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
 * @returns {{ hasPermission: function, hasAnyPermission: function, permissions: ComputedRef<string[]> }}
 */
export function usePermissions() {
  const user = computed(() => authService.getCurrentUser());
  const permissions = computed(() => getUserPermissions(user.value));

  const hasPermission = permission => {
    return rbacHasPermission(user.value, permission);
  };

  const hasAnyPermission = perms => {
    return rbacHasAnyPermission(user.value, perms);
  };

  return {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
  };
}

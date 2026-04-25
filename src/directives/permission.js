/**
 * v-permission directive - hides element if user lacks the specified permission
 * Usage: v-permission="'contracts.create'" or v-permission="['contracts.create', 'contracts.approve']"
 * With array: requires ANY of the permissions
 */

import { hasPermission, hasAnyPermission } from '@/utils/rbac';
import authService from '@/services/authService';

export default {
  /**
   * @param {HTMLElement} el
   * @param {import('vue').DirectiveBinding} binding
   */
  mounted(el, binding) {
    const permission = binding.value;
    if (!permission) return;

    const user = authService.getCurrentUser();
    const allowed = Array.isArray(permission)
      ? hasAnyPermission(/** @type {any} */ (user), permission)
      : hasPermission(/** @type {any} */ (user), permission);

    if (!allowed) {
      el.style.display = 'none';
    }
  },
  /**
   * @param {HTMLElement} el
   * @param {import('vue').DirectiveBinding} binding
   */
  updated(el, binding) {
    const permission = binding.value;
    if (!permission) return;

    const user = authService.getCurrentUser();
    const allowed = Array.isArray(permission)
      ? hasAnyPermission(/** @type {any} */ (user), permission)
      : hasPermission(/** @type {any} */ (user), permission);

    el.style.display = allowed ? '' : 'none';
  },
};

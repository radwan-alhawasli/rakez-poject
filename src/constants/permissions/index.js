/**
 * Permission definitions and bootstrap role map
 * Mirrors backend PHP config for frontend RBAC
 * When API does not return user.permissions, we derive from role via BOOTSTRAP_ROLE_MAP
 */

export { PERMISSIONS } from './permissionKeys.js';
export { PERMISSION_DEFINITIONS } from './permissionDefinitions.js';
export { SALES_BASE_PERMISSIONS, SALES_LEADER_EXTRA_PERMISSIONS } from './salesPermissionBundles.js';
export { BOOTSTRAP_ROLE_MAP } from './bootstrapRoleMap.js';
export { ROLE_TO_BOOTSTRAP_KEY } from './roleToBootstrapKey.js';

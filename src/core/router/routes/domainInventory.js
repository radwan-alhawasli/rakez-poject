/**
 * Inventory domain routes (nested under main layout).
 * @module core/router/routes/domainInventory
 */

import { ROLE_INVENTORY } from '@/constants/roles';

export default {
  path: 'inventory',
  component: () => import('@/modules/inventory/views/InventoryViewExtended.vue'),
  meta: { roles: [ROLE_INVENTORY] },
  children: [
    { path: '', name: 'Inventory', redirect: { name: 'InventoryDashboard' } },
    { path: 'dashboard', name: 'InventoryDashboard', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue'), meta: { roles: [ROLE_INVENTORY] } },
    { path: 'projects', name: 'InventoryProjects', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue'), meta: { roles: [ROLE_INVENTORY] } },
    { path: 'contracts', name: 'InventoryContracts', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue'), meta: { roles: [ROLE_INVENTORY] } },
    { path: 'ai-suggestions', name: 'InventoryAISuggestions', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue'), meta: { roles: [ROLE_INVENTORY] } },
  ],
};

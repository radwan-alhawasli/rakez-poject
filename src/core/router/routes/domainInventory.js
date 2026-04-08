/**
 * Inventory domain routes (nested under main layout).
 * @module core/router/routes/domainInventory
 */

import { ROLE_ADMIN, ROLE_INVENTORY } from '@/constants/roles';

export default {
  path: 'inventory',
  component: () => import('@/modules/inventory/views/InventoryViewExtended.vue'),
  meta: { roles: [ROLE_ADMIN, ROLE_INVENTORY] },
  children: [
    { path: '', name: 'Inventory', redirect: { name: 'InventoryDashboard' } },
    { path: 'dashboard', name: 'InventoryDashboard', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue') },
    { path: 'projects', name: 'InventoryProjects', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue') },
    { path: 'contracts', name: 'InventoryContracts', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue') },
    { path: 'ai-suggestions', name: 'InventoryAISuggestions', component: () => import('@/modules/inventory/views/InventoryViewExtended.vue') },
  ],
};

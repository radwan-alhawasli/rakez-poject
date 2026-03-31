/**
 * Vue Router instance. Routes are defined in ./routes.
 * @module core/router
 */

import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import routes from './routes';
import { registerGuards } from './guards';

const router = createRouter({
  history: import.meta.env?.VITEST ? createMemoryHistory() : createWebHistory(),
  routes,
});

registerGuards(router);

export { VIEW_DOMAIN_MAP } from './viewDomainMap';
export default router;

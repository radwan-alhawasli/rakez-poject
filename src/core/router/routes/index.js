/**
 * Aggregates all route modules into a single routes array.
 * @module core/router/routes
 */

import publicRoutes from './public';
import mainChildren from './mainChildren';
import domainHr from './domainHr';
import domainMarketing from './domainMarketing';
import domainSales from './domainSales';
import domainCredit from './domainCredit';
import domainAccounting from './domainAccounting';
import domainCommissionDeposits from './domainCommissionDeposits';
import domainEditor from './domainEditor';
import domainInventory from './domainInventory';
import domainManager from './domainManager';

const mainLayoutChildren = [
  ...mainChildren,
  domainHr,
  domainMarketing,
  domainSales,
  domainCredit,
  domainAccounting,
  domainCommissionDeposits,
  domainEditor,
  domainInventory,
  domainManager,
];

const mainLayoutRoute = {
  path: '/',
  component: () => import('@/layouts/MainLayout.vue'),
  children: mainLayoutChildren,
};

const catchAllRoute = {
  path: '/:pathMatch(.*)*',
  redirect: '/',
};

export default [
  ...publicRoutes,
  mainLayoutRoute,
  catchAllRoute,
];

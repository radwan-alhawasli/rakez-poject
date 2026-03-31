/**
 * Marketing API service — thin facade over split modules under `./marketing/`.
 * @module services/marketingService
 */

import marketingDashboardPlans from './marketing/marketingDashboardPlans.js';
import marketingTasksLeadsReports from './marketing/marketingTasksLeadsReports.js';

const marketingService = {
  ...marketingDashboardPlans,
  ...marketingTasksLeadsReports,
};

export default marketingService;

/**
 * Role Strategy Pattern
 * Implements different behaviors based on user roles
 */

import { ROLE_MAP } from '@/constants/roles';

/**
 * Base strategy interface
 */
class RoleStrategy {
  /**
   * @param {any} _route
   * @returns {boolean}
   */
  canAccessRoute(_route) {
    return false;
  }

  /**
   * @returns {string}
   */
  getDefaultRoute() {
    return '/';
  }

  /**
   * @returns {any[]}
   */
  getAvailableRoutes() {
    return [];
  }
}

/**
 * Marketing role strategy
 */
class MarketingStrategy extends RoleStrategy {
  /**
   * @param {any} route
   * @returns {boolean}
   */
  canAccessRoute(route) {
    const allowedRoutes = [
      '/marketing',
      '/marketing/dashboard',
      '/marketing/projects',
      '/marketing/teams',
      '/marketing/tasks',
      '/marketing/leads',
      '/marketing/plans',
      '/marketing/ai-assistant',
    ];
    return allowedRoutes.some(r => route.path.startsWith(r));
  }

  getDefaultRoute() {
    return '/marketing/dashboard';
  }

  getAvailableRoutes() {
    return [
      { path: '/marketing/dashboard', name: 'MarketingDashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…' },
      { path: '/marketing/projects', name: 'MarketingProjects', label: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹' },
      { path: '/marketing/tasks', name: 'MarketingTasks', label: 'Ø§Ù„Ù…Ù‡Ø§Ù…' },
      { path: '/marketing/leads', name: 'MarketingLeads', label: 'Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø§Ù„Ù…Ø­ØªÙ…Ù„ÙˆÙ†' },
      { path: '/marketing/plans', name: 'MarketingPlans', label: 'Ø§Ù„Ø®Ø·Ø·' },
      { path: '/marketing/ai-assistant', name: 'MarketingAiAssistant', label: 'Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ' },
    ];
  }
}

/**
 * Sales role strategy
 */
class SalesStrategy extends RoleStrategy {
  /**
   * @param {any} route
   * @returns {boolean}
   */
  canAccessRoute(route) {
    const allowedRoutes = [
      '/sales',
      '/sales/dashboard',
      '/sales/projects',
      '/sales/reservations',
      '/sales/targets',
      '/sales/attendance',
      '/sales/team',
      '/sales/tasks',
    ];
    return allowedRoutes.some(r => route.path.startsWith(r));
  }

  getDefaultRoute() {
    return '/sales/dashboard';
  }

  getAvailableRoutes() {
    return [
      { path: '/sales/dashboard', name: 'SalesDashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…' },
      { path: '/sales/projects', name: 'SalesProjects', label: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹' },
      { path: '/sales/reservations', name: 'SalesReservations', label: 'Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª' },
      { path: '/sales/targets', name: 'SalesTargets', label: 'Ø£Ù‡Ø¯Ø§Ù Ø§Ù„ÙØ±ÙŠÙ‚' },
      { path: '/sales/attendance', name: 'SalesAttendance', label: 'Ø§Ù„Ø­Ø¶ÙˆØ±' },
      { path: '/sales/team', name: 'SalesTeam', label: 'Ø§Ù„ÙØ±ÙŠÙ‚' },
      { path: '/sales/tasks', name: 'SalesTasks', label: 'Ø§Ù„Ù…Ù‡Ø§Ù…' },
    ];
  }
}

/**
 * HR role strategy
 */
class HRStrategy extends RoleStrategy {
  /**
   * @param {any} route
   * @returns {boolean}
   */
  canAccessRoute(route) {
    const allowedRoutes = [
      '/hr',
      '/hr/dashboard',
      '/hr/teams',
      '/hr/team-performance',
      '/hr/employee-performance',
      '/hr/users',
      '/hr/reports',
    ];
    return allowedRoutes.some(r => route.path.startsWith(r));
  }

  getDefaultRoute() {
    return '/hr/dashboard';
  }

  getAvailableRoutes() {
    return [
      { path: '/hr/dashboard', name: 'HRDashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…' },
      { path: '/hr/teams', name: 'HRTeams', label: 'Ø§Ù„ÙÙØ±Ù‚' },
      { path: '/hr/team-performance', name: 'HRTeamPerformance', label: 'Ø£Ø¯Ø§Ø¡ Ø§Ù„ÙÙØ±Ù‚' },
      { path: '/hr/employee-performance', name: 'HREmployeePerformance', label: 'Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†' },
      { path: '/hr/users', name: 'HRUsers', label: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†' },
      { path: '/hr/reports', name: 'HRReports', label: 'Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±' },
    ];
  }
}

/**
 * Admin role strategy
 */
class AdminStrategy extends RoleStrategy {
  /**
   * @param {any} _route
   * @returns {boolean}
   */
  canAccessRoute(_route) {
    // Admins can access all routes
    return true;
  }

  getDefaultRoute() {
    return '/dashboard';
  }

  getAvailableRoutes() {
    return [
      { path: '/dashboard', name: 'Dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…' },
      { path: '/users', name: 'Users', label: 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ†' },
      { path: '/contracts', name: 'Contracts', label: 'Ø§Ù„Ø¹Ù‚ÙˆØ¯' },
      { path: '/project-management', name: 'ProjectManagement', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹' },
      { path: '/teams', name: 'Teams', label: 'الفرق' },
      { path: '/admin/locations', name: 'AdminLocations', label: 'إدارة المدن والأحياء' },
      { path: '/admin/order-marketing-developers', name: 'AdminOrderMarketingDevelopers', label: 'طلبات مطوري التسويق' },
    ];
  }
}

/**
 * Project Management role strategy
 */
class ProjectManagementStrategy extends RoleStrategy {
  /**
   * @param {any} route
   * @returns {boolean}
   */
  canAccessRoute(route) {
    const allowedRoutes = [
      '/dashboard',
      '/project-management',
      '/project-tracker',
      '/contracts',
      '/notifications',
    ];
    return allowedRoutes.some(r => route.path.startsWith(r));
  }

  getDefaultRoute() {
    return '/project-management';
  }

  getAvailableRoutes() {
    return [
      { path: '/dashboard', name: 'Dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…' },
      { path: '/project-management', name: 'ProjectManagement', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹' },
      { path: '/contracts', name: 'Contracts', label: 'Ø§Ù„Ø¹Ù‚ÙˆØ¯' },
      { path: '/notifications', name: 'Notifications', label: 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª' },
    ];
  }
}

/**
 * Role Strategy Factory
 */
class RoleStrategyFactory {
  constructor() {
    /** @type {Record<string, RoleStrategy>} */
    this.strategies = {
      [ROLE_MAP.marketing]: new MarketingStrategy(),
      [ROLE_MAP.sales]: new SalesStrategy(),
      [ROLE_MAP.hr]: new HRStrategy(),
      [ROLE_MAP.admin]: new AdminStrategy(),
      [ROLE_MAP.project_management]: new ProjectManagementStrategy(),
    };
  }

  /**
   * Get strategy for role
   * @param {number|string} role - User role
   * @returns {RoleStrategy} Strategy instance
   */
  getStrategy(role) {
    const normalizedRole = typeof role === 'string' ? ROLE_MAP[role] : role;
    return this.strategies[normalizedRole] || new AdminStrategy(); // Default to admin
  }

  /**
   * Register custom strategy
   * @param {number} role - Role type
   * @param {RoleStrategy} strategy - Strategy instance
   */
  registerStrategy(role, strategy) {
    this.strategies[role] = strategy;
  }
}

// Export singleton instance
export default new RoleStrategyFactory();


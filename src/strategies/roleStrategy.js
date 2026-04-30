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
      { path: '/marketing/dashboard', name: 'MarketingDashboard', label: 'لوحة التحكم' },
      { path: '/marketing/projects', name: 'MarketingProjects', label: 'المشاريع' },
      { path: '/marketing/tasks', name: 'MarketingTasks', label: 'المهام' },
      { path: '/marketing/leads', name: 'MarketingLeads', label: 'العملاء المحتملون' },
      { path: '/marketing/plans', name: 'MarketingPlans', label: 'الخطط' },
      { path: '/marketing/ai-assistant', name: 'MarketingAiAssistant', label: 'المساعد الذكي' },
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
      { path: '/sales/dashboard', name: 'SalesDashboard', label: 'لوحة التحكم' },
      { path: '/sales/projects', name: 'SalesProjects', label: 'المشاريع' },
      { path: '/sales/reservations', name: 'SalesReservations', label: 'الحجوزات' },
      { path: '/sales/targets', name: 'SalesTargets', label: 'أهداف الفريق' },
      { path: '/sales/attendance', name: 'SalesAttendance', label: 'الحضور' },
      { path: '/sales/team', name: 'SalesTeam', label: 'الفريق' },
      { path: '/sales/tasks', name: 'SalesTasks', label: 'المهام' },
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
      { path: '/hr/dashboard', name: 'HRDashboard', label: 'لوحة التحكم' },
      { path: '/hr/teams', name: 'HRTeams', label: 'الفِرق' },
      { path: '/hr/team-performance', name: 'HRTeamPerformance', label: 'أداء الفِرق' },
      { path: '/hr/employee-performance', name: 'HREmployeePerformance', label: 'أداء الموظفين' },
      { path: '/hr/users', name: 'HRUsers', label: 'المستخدمون' },
      { path: '/hr/reports', name: 'HRReports', label: 'التقارير' },
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
      { path: '/dashboard', name: 'Dashboard', label: 'لوحة التحكم' },
      { path: '/users', name: 'Users', label: 'المستخدمون' },
      { path: '/contracts', name: 'Contracts', label: 'العقود' },
      { path: '/project-management', name: 'ProjectManagement', label: 'إدارة المشاريع' },
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
      { path: '/dashboard', name: 'Dashboard', label: 'لوحة التحكم' },
      { path: '/project-management', name: 'ProjectManagement', label: 'إدارة المشاريع' },
      { path: '/contracts', name: 'Contracts', label: 'العقود' },
      { path: '/notifications', name: 'Notifications', label: 'الإشعارات' },
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


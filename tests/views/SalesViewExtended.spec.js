/**
 * SalesViewExtended Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import SalesViewExtended from '../../src/modules/sales/views/SalesViewExtended.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'مستخدم مبيعات', type: 2 })),
  },
}));

vi.mock('../../src/services/salesService', () => ({
  default: {
    getDashboard: vi.fn().mockResolvedValue({}),
    getProjects: vi.fn().mockResolvedValue([]),
    getTargets: vi.fn().mockResolvedValue([]),
    getReservations: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getAttendance: vi.fn().mockResolvedValue([]),
    getTeam: vi.fn().mockResolvedValue([]),
    getAssignments: vi.fn().mockResolvedValue([]),
    getSoldUnits: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getDeposits: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getNegotiations: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getWaitingList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/composables/sales/useSalesRouting', async () => {
  const { ref, computed } = await import('vue');
  return {
    useSalesRouting: vi.fn(() => {
      const activeTab = ref('dashboard');
      return {
        activeTab,
        visibleTabs: computed(() => [{ id: 'dashboard', label: 'Dashboard' }]),
        switchTab: vi.fn(),
        allTabs: [],
        getTabFromRoute: vi.fn(() => 'dashboard'),
      };
    }),
  };
});

vi.mock('../../src/composables/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
  })),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock('../../src/composables/useFormatters', () => ({
  useFormatters: vi.fn(() => ({
    formatCurrency: (val) => (val != null ? String(val) : '—'),
    formatDate: (val) => (val ? String(val) : 'غير محدد'),
  })),
}));

describe('SalesViewExtended', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/sales', name: 'SalesDashboard', component: SalesViewExtended },
        { path: '/sales/targets', name: 'SalesTargets', component: SalesViewExtended },
        { path: '/sales/projects', name: 'SalesProjects', component: SalesViewExtended },
        { path: '/sales/reservations', name: 'SalesReservations', component: SalesViewExtended },
      ],
    });
    await router.push('/sales');
    const pinia = createPinia();
    return mount(SalesViewExtended, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          SalesDashboardTab: { template: '<div class="sales-dashboard-stub">Dashboard</div>' },
          SalesTargetsTab: { template: '<div>Targets</div>' },
          SalesProjectsTab: { template: '<div>Projects</div>' },
          SalesUnitSearchTab: { template: '<div>Unit Search</div>' },
          ReservationsView: { template: '<div>Reservations</div>' },
          SalesAttendanceTab: { template: '<div>Attendance</div>' },
          SalesTeamTab: { template: '<div>Team</div>' },
          SalesTasksTab: { template: '<div>Tasks</div>' },
          SalesAssignmentsTab: { template: '<div>Assignments</div>' },
          SalesPaymentPlansTab: { template: '<div>Payment Plans</div>' },
          SalesProjectSchedulesTab: { template: '<div>Schedules</div>' },
          SalesSoldUnitsTab: { template: '<div>Sold Units</div>' },
          SalesDepositsTab: { template: '<div>Deposits</div>' },
          SalesAnalyticsTab: { template: '<div>Analytics</div>' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the sales-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.sales-view').exists()).toBe(true);
  });

  it('renders tab-content area', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.tab-content').exists()).toBe(true);
  });

  it('shows dashboard tab content by default', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sales-dashboard-stub').exists()).toBe(true);
  });
});

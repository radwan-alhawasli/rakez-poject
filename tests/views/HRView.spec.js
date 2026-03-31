/**
 * HRView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import HRView from '@/modules/hr/views/HRView.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'الموارد البشرية', type: 8 })),
  },
}));

vi.mock('../../src/services/hrService', () => ({
  default: {
    getDashboard: vi.fn().mockResolvedValue({}),
    getTeams: vi.fn().mockResolvedValue([]),
    getPerformance: vi.fn().mockResolvedValue([]),
    getUsers: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
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

describe('HRView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/hr', name: 'HRDashboard', component: HRView },
        { path: '/hr/teams', name: 'HRTeams', component: HRView },
        { path: '/hr/team-performance', name: 'HRTeamPerformance', component: HRView },
        { path: '/hr/employee-performance', name: 'HREmployeePerformance', component: HRView },
        { path: '/hr/users', name: 'HRUsers', component: HRView },
        { path: '/hr/reports', name: 'HRReports', component: HRView },
      ],
    });
    await router.push('/hr');
    const pinia = createPinia();
    return mount(HRView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          HRDashboardTab: { template: '<div class="hr-dashboard-stub">Dashboard</div>' },
          HRTeamsTab: { template: '<div>Teams</div>' },
          HRPerformanceTab: { template: '<div>Performance</div>' },
          HREmployeePerformanceTab: { template: '<div>Employee Performance</div>' },
          HRUsersTab: { template: '<div>Users</div>' },
          HRReportsTab: { template: '<div>Reports</div>' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the hr-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.hr-view').exists()).toBe(true);
  });

  it('renders tab-content area', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.tab-content').exists()).toBe(true);
  });

  it('shows dashboard tab by default', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.hr-dashboard-stub').exists()).toBe(true);
  });
});

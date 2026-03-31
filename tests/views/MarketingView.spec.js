/**
 * MarketingView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import MarketingView from '@/modules/marketing/views/MarketingView.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'مستخدم تسويق', type: 5 })),
  },
}));

vi.mock('../../src/services/marketingService', () => ({
  default: {
    getDashboard: vi.fn().mockResolvedValue({}),
    getProjects: vi.fn().mockResolvedValue([]),
    getTasks: vi.fn().mockResolvedValue([]),
    getLeads: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock('../../src/services/salesService', () => ({
  default: {
    getProjects: vi.fn().mockResolvedValue([]),
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

describe('MarketingView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/marketing', name: 'MarketingDashboard', component: MarketingView },
        { path: '/marketing/:tab', name: 'MarketingTab', component: MarketingView },
      ],
    });
    await router.push('/marketing');
    const pinia = createPinia();
    return mount(MarketingView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          MarketingDashboardTab: { template: '<div class="marketing-dashboard-stub">Dashboard</div>' },
          MarketingProjectsTab: { template: '<div>Projects</div>' },
          MarketingDeveloperPlanTab: { template: '<div>Plan</div>' },
          MarketingEmployeePlansTab: { template: '<div>Employee Plans</div>' },
          MarketingTasksTab: { template: '<div>Tasks</div>' },
          MarketingLeadsTab: { template: '<div>Leads</div>' },
          MarketingExpectedSalesTab: { template: '<div>Expected Sales</div>' },
          MarketingReportsTab: { template: '<div>Reports</div>' },
          MarketingAiAssistantTab: { template: '<div>AI</div>' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the marketing-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.marketing-view').exists()).toBe(true);
  });

  it('renders tab-content area', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.tab-content').exists()).toBe(true);
  });

  it('shows dashboard tab content by default', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.marketing-dashboard-stub').exists()).toBe(true);
  });
});

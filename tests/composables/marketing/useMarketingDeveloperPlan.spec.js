import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';

vi.mock('@/services/marketingService', () => ({
  default: {
    getProjects: vi.fn(),
    getDeveloperPlan: vi.fn(),
    getProjectByContractId: vi.fn(),
    calculateDeveloperPlanBudget: vi.fn(),
    saveDeveloperPlan: vi.fn(),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: { addNotification: vi.fn() },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({ formatNumber: v => String(v) }),
}));

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({ hasPermission: vi.fn(() => true) }),
}));

vi.mock('@/composables/useToast', () => {
  const toast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
  return { toast, useToast: () => ({ toast, toasts: { value: [] }, removeToast: vi.fn() }) };
});

import marketingService from '@/services/marketingService';
import { toast } from '@/composables/useToast';
import { useMarketingDeveloperPlan, DEVELOPER_PLAN_PLATFORMS } from '@/composables/marketing/useMarketingDeveloperPlan';

async function mountDeveloperPlan(routeQuery = {}) {
  marketingService.getProjects.mockResolvedValue({
    items: [
      {
        id: 20,
        name: 'DevProj',
        commission_percentage: 4,
        average_unit_price: 500000,
        contract_id: 99,
      },
    ],
  });
  marketingService.getDeveloperPlan.mockResolvedValue(null);

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  });
  await router.push({ path: '/', query: routeQuery });

  const Comp = defineComponent({
    setup() {
      return useMarketingDeveloperPlan();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp, { global: { plugins: [router] } });
  await flushPromises();
  await vi.waitFor(() => expect(wrapper.vm.projects.length).toBeGreaterThan(0));
  return wrapper;
}

describe('useMarketingDeveloperPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports platform list constant', () => {
    expect(DEVELOPER_PLAN_PLATFORMS.length).toBe(7);
  });

  it('loads projects on mount', async () => {
    const wrapper = await mountDeveloperPlan();
    expect(wrapper.vm.projects.length).toBe(1);
  });

  it('applyCampaignBudget warns when percent out of range', async () => {
    const wrapper = await mountDeveloperPlan();
    wrapper.vm.developerPlanForm.marketing_percent = '4';
    await wrapper.vm.applyCampaignBudget();
    expect(toast.warning).toHaveBeenCalled();
  });

  it('onDeveloperPlanProjectChange clears form when project cleared', async () => {
    const wrapper = await mountDeveloperPlan();
    wrapper.vm.developerPlanForm.project_id = '20';
    await wrapper.vm.onDeveloperPlanProjectChange();
    wrapper.vm.developerPlanForm.project_id = '';
    await wrapper.vm.onDeveloperPlanProjectChange();
    expect(wrapper.vm.developerPlanForm.contract_id).toBe('');
  });
});

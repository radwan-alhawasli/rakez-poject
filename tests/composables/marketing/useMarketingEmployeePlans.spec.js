import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getProjects: vi.fn(),
    getUsers: vi.fn(),
    getEmployeePlans: vi.fn(),
    suggestEmployeePlan: vi.fn(),
    createEmployeePlan: vi.fn(),
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

vi.mock('@/composables/useToast', () => {
  const toast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
  return { toast, useToast: () => ({ toast, toasts: { value: [] }, removeToast: vi.fn() }) };
});

import marketingService from '@/services/marketingService';
import { toast } from '@/composables/useToast';
import { useMarketingEmployeePlans } from '@/composables/marketing/useMarketingEmployeePlans';

async function mountEmployeePlans() {
  marketingService.getProjects.mockResolvedValue({
    items: [
      {
        id: 10,
        name: 'Proj',
        average_unit_price: 1000000,
        commission_percentage: 5,
      },
    ],
  });
  const Comp = defineComponent({
    setup() {
      return useMarketingEmployeePlans();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await flushPromises();
  await vi.waitFor(() => {
    expect(wrapper.vm.projects.length).toBeGreaterThan(0);
  });
  return wrapper;
}

describe('useMarketingEmployeePlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads projects on mount', async () => {
    const wrapper = await mountEmployeePlans();
    expect(wrapper.vm.projects.length).toBe(1);
    expect(marketingService.getUsers).not.toHaveBeenCalled();
  });

  it('platformDistributionSum is 100 by default', async () => {
    const wrapper = await mountEmployeePlans();
    expect(wrapper.vm.platformDistributionSum).toBe(100);
  });

  it('employeePlanBudgetSummary derives from selected project', async () => {
    const wrapper = await mountEmployeePlans();
    wrapper.vm.employeePlansProjectId = '10';
    await wrapper.vm.$nextTick();
    const s = wrapper.vm.employeePlanBudgetSummary;
    expect(s.commission_value).toBeGreaterThan(0);
    expect(s.marketing_value).toBeGreaterThanOrEqual(0);
  });

  it('loadEmployeePlans clears list when no project selected', async () => {
    const wrapper = await mountEmployeePlans();
    wrapper.vm.employeePlansProjectId = '';
    await wrapper.vm.loadEmployeePlans();
    expect(wrapper.vm.employeePlans).toEqual([]);
  });

});

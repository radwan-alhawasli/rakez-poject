import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getProjects: vi.fn(),
    getUsers: vi.fn(),
    getEmployeePlans: vi.fn(),
    autoGenerateEmployeePlan: vi.fn(),
    suggestEmployeePlan: vi.fn(),
    createEmployeePlan: vi.fn(),
    exportEmployeePlansByProject: vi.fn(),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: { addNotification: vi.fn() },
}));

vi.mock('@/services/pdfService', () => ({
  generatePlatformDistributionPdf: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
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
  marketingService.getUsers.mockResolvedValue([{ id: 1, type: 5, name: 'Emp' }]);

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
    expect(wrapper.vm.marketingEmployees.length).toBeGreaterThan(0);
  });
  return wrapper;
}

describe('useMarketingEmployeePlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads projects and marketing employees on mount', async () => {
    const wrapper = await mountEmployeePlans();
    expect(wrapper.vm.projects.length).toBe(1);
    expect(wrapper.vm.marketingEmployees.length).toBe(1);
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

  it('autoGenerateEmployeePlan warns without project', async () => {
    const wrapper = await mountEmployeePlans();
    wrapper.vm.employeePlansProjectId = '';
    await wrapper.vm.autoGenerateEmployeePlan();
    expect(toast.warning).toHaveBeenCalled();
  });

  it('autoGenerateEmployeePlan calls service when project set', async () => {
    marketingService.autoGenerateEmployeePlan.mockResolvedValue({});
    const wrapper = await mountEmployeePlans();
    wrapper.vm.employeePlansProjectId = '10';
    await wrapper.vm.autoGenerateEmployeePlan();
    expect(marketingService.autoGenerateEmployeePlan).toHaveBeenCalled();
  });
});

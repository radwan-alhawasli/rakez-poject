import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getProjects: vi.fn(),
    getExpectedSales: vi.fn(),
    createExpectedSale: vi.fn(),
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
import { useMarketingExpectedSales } from '@/composables/marketing/useMarketingExpectedSales';

async function mountExpectedSales() {
  const Comp = defineComponent({
    setup() {
      return useMarketingExpectedSales();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => expect(wrapper.vm.isLoadingExpectedSales).toBe(false));
  return wrapper;
}

describe('useMarketingExpectedSales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    marketingService.getProjects.mockResolvedValue({ items: [{ id: 1, name: 'P1' }] });
    marketingService.getExpectedSales.mockResolvedValue({ items: [] });
  });

  it('loads projects on mount', async () => {
    const wrapper = await mountExpectedSales();
    expect(marketingService.getProjects).toHaveBeenCalled();
    expect(wrapper.vm.projects.length).toBeGreaterThanOrEqual(1);
  });

  it('saveExpectedSale warns when project_id missing', async () => {
    const wrapper = await mountExpectedSales();
    wrapper.vm.expectedSalesForm.project_id = '';
    await wrapper.vm.saveExpectedSale();
    expect(toast.warning).toHaveBeenCalled();
    expect(marketingService.createExpectedSale).not.toHaveBeenCalled();
  });

  it('saveExpectedSale calls API and reloads', async () => {
    marketingService.createExpectedSale.mockResolvedValue({});
    const wrapper = await mountExpectedSales();
    wrapper.vm.expectedSalesForm.project_id = '1';
    wrapper.vm.expectedSalesForm.direct_communications = 10;
    wrapper.vm.expectedSalesForm.hand_raises = 10;
    wrapper.vm.expectedSalesForm.conversion_rate_percent = 50;
    await wrapper.vm.saveExpectedSale();
    expect(marketingService.createExpectedSale).toHaveBeenCalled();
    expect(marketingService.getExpectedSales).toHaveBeenCalled();
  });

  it('formatDate handles empty', async () => {
    const wrapper = await mountExpectedSales();
    expect(wrapper.vm.formatDate('')).toMatch(/غير/);
  });
});

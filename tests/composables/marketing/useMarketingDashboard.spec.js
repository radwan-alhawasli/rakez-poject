import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getDashboard: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({ formatNumber: v => String(v) }),
}));

import marketingService from '@/services/marketingService';
import { useMarketingDashboard } from '@/composables/marketing/useMarketingDashboard';

async function mountDashboard() {
  const Comp = defineComponent({
    setup() {
      return useMarketingDashboard();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => {
    expect(wrapper.vm.isLoadingDashboard).toBe(false);
  });
  return wrapper;
}

describe('useMarketingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads dashboard metrics on mount', async () => {
    marketingService.getDashboard.mockResolvedValue({
      total_leads: 10,
      available_units_value: 1000,
      deposit_cost: 5,
      daily_deposits_count: 2,
      total_daily_spend: 100,
    });
    const wrapper = await mountDashboard();
    expect(wrapper.vm.dashboardMetrics.total_leads).toBe(10);
    expect(wrapper.vm.dashboardMetrics.available_units_value).toBe(1000);
  });

  it('depositCostDisplay uses deposit_cost when positive', async () => {
    marketingService.getDashboard.mockResolvedValue({
      deposit_cost: 42,
      daily_deposits_count: 0,
      total_daily_spend: 0,
    });
    const wrapper = await mountDashboard();
    expect(wrapper.vm.depositCostDisplay).toBe(42);
  });

  it('depositCostDisplay derives from spend/deposits when deposit_cost is zero', async () => {
    marketingService.getDashboard.mockResolvedValue({
      deposit_cost: 0,
      daily_deposits_count: 4,
      total_daily_spend: 200,
    });
    const wrapper = await mountDashboard();
    expect(wrapper.vm.depositCostDisplay).toBe(50);
  });

  it('resets metrics on getDashboard failure', async () => {
    marketingService.getDashboard.mockRejectedValue(new Error('network'));
    const wrapper = await mountDashboard();
    expect(wrapper.vm.dashboardMetrics.total_leads).toBe(0);
  });
});

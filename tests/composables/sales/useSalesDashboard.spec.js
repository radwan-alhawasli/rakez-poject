import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/salesService', () => ({
  default: {
    getDashboard: vi.fn(),
    getProjects: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'سالم', type: 5 })),
  },
}));

vi.mock('@/utils/rbac', () => ({
  isSalesLeader: vi.fn(() => false),
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatCurrency: vi.fn(v => `${v} SAR`),
    formatCurrencyAr: vi.fn(v => `${v} ر.س`),
    formatDate: vi.fn(v => v || '—'),
    formatNumber: vi.fn(v => String(v)),
  }),
}));

import salesService from '@/services/salesService';
import { useSalesDashboard } from '@/composables/sales/useSalesDashboard';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useSalesDashboard();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useSalesDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state with dynamic date filters', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.dashboardData).toBeNull();
    expect(wrapper.vm.isLoadingDashboard).toBe(false);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    expect(wrapper.vm.dashboardFilters.from).toBe(`${year}-${month}-01`);
    expect(wrapper.vm.dashboardFilters.to).toBe(
      `${year}-${month}-${String(lastDay).padStart(2, '0')}`
    );
    expect(wrapper.vm.dashboardFilters.scope).toBe('me');
  });

  it('should populate dashboardData on loadDashboard', async () => {
    salesService.getDashboard.mockResolvedValue({
      data: {
        reserved_units: 10,
        available_units: 50,
        confirmed_count: 8,
        negotiation_count: 2,
      },
    });
    salesService.getProjects.mockResolvedValue([]);
    const wrapper = mountComposable();
    await wrapper.vm.loadDashboard();
    expect(wrapper.vm.dashboardData).not.toBeNull();
    expect(wrapper.vm.isLoadingDashboard).toBe(false);
  });

  it('should compute confirmedVsNegotiationRatio correctly', async () => {
    salesService.getDashboard.mockResolvedValue({
      confirmed_count: 8,
      negotiation_count: 2,
    });
    salesService.getProjects.mockResolvedValue([]);
    const wrapper = mountComposable();
    await wrapper.vm.loadDashboard();
    expect(wrapper.vm.computedConfirmedVsNegotiationRatio).toBe(80);
  });

  it('should return 0 ratio when dashboardData is null', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.computedConfirmedVsNegotiationRatio).toBe(0);
  });

  it('should use percent_confirmed from API when available', async () => {
    salesService.getDashboard.mockResolvedValue({
      percent_confirmed: 65,
      confirmed_count: 8,
      negotiation_count: 2,
    });
    salesService.getProjects.mockResolvedValue([]);
    const wrapper = mountComposable();
    await wrapper.vm.loadDashboard();
    expect(wrapper.vm.computedConfirmedVsNegotiationRatio).toBe(65);
  });

  it('should handle error in loadDashboard gracefully', async () => {
    salesService.getDashboard.mockRejectedValue(new Error('Network'));
    const wrapper = mountComposable();
    await wrapper.vm.loadDashboard();
    expect(wrapper.vm.isLoadingDashboard).toBe(false);
    expect(wrapper.vm.dashboardData).toBeNull();
  });
});

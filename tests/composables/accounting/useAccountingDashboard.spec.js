import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/accountingService', () => ({
  default: {
    getDashboard: vi.fn(),
    getPendingDeposits: vi.fn(),
    getDepositsFollowUp: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'محمد', type: 1 })),
  },
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

import accountingService from '@/services/accountingService';
import { useAccountingDashboard } from '@/composables/accounting/useAccountingDashboard';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useAccountingDashboard();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useAccountingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    accountingService.getPendingDeposits.mockResolvedValue({ total: 0 });
    accountingService.getDepositsFollowUp.mockResolvedValue({ total: 0 });
  });

  it('should have initial state with isLoading=false and dashboardMetrics zeroes', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.dashboardMetrics.totalUnitsSold).toBe(0);
    expect(wrapper.vm.dashboardMetrics.totalDeposits).toBe(0);
    expect(wrapper.vm.dashboardMetrics.totalDepositsRefunded).toBe(0);
    expect(wrapper.vm.dashboardMetrics.totalProjectsValue).toBe(0);
    expect(wrapper.vm.dashboardMetrics.totalSalesValue).toBe(0);
    expect(wrapper.vm.dashboardMetrics.totalCommissions).toBe(0);
    expect(wrapper.vm.dashboardMetrics.pendingDeposits).toBe(0);
    expect(wrapper.vm.dashboardMetrics.pendingSalaries).toBe(0);
    expect(wrapper.vm.dashboardMetrics.unreadNotifications).toBe(0);
  });

  it('should have dynamic date filters for current month', () => {
    const wrapper = mountComposable();
    const now = new Date();
    const expectedFrom = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const expectedTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    expect(wrapper.vm.dashboardFromDate).toBe(expectedFrom);
    expect(wrapper.vm.dashboardToDate).toBe(expectedTo);
  });

  it('should set isLoading=true then false during loadDashboardMetrics', async () => {
    let resolvePromise;
    accountingService.getDashboard.mockReturnValue(
      new Promise(r => { resolvePromise = r; })
    );
    const wrapper = mountComposable();
    const promise = wrapper.vm.loadDashboardMetrics();
    expect(wrapper.vm.isLoading).toBe(true);
    resolvePromise({});
    await promise;
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should populate dashboardMetrics on successful API call', async () => {
    accountingService.getDashboard.mockResolvedValue({
      total_units_sold: 12,
      total_deposits: 50000,
      total_deposits_refunded: 1000,
      total_projects_value: 200000,
      total_sales_value: 180000,
      total_commissions: 9000,
      pending_deposits: 3,
      pending_salaries: 2,
      unread_notifications: 5,
    });
    const wrapper = mountComposable();
    await wrapper.vm.loadDashboardMetrics();
    expect(wrapper.vm.dashboardMetrics.totalUnitsSold).toBe(12);
    expect(wrapper.vm.dashboardMetrics.totalDeposits).toBe(50000);
    expect(wrapper.vm.dashboardMetrics.totalDepositsRefunded).toBe(1000);
    expect(wrapper.vm.dashboardMetrics.totalProjectsValue).toBe(200000);
    expect(wrapper.vm.dashboardMetrics.totalSalesValue).toBe(180000);
    expect(wrapper.vm.dashboardMetrics.totalCommissions).toBe(9000);
    expect(wrapper.vm.dashboardMetrics.pendingDeposits).toBe(3);
    expect(wrapper.vm.dashboardMetrics.pendingSalaries).toBe(2);
    expect(wrapper.vm.dashboardMetrics.unreadNotifications).toBe(5);
  });

  it('should handle failed API call gracefully and set isLoading=false', async () => {
    accountingService.getDashboard.mockRejectedValue(new Error('Network error'));
    const wrapper = mountComposable();
    await wrapper.vm.loadDashboardMetrics();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.dashboardMetrics.totalUnitsSold).toBe(0);
  });

  it('should return userName from auth service', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.userName).toBe('محمد');
  });
});

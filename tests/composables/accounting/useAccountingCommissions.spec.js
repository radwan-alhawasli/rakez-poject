import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/accountingService', () => ({
  default: {
    getCommissions: vi.fn(),
    updateDistributions: vi.fn(),
    approveDistribution: vi.fn(),
    rejectDistribution: vi.fn(),
    confirmPayment: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useToast', () => {
  const t = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  return { toast: t, useToast: () => ({ toast: t, toasts: { value: [] }, removeToast: vi.fn() }) };
});

vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatCurrency: vi.fn(v => `${v} SAR`),
    formatCurrencyAr: vi.fn(v => `${v} ر.س`),
    formatDate: vi.fn(v => v || '—'),
    formatNumber: vi.fn(v => String(v)),
  }),
}));

vi.mock('@/utils/statusHelpers', () => ({
  getStatusClass: vi.fn(() => 'good'),
}));

import accountingService from '@/services/accountingService';
import { toast } from '@/composables/useToast';
import { useAccountingCommissions } from '@/composables/accounting/useAccountingCommissions';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useAccountingCommissions();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useAccountingCommissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.commissions).toEqual([]);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.perPage).toBe(25);
    expect(wrapper.vm.totalItems).toBe(0);
    expect(wrapper.vm.showCommissionModal).toBe(false);
    expect(wrapper.vm.selectedCommission).toBeNull();
  });

  it('should populate commissions array on loadCommissions', async () => {
    const mockItems = [
      { id: 1, amount: 3000, status: 'pending' },
      { id: 2, amount: 5000, status: 'approved' },
    ];
    accountingService.getCommissions.mockResolvedValue({
      items: mockItems,
      total: 2,
    });
    const wrapper = mountComposable();
    await wrapper.vm.loadCommissions();
    expect(wrapper.vm.commissions).toEqual(mockItems);
    expect(wrapper.vm.totalItems).toBe(2);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should open modal on viewCommissionDetail', () => {
    const wrapper = mountComposable();
    const commission = { id: 5, amount: 7000 };
    wrapper.vm.viewCommissionDetail(commission);
    expect(wrapper.vm.selectedCommission).toEqual(commission);
    expect(wrapper.vm.showCommissionModal).toBe(true);
  });

  it('should handle handlePageChange correctly', async () => {
    accountingService.getCommissions.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePageChange(2);
    expect(wrapper.vm.currentPage).toBe(2);
    expect(accountingService.getCommissions).toHaveBeenCalled();
  });

  it('should handle handlePerPageChange correctly', async () => {
    accountingService.getCommissions.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePerPageChange(50);
    expect(wrapper.vm.perPage).toBe(50);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(accountingService.getCommissions).toHaveBeenCalled();
  });

  it('should handle error in loadCommissions', async () => {
    accountingService.getCommissions.mockRejectedValue(new Error('API Error'));
    const wrapper = mountComposable();
    await wrapper.vm.loadCommissions();
    expect(wrapper.vm.commissions).toEqual([]);
    expect(wrapper.vm.totalItems).toBe(0);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should show error toast on handleCommissionUpdate failure', async () => {
    accountingService.updateDistributions.mockRejectedValue(new Error('Fail'));
    const wrapper = mountComposable();
    wrapper.vm.viewCommissionDetail({ id: 1 });
    await wrapper.vm.handleCommissionUpdate({ action: 'update' });
    expect(toast.error).toHaveBeenCalled();
  });
});

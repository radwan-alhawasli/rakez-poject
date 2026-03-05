import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/accountingService', () => ({
  default: {
    getPendingDeposits: vi.fn(),
    getDepositsFollowUp: vi.fn(),
    generateClaimFile: vi.fn(),
    confirmCommissionReceived: vi.fn(),
    confirmDeposit: vi.fn(),
    processRefund: vi.fn(),
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

import accountingService from '@/services/accountingService';
import { toast } from '@/composables/useToast';
import { useAccountingDeposits } from '@/composables/accounting/useAccountingDeposits';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useAccountingDeposits();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useAccountingDeposits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.deposits).toEqual([]);
    expect(wrapper.vm.depositsSubTab).toBe('manage');
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.perPage).toBe(25);
    expect(wrapper.vm.totalItems).toBe(0);
    expect(wrapper.vm.showDepositModal).toBe(false);
    expect(wrapper.vm.selectedDeposit).toBeNull();
  });

  it('should populate deposits array on loadDeposits', async () => {
    const mockItems = [
      { id: 1, amount: 5000 },
      { id: 2, amount: 10000 },
    ];
    accountingService.getPendingDeposits.mockResolvedValue({
      items: mockItems,
      total: 2,
    });
    const wrapper = mountComposable();
    await wrapper.vm.loadDeposits();
    expect(wrapper.vm.deposits).toEqual(mockItems);
    expect(wrapper.vm.totalItems).toBe(2);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should switch sub-tab and reset currentPage', async () => {
    accountingService.getDepositsFollowUp.mockResolvedValue({ items: [], total: 0 });
    accountingService.getPendingDeposits.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.setDepositsSubTab('follow_up');
    expect(wrapper.vm.depositsSubTab).toBe('follow_up');
    expect(wrapper.vm.currentPage).toBe(1);
    expect(accountingService.getDepositsFollowUp).toHaveBeenCalled();
  });

  it('should switch back to manage sub-tab', async () => {
    accountingService.getPendingDeposits.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.setDepositsSubTab('manage');
    expect(wrapper.vm.depositsSubTab).toBe('manage');
    expect(accountingService.getPendingDeposits).toHaveBeenCalled();
  });

  it('should handle handlePageChange correctly', async () => {
    accountingService.getPendingDeposits.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePageChange(3);
    expect(wrapper.vm.currentPage).toBe(3);
    expect(accountingService.getPendingDeposits).toHaveBeenCalled();
  });

  it('should handle handlePerPageChange correctly', async () => {
    accountingService.getPendingDeposits.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePerPageChange(50);
    expect(wrapper.vm.perPage).toBe(50);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(accountingService.getPendingDeposits).toHaveBeenCalled();
  });

  it('should handle error in loadDeposits', async () => {
    accountingService.getPendingDeposits.mockRejectedValue(new Error('API Error'));
    const wrapper = mountComposable();
    await wrapper.vm.loadDeposits();
    expect(wrapper.vm.deposits).toEqual([]);
    expect(wrapper.vm.totalItems).toBe(0);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should handle error in generateClaimFile', async () => {
    accountingService.generateClaimFile.mockRejectedValue(new Error('Fail'));
    const wrapper = mountComposable();
    await wrapper.vm.generateClaimFile({ id: 1 });
    expect(toast.error).toHaveBeenCalled();
  });
});

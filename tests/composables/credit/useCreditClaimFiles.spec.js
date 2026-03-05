import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/creditService', () => ({
  default: {
    getClaimFiles: vi.fn(),
    getClaimFileCandidates: vi.fn(),
    createCombinedClaimFile: vi.fn(),
    generateBulkClaimFiles: vi.fn(),
    getClaimFilePdfDownloadUrl: vi.fn(() => 'http://example.com/pdf'),
    generateClaimFilePdf: vi.fn(),
    submitClaim: vi.fn(),
    approveClaim: vi.fn(),
    createClaimFile: vi.fn(),
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
  getClaimStatusClass: vi.fn(() => 'good'),
}));

import creditService from '@/services/creditService';
import { toast } from '@/composables/useToast';
import { useCreditClaimFiles } from '@/composables/credit/useCreditClaimFiles';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useCreditClaimFiles();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useCreditClaimFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.claimFiles).toEqual([]);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.perPage).toBe(25);
    expect(wrapper.vm.totalItems).toBe(0);
    expect(wrapper.vm.showClaimModal).toBe(false);
    expect(wrapper.vm.selectedClaim).toBeNull();
  });

  it('should populate claimFiles on loadClaimFiles', async () => {
    const mockItems = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'completed' },
    ];
    creditService.getClaimFiles.mockResolvedValue({
      items: mockItems,
      total: 2,
    });
    const wrapper = mountComposable();
    await wrapper.vm.loadClaimFiles();
    expect(wrapper.vm.claimFiles).toEqual(mockItems);
    expect(wrapper.vm.totalItems).toBe(2);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should handle handlePageChange correctly', async () => {
    creditService.getClaimFiles.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePageChange(4);
    expect(wrapper.vm.currentPage).toBe(4);
    expect(creditService.getClaimFiles).toHaveBeenCalled();
  });

  it('should handle handlePerPageChange correctly', async () => {
    creditService.getClaimFiles.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePerPageChange(100);
    expect(wrapper.vm.perPage).toBe(100);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(creditService.getClaimFiles).toHaveBeenCalled();
  });

  it('should handle error in loadClaimFiles', async () => {
    creditService.getClaimFiles.mockRejectedValue(new Error('API Error'));
    const wrapper = mountComposable();
    await wrapper.vm.loadClaimFiles();
    expect(wrapper.vm.claimFiles).toEqual([]);
    expect(wrapper.vm.totalItems).toBe(0);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should show error toast on handleClaimSubmit failure', async () => {
    creditService.createClaimFile.mockRejectedValue(new Error('Fail'));
    const wrapper = mountComposable();
    await wrapper.vm.handleClaimSubmit({ amount: 1000 });
    expect(toast.error).toHaveBeenCalled();
  });
});

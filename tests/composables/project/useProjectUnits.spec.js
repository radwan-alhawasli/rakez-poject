import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/contractService', () => ({
  default: {
    getContractUnits: vi.fn(),
    addContractUnit: vi.fn(),
    updateContractUnit: vi.fn(),
    deleteUnit: vi.fn(),
    uploadContractUnitsCsv: vi.fn(),
    downloadContract: vi.fn(),
  },
}));

vi.mock('@/services/salesService', () => ({
  default: {
    getProjectUnits: vi.fn(),
    createReservation: vi.fn(),
    getReservationContext: vi.fn(),
    downloadUnitPdf: vi.fn(),
    addToWaitingList: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'سالم', type: 3 })),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: {
    addNotification: vi.fn(),
  },
}));

vi.mock('@/services/pdfService', () => ({
  generateUnitDetailsPdf: vi.fn(),
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

vi.mock('@/constants/lookups', () => ({
  NATIONALITIES: [{ value: 'Saudi', label: 'سعودي' }],
}));

import contractService from '@/services/contractService';
import { useProjectUnits } from '@/composables/project/useProjectUnits';

function mountComposable(projectId = 10, projectName = 'مشروع تست') {
  const Comp = defineComponent({
    setup() {
      return useProjectUnits(projectId, projectName);
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useProjectUnits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.units).toEqual([]);
    expect(wrapper.vm.unitsLoading).toBe(false);
    expect(wrapper.vm.unitsFilterTab).toBe('available');
    expect(wrapper.vm.showAddUnitModal).toBe(false);
    expect(wrapper.vm.isEditingUnit).toBe(false);
  });

  it('should populate units on loadUnits', async () => {
    const mockUnits = [
      { id: 1, unit_number: '101', status: 'available', price: 100000 },
      { id: 2, unit_number: '102', status: 'sold', price: 200000 },
    ];
    contractService.getContractUnits.mockResolvedValue(mockUnits);
    const wrapper = mountComposable();
    await wrapper.vm.loadUnits();
    expect(wrapper.vm.units).toEqual(mockUnits);
    expect(wrapper.vm.unitsLoading).toBe(false);
  });

  it('should not load units if projectId is falsy', async () => {
    const wrapper = mountComposable(null);
    await wrapper.vm.loadUnits();
    expect(contractService.getContractUnits).not.toHaveBeenCalled();
  });

  it('should handle error in loadUnits', async () => {
    contractService.getContractUnits.mockRejectedValue(new Error('API Error'));
    const wrapper = mountComposable();
    await wrapper.vm.loadUnits();
    expect(wrapper.vm.units).toEqual([]);
    expect(wrapper.vm.unitsLoading).toBe(false);
  });

  it('should compute filteredUnits based on filter tab', async () => {
    const mockUnits = [
      { id: 1, unit_number: '101', status: 'available', price: 100000 },
      { id: 2, unit_number: '102', status: 'sold', price: 200000 },
    ];
    contractService.getContractUnits.mockResolvedValue(mockUnits);
    const wrapper = mountComposable();
    await wrapper.vm.loadUnits();
    // default tab is "available" — mock list has one available + one sold
    expect(wrapper.vm.filteredUnits.length).toBe(1);
    expect(wrapper.vm.filteredUnits[0].status).toBe('available');
  });
});

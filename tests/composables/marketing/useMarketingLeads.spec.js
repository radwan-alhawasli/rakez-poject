import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getLeads: vi.fn(),
    storeLead: vi.fn(),
    getProjects: vi.fn(),
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

vi.mock('@/constants/lookups', () => ({
  LEAD_SOURCES: ['Snapchat', 'Instagram', 'Twitter', 'Google Ads'],
}));

import marketingService from '@/services/marketingService';
import { toast } from '@/composables/useToast';
import { useMarketingLeads } from '@/composables/marketing/useMarketingLeads';

async function mountComposable(leadsData = { items: [] }) {
  marketingService.getLeads.mockResolvedValue(leadsData);
  marketingService.getProjects.mockResolvedValue({ items: [] });
  const Comp = defineComponent({
    setup() {
      return useMarketingLeads();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => {
    expect(wrapper.vm.isLoadingLeads).toBe(false);
  });
  return wrapper;
}

describe('useMarketingLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', async () => {
    const wrapper = await mountComposable();
    expect(wrapper.vm.isLoadingLeads).toBe(false);
    expect(wrapper.vm.leadSearchQuery).toBe('');
    expect(wrapper.vm.showAddLeadModal).toBe(false);
    expect(wrapper.vm.isSubmitting).toBe(false);
  });

  it('should populate leads on loadLeads', async () => {
    const mockLeads = [
      { id: 1, name: 'عميل أ', phone: '0500000001', source: 'Snapchat' },
      { id: 2, name: 'عميل ب', phone: '0500000002', source: 'Instagram' },
    ];
    const wrapper = await mountComposable({ items: mockLeads });
    expect(wrapper.vm.filteredLeads).toEqual(mockLeads);
    expect(wrapper.vm.isLoadingLeads).toBe(false);
  });

  it('should use toast.success on saveLead (not notificationService)', async () => {
    marketingService.storeLead.mockResolvedValue({});
    const wrapper = await mountComposable();
    wrapper.vm.leadForm.name = 'عميل جديد';
    wrapper.vm.leadForm.contact_info = '0501234567';
    wrapper.vm.leadForm.source = 'Snapchat';
    await wrapper.vm.saveLead();
    expect(toast.success).toHaveBeenCalled();
    expect(wrapper.vm.showAddLeadModal).toBe(false);
  });

  it('should filter leads based on search query', async () => {
    const mockLeads = [
      { id: 1, name: 'أحمد', client_name: '', phone: '0500000001' },
      { id: 2, name: 'خالد', client_name: '', phone: '0500000002' },
    ];
    const wrapper = await mountComposable({ items: mockLeads });
    wrapper.vm.leadSearchQuery = 'أحمد';
    expect(wrapper.vm.filteredLeads.length).toBe(1);
    expect(wrapper.vm.filteredLeads[0].name).toBe('أحمد');
  });

  it('should filter leads by phone number', async () => {
    const mockLeads = [
      { id: 1, name: 'أحمد', phone: '0501111111' },
      { id: 2, name: 'خالد', phone: '0502222222' },
    ];
    const wrapper = await mountComposable({ items: mockLeads });
    wrapper.vm.leadSearchQuery = '0502222222';
    expect(wrapper.vm.filteredLeads.length).toBe(1);
    expect(wrapper.vm.filteredLeads[0].id).toBe(2);
  });

  it('should handle error in loadLeads', async () => {
    marketingService.getLeads.mockRejectedValue(new Error('Network'));
    marketingService.getProjects.mockResolvedValue({ items: [] });
    const Comp = defineComponent({
      setup() {
        return useMarketingLeads();
      },
      render: () => h('div'),
    });
    const wrapper = mount(Comp);
    await vi.waitFor(() => {
      expect(wrapper.vm.isLoadingLeads).toBe(false);
    });
    expect(wrapper.vm.filteredLeads).toEqual([]);
  });

  it('should show error toast on saveLead failure', async () => {
    marketingService.storeLead.mockRejectedValue(new Error('Fail'));
    const wrapper = await mountComposable();
    wrapper.vm.leadForm.name = 'عميل';
    wrapper.vm.leadForm.contact_info = '0501234567';
    wrapper.vm.leadForm.source = 'Snapchat';
    await wrapper.vm.saveLead();
    expect(toast.error).toHaveBeenCalled();
  });

  it('should show warning toast if required fields missing on saveLead', async () => {
    const wrapper = await mountComposable();
    await wrapper.vm.saveLead();
    expect(toast.warning).toHaveBeenCalled();
    expect(marketingService.storeLead).not.toHaveBeenCalled();
  });
});

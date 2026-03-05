import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

const mockRouter = { push: vi.fn().mockReturnValue(Promise.resolve()) };

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/services/marketingService', () => ({
  default: {
    getProjects: vi.fn(),
    getProjectById: vi.fn(),
    getProjectByContractId: vi.fn(),
    getRecommendedEmployee: vi.fn(),
    calculateBudget: vi.fn(),
    getDeveloperPlan: vi.fn(),
  },
}));

vi.mock('@/services/contractService', () => ({
  default: {
    getContractUnits: vi.fn(),
  },
}));

vi.mock('@/services/teamService', () => ({
  default: {
    getTeams: vi.fn(),
    addTeamsToContract: vi.fn(),
    removeTeamsFromContract: vi.fn(),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: {
    addNotification: vi.fn(),
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

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    user: { value: { type: 1 } },
    permissions: [],
  }),
}));

import marketingService from '@/services/marketingService';
import { useMarketingProjects } from '@/composables/marketing/useMarketingProjects';

async function mountComposable(initialData = { items: [] }) {
  marketingService.getProjects.mockResolvedValue(initialData);
  const Comp = defineComponent({
    setup() {
      return useMarketingProjects();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => {
    expect(wrapper.vm.isLoadingProjects).toBe(false);
  });
  return wrapper;
}

describe('useMarketingProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', async () => {
    const wrapper = await mountComposable();
    expect(wrapper.vm.isLoadingProjects).toBe(false);
    expect(wrapper.vm.projectSearchQuery).toBe('');
    expect(wrapper.vm.selectedProjectDetails).toBeNull();
    expect(wrapper.vm.showProjectDetailsModal).toBe(false);
  });

  it('should populate projects on loadProjects', async () => {
    const mockItems = [
      { id: 1, name: 'مشروع تسويق A', contract_status: 'active' },
      { id: 2, name: 'مشروع تسويق B', contract_status: 'completed' },
    ];
    const wrapper = await mountComposable({ items: mockItems });
    expect(wrapper.vm.projects).toEqual(mockItems);
    expect(wrapper.vm.isLoadingProjects).toBe(false);
  });

  it('should handle array response in loadProjects', async () => {
    const mockArr = [{ id: 1, name: 'مشروع' }];
    const wrapper = await mountComposable(mockArr);
    expect(wrapper.vm.projects).toEqual(mockArr);
  });

  it('should handle error in loadProjects', async () => {
    marketingService.getProjects.mockRejectedValue(new Error('API Error'));
    const Comp = defineComponent({
      setup() {
        return useMarketingProjects();
      },
      render: () => h('div'),
    });
    const wrapper = mount(Comp);
    await vi.waitFor(() => {
      expect(wrapper.vm.isLoadingProjects).toBe(false);
    });
    expect(wrapper.vm.projects).toEqual([]);
  });

  it('should filter projects by search query', async () => {
    const items = [
      { id: 1, project_name: 'مشروع الرياض', name: '', developer_name: 'شركة أ' },
      { id: 2, project_name: 'مشروع جدة', name: '', developer_name: 'شركة ب' },
    ];
    const wrapper = await mountComposable({ items });
    wrapper.vm.projectSearchQuery = 'الرياض';
    expect(wrapper.vm.filteredProjects.length).toBe(1);
    expect(wrapper.vm.filteredProjects[0].id).toBe(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

const mockRouter = { push: vi.fn() };

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/services/salesService', () => ({
  default: {
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
import { useSalesProjects } from '@/composables/sales/useSalesProjects';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useSalesProjects();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useSalesProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.projects).toEqual([]);
    expect(wrapper.vm.isLoadingProjects).toBe(false);
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.selectedProject).toBeNull();
    expect(wrapper.vm.showProjectModal).toBe(false);
  });

  it('should populate projects on loadProjects', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'مشروع الرياض',
        status: 'approved',
        is_ready: true,
        total_units: 10,
        available_units: 5,
      },
      {
        id: 2,
        name: 'مشروع جدة',
        status: 'pending',
        is_ready: false,
        total_units: 20,
      },
    ];
    salesService.getProjects.mockResolvedValue(mockProjects);
    const wrapper = mountComposable();
    await wrapper.vm.loadProjects();
    expect(wrapper.vm.projects.length).toBe(2);
    expect(wrapper.vm.isLoadingProjects).toBe(false);
  });

  it('should handle nested response structure', async () => {
    salesService.getProjects.mockResolvedValue({
      data: {
        data: [{ id: 1, name: 'مشروع', status: 'approved', is_ready: true, total_units: 5 }],
      },
    });
    const wrapper = mountComposable();
    await wrapper.vm.loadProjects();
    expect(wrapper.vm.projects.length).toBe(1);
  });

  it('should handle error in loadProjects', async () => {
    salesService.getProjects.mockRejectedValue(new Error('Network'));
    const wrapper = mountComposable();
    await wrapper.vm.loadProjects();
    expect(wrapper.vm.isLoadingProjects).toBe(false);
  });

  it('should navigate on viewProjectDetails', () => {
    const wrapper = mountComposable();
    wrapper.vm.viewProjectDetails(42);
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'ProjectTracker',
      params: { id: 42 },
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

const mockRouter = { push: vi.fn() };

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/services/contractService', () => ({
  default: {
    getContracts: vi.fn(),
    getEditorContracts: vi.fn(),
    getContractById: vi.fn(),
    getEditorContractById: vi.fn(),
    getPhotography: vi.fn(),
    updatePhotography: vi.fn(),
    storePhotography: vi.fn(),
    downloadContract: vi.fn(),
  },
}));

vi.mock('@/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'أحمد', type: 3, is_manager: true })),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: {
    addNotification: vi.fn(),
  },
}));

vi.mock('@/services/teamService', () => ({
  default: {
    getContractTeams: vi.fn(),
    getTeams: vi.fn(),
    addTeamsToContract: vi.fn(),
    removeTeamsFromContract: vi.fn(),
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

import contractService from '@/services/contractService';
import { useProjectManagement } from '@/composables/project/useProjectManagement';

async function mountComposable(mockData = []) {
  contractService.getContracts.mockResolvedValue({
    items: mockData,
    total: mockData.length,
  });
  const Comp = defineComponent({
    setup() {
      return useProjectManagement();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => {
    expect(wrapper.vm.isLoading).toBe(false);
  });
  return wrapper;
}

describe('useProjectManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct initial state', async () => {
    const wrapper = await mountComposable();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.searchQuery).toBe('');
    expect(wrapper.vm.showDetailsModal).toBe(false);
    expect(wrapper.vm.selectedProject).toBeNull();
  });

  it('should populate filteredProjects via onMounted fetchProjects', async () => {
    const mockProjects = [
      {
        id: 1,
        project_name: 'مشروع A',
        status: 'Pending',
        units: [],
      },
    ];
    const wrapper = await mountComposable(mockProjects);
    expect(wrapper.vm.notReadyCount).toBe(1);
    expect(wrapper.vm.filteredProjects.length).toBe(1);
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should set selectedProject on openProjectDetails', async () => {
    contractService.getContractById.mockResolvedValue({
      id: 5,
      project_name: 'تفاصيل',
      units: [],
    });
    const wrapper = await mountComposable();
    const project = { id: 5, name: 'مشروع' };
    await wrapper.vm.openProjectDetails(project);
    expect(wrapper.vm.selectedProject).not.toBeNull();
    expect(wrapper.vm.showDetailsModal).toBe(true);
  });

  it('should handle error in onMounted fetchProjects', async () => {
    contractService.getContracts.mockRejectedValue(new Error('API Error'));
    const Comp = defineComponent({
      setup() {
        return useProjectManagement();
      },
      render: () => h('div'),
    });
    const wrapper = mount(Comp);
    await vi.waitFor(() => {
      expect(wrapper.vm.isLoading).toBe(false);
    });
    expect(wrapper.vm.isLoading).toBe(false);
  });

  it('should navigate to tracker on viewTracker', async () => {
    const wrapper = await mountComposable();
    wrapper.vm.viewTracker({ id: 7 });
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'ProjectTracker',
      params: { id: 7 },
    });
  });
});

/**
 * ProjectManagementView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ProjectManagementView from '../../src/views/ProjectManagementView.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'مدير المشاريع', type: 3 })),
  },
}));

vi.mock('../../src/services/contractService', () => ({
  default: {
    getContracts: vi.fn().mockResolvedValue([]),
    getAllContracts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getEditorContracts: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/services/salesService', () => ({
  default: {
    getProjects: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/services/teamService', () => ({
  default: {
    getTeams: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/composables/project/useProjectManagement', async () => {
  const { ref, computed } = await import('vue');
  return {
    useProjectManagement: vi.fn(() => ({
      activeTab: ref('not_ready'),
      searchQuery: ref(''),
      teamFilter: ref(''),
      isLoading: ref(false),
      filteredProjects: ref([]),
      notReadyCount: computed(() => 0),
      readyCount: computed(() => 0),
      archiveCount: computed(() => 0),
      allProjectsCount: computed(() => 0),
      isEditor: ref(false),
      activeMenuId: ref(null),
      toggleMenu: vi.fn(),
      viewTracker: vi.fn(),
      onEditProject: vi.fn(),
      onArchiveProject: vi.fn(),
      onMarkComplete: vi.fn(),
      onDownloadContract: vi.fn(),
      onAssignTeam: vi.fn(),
      showAssignTeamModal: ref(false),
      projectForAssignTeam: ref(null),
      assignTeamAssigned: ref([]),
      assignTeamAvailable: ref([]),
      assignTeamSelectedId: ref(null),
      assignTeamLoading: ref(false),
      assignTeamActionLoading: ref(false),
      assignTeamSubmit: vi.fn(),
      assignTeamRemove: vi.fn(),
      closeAssignTeamModal: vi.fn(),
      selectedProject: ref(null),
      showDetailsModal: ref(false),
      openDetailsModal: vi.fn(),
      closeDetailsModal: vi.fn(),
      goToUnits: vi.fn(),
      formatCurrency: (v) => String(v || 0),
      getStatusClass: () => '',
      showWorkspaceModal: ref(false),
      workspaceForm: ref({ type: '', url: '' }),
      closeWorkspaceModal: vi.fn(),
      submitWorkspaceLink: vi.fn(),
      showMediaModalState: ref(false),
      mediaForm: ref({ image_url: '', video_url: '', description: '' }),
      isMediaSaving: ref(false),
      closeMediaModalState: vi.fn(),
      submitMediaForm: vi.fn(),
    })),
  };
});

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

describe('ProjectManagementView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/projects', name: 'ProjectManagement', component: ProjectManagementView },
        { path: '/exclusive-request', name: 'ExclusiveRequest', component: { template: '<div />' } },
      ],
    });
    await router.push('/projects');
    const pinia = createPinia();
    return mount(ProjectManagementView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          ProjectCard: { template: '<div class="project-card-stub">Project</div>' },
          ProjectDetailsModal: { template: '<div />' },
          ProjectWorkspaceModal: { template: '<div />' },
          ProjectAssignTeamModal: { template: '<div />' },
          ProjectMediaModal: { template: '<div />' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the project-management-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.project-management-view').exists()).toBe(true);
  });

  it('renders page header with title', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.page-title').exists()).toBe(true);
    expect(wrapper.find('.page-title').text()).toContain('إدارة المشاريع');
  });

  it('renders tabs container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.tabs-container').exists()).toBe(true);
  });

  it('shows empty state when no projects', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.empty-state').exists()).toBe(true);
  });
});

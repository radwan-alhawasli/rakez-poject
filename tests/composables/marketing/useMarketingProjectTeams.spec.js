import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';

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
  const toast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
  return { toast, useToast: () => ({ toast, toasts: { value: [] }, removeToast: vi.fn() }) };
});

import teamService from '@/services/teamService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useMarketingProjectTeams } from '@/composables/marketing/useMarketingProjectTeams';

function mountTeamsComposable(projectValue = { id: 55 }) {
  const projectDetailsRef = ref(projectValue);
  const reloadProject = vi.fn().mockResolvedValue(undefined);

  const Comp = defineComponent({
    setup() {
      return { ...useMarketingProjectTeams(projectDetailsRef, reloadProject), reloadProject };
    },
    render: () => h('div'),
  });

  return mount(Comp);
}

describe('useMarketingProjectTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadAvailableTeams stores returned teams', async () => {
    teamService.getTeams.mockResolvedValue([{ id: 1, name: 'A' }]);
    const wrapper = mountTeamsComposable();

    await wrapper.vm.loadAvailableTeams();

    expect(teamService.getTeams).toHaveBeenCalled();
    expect(wrapper.vm.availableTeams).toEqual([{ id: 1, name: 'A' }]);
  });

  it('loadAvailableTeams logs error on failure', async () => {
    teamService.getTeams.mockRejectedValue(new Error('fail'));
    const wrapper = mountTeamsComposable();

    await wrapper.vm.loadAvailableTeams();

    expect(logger.error).toHaveBeenCalled();
  });

  it('assignTeamToProject exits early when selection is incomplete', async () => {
    const wrapper = mountTeamsComposable(null);

    await wrapper.vm.assignTeamToProject();

    expect(teamService.addTeamsToContract).not.toHaveBeenCalled();
  });

  it('assignTeamToProject adds selected team and reloads project', async () => {
    teamService.addTeamsToContract.mockResolvedValue({});
    const wrapper = mountTeamsComposable();
    wrapper.vm.selectedTeamIdToAdd = '9';

    await wrapper.vm.assignTeamToProject();

    expect(teamService.addTeamsToContract).toHaveBeenCalledWith(55, ['9']);
    expect(notificationService.addNotification).toHaveBeenCalled();
    expect(wrapper.vm.selectedTeamIdToAdd).toBe('');
    expect(wrapper.vm.reloadProject).toHaveBeenCalled();
    expect(wrapper.vm.isTeamActionLoading).toBe(false);
  });

  it('assignTeamToProject shows error toast when service fails', async () => {
    teamService.addTeamsToContract.mockRejectedValue(new Error('fail'));
    const wrapper = mountTeamsComposable();
    wrapper.vm.selectedTeamIdToAdd = '9';

    await wrapper.vm.assignTeamToProject();

    expect(logger.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(wrapper.vm.isTeamActionLoading).toBe(false);
  });

  it('removeTeamFromProject opens confirm modal with remove handler', async () => {
    teamService.removeTeamsFromContract.mockResolvedValue({});
    const wrapper = mountTeamsComposable();

    wrapper.vm.removeTeamFromProject({ id: 7 });

    expect(wrapper.vm.showConfirmModal).toBe(true);
    expect(wrapper.vm.confirmModalConfig.title).toBe('إزالة الفريق');

    await wrapper.vm.onConfirmModalConfirm();

    expect(teamService.removeTeamsFromContract).toHaveBeenCalledWith(55, [7]);
    expect(notificationService.addNotification).toHaveBeenCalled();
    expect(wrapper.vm.reloadProject).toHaveBeenCalled();
    expect(wrapper.vm.showConfirmModal).toBe(false);
  });

  it('removeTeamFromProject handler shows toast when removal fails', async () => {
    teamService.removeTeamsFromContract.mockRejectedValue(new Error('fail'));
    const wrapper = mountTeamsComposable();

    wrapper.vm.removeTeamFromProject({ id: 7 });
    await wrapper.vm.onConfirmModalConfirm();

    expect(logger.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(wrapper.vm.showConfirmModal).toBe(false);
  });
});

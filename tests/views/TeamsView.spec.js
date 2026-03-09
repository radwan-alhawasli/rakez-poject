/**
 * TeamsView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import TeamsView from '../../src/views/TeamsView.vue';

vi.mock('../../src/services/userService', () => ({
  default: {
    getUsers: vi.fn().mockResolvedValue([]),
    getEmployees: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'مستخدم', type: 2 })),
  },
}));

vi.mock('../../src/constants/roles', () => ({
  getRoleLabel: vi.fn((type) => `Role ${type}`),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

describe('TeamsView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/teams', component: TeamsView }],
    });
    await router.push('/teams');
    const pinia = createPinia();
    return mount(TeamsView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          Dialog: { template: '<div><slot /></div>' },
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the teams-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.teams-view').exists()).toBe(true);
  });

  it('renders page header with title', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.welcome-title').text()).toContain('الأفرقة');
  });

  it('shows loading state or teams container', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const hasTeams = wrapper.find('.teams-container').exists();
    const hasLoading = wrapper.find('.loading-state').exists();
    expect(hasTeams || hasLoading).toBe(true);
  });
});

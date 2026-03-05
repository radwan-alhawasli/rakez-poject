/**
 * TasksView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import TasksView from '../../src/views/TasksView.vue';

vi.mock('../../src/services/taskService', () => ({
  default: {
    getAssignedTasks: vi.fn().mockResolvedValue({ items: [], total: 0, total_pages: 1 }),
    getRequestedTasks: vi.fn().mockResolvedValue({ items: [], total: 0, total_pages: 1 }),
    createTask: vi.fn().mockResolvedValue({}),
    updateTaskStatus: vi.fn().mockResolvedValue({}),
    getSectionUsers: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/services/notificationService', () => ({
  default: {
    state: { value: [] },
    init: vi.fn(),
  },
}));

vi.mock('../../src/services/teamService', () => ({
  default: {
    getTeams: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/services/userService', () => ({
  default: {
    getUsers: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ id: 1, name: 'مستخدم', type: 2 })),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe('TasksView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/tasks', component: TasksView }],
    });
    await router.push('/tasks');
    const pinia = createPinia();
    return mount(TasksView, {
      global: {
        plugins: [router, pinia],
        stubs: { teleport: true },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the tasks-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.tasks-view').exists()).toBe(true);
  });

  it('renders tab buttons', async () => {
    const wrapper = await createWrapper();
    const tabs = wrapper.findAll('.tab-btn');
    expect(tabs.length).toBe(2);
  });

  it('renders page header with title', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.page-header h2').text()).toContain('إدارة المهام');
  });

  it('has the assigned tab active by default', async () => {
    const wrapper = await createWrapper();
    const activeTab = wrapper.find('.tab-btn.active');
    expect(activeTab.exists()).toBe(true);
    expect(activeTab.text()).toContain('مهام مطلوبة مني');
  });
});

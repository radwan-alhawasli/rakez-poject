/**
 * NotificationsView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import NotificationsView from '../../src/views/NotificationsView.vue';

vi.mock('../../src/services/notificationService', () => ({
  default: {
    state: { value: [] },
    init: vi.fn(),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('NotificationsView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/notifications', component: NotificationsView }],
    });
    await router.push('/notifications');
    const pinia = createPinia();
    return mount(NotificationsView, {
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

  it('renders notification list container', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.management-view').exists()).toBe(true);
    expect(wrapper.find('.metrics-table-container').exists()).toBe(true);
  });

  it('displays the notifications title', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.section-title').text()).not.toBe('');
  });
});

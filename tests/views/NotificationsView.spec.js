/**
 * NotificationsView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import NotificationsView from '@/modules/app/views/NotificationsView.vue';

vi.mock('../../src/services/notificationService', () => ({
  default: {
    state: { value: [] },
    init: vi.fn(),
    fetchAll: vi.fn().mockResolvedValue(undefined),
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
    expect(wrapper.find('.rakez-erp-dashboard').exists()).toBe(true);
    expect(wrapper.find('.rakez-widget-grid').exists()).toBe(true);
  });

  it('displays the notifications title', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    const titles = wrapper.findAll('.rakez-dashboard-section-title');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0].text()).toContain('ملخص');
  });
});

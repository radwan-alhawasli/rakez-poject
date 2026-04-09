import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AppHeader from '../../src/layouts/components/AppHeader.vue';

vi.mock('../../src/components/ui/sidebar', () => ({
  SidebarTrigger: { template: '<button data-test="sidebar-trigger">Menu</button>' },
}));

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: { template: '<div />' } },
      { path: '/chat', name: 'Chat', component: { template: '<div />' } },
    ],
  });
}

function mountHeader(props = {}) {
  const router = createTestRouter();
  return mount(AppHeader, {
    global: {
      plugins: [router],
    },
    props: {
      notifications: [],
      showNotifications: false,
      unreadCount: 0,
      chatUnreadCount: 0,
      ...props,
    },
  });
}

describe('AppHeader', () => {
  it('renders without throwing', () => {
    expect(() => mountHeader()).not.toThrow();
  });

  it('shows unread count badge when unreadCount > 0', () => {
    const wrapper = mountHeader({ unreadCount: 5 });
    const badge = wrapper.find('.notification-wrapper .notification-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('5');
  });

  it('does not show notification badge when unreadCount is 0', () => {
    const wrapper = mountHeader({ unreadCount: 0 });
    expect(wrapper.find('.notification-wrapper .notification-badge').exists()).toBe(false);
  });

  it('shows chat unread badge on chat shortcut when chatUnreadCount > 0', () => {
    const wrapper = mountHeader({ chatUnreadCount: 3 });
    const chatLink = wrapper.find('.chat-shortcut-link');
    expect(chatLink.exists()).toBe(true);
    const badge = chatLink.find('.notification-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('3');
  });

  it('emits toggle-notifications on notification bell click', async () => {
    const wrapper = mountHeader();
    await wrapper.find('.notification-wrapper .notification-btn').trigger('click');
    expect(wrapper.emitted('toggle-notifications')).toBeTruthy();
  });
});

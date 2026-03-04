import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from '../../src/layouts/components/AppHeader.vue';

vi.mock('../../src/components/ui/sidebar', () => ({
  SidebarTrigger: { template: '<button data-test="sidebar-trigger">Menu</button>' },
}));

describe('AppHeader', () => {
  it('renders without throwing', () => {
    expect(() => mount(AppHeader)).not.toThrow();
  });

  it('shows unread count badge when unreadCount > 0', () => {
    const wrapper = mount(AppHeader, {
      props: { unreadCount: 5 },
    });
    const badge = wrapper.find('.notification-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('5');
  });

  it('does not show badge when unreadCount is 0', () => {
    const wrapper = mount(AppHeader, {
      props: { unreadCount: 0 },
    });
    expect(wrapper.find('.notification-badge').exists()).toBe(false);
  });

  it('emits toggle-notifications on notification button click', async () => {
    const wrapper = mount(AppHeader);
    await wrapper.find('.notification-btn').trigger('click');
    expect(wrapper.emitted('toggle-notifications')).toBeTruthy();
  });
});

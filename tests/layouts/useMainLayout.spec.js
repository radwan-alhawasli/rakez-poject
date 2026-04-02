import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';

const push = vi.fn();
const replace = vi.fn();

vi.mock('@/services/authService', () => ({
  default: {
    isAuthenticated: vi.fn(() => true),
    getCurrentUser: vi.fn(() => ({
      id: 1,
      name: 'Admin',
      email: 'admin@rakez.com',
      type: 1,
      is_leader: false,
      is_manager: false,
    })),
    logout: vi.fn().mockResolvedValue(undefined),
    fetchCurrentUser: vi.fn(),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: {
    getAll: vi.fn(() => [
      { id: 1, read: false },
      { id: 2, read: true },
    ]),
    init: vi.fn(),
    disconnect: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
  }),
}));

import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { useMainLayout } from '@/layouts/composables/useMainLayout';

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
    ],
  });
}

async function mountMainLayout() {
  const router = createTestRouter();
  router.push = push;
  router.replace = replace;
  await router.push('/');
  const Comp = defineComponent({
    setup() {
      return useMainLayout();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe('useMainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.isAuthenticated.mockReturnValue(true);
    authService.getCurrentUser.mockReturnValue({
      id: 1,
      name: 'Admin',
      email: 'admin@rakez.com',
      type: 1,
      is_leader: false,
      is_manager: false,
    });
    document.body.classList.remove('sidebar-drawer-open');
  });

  it('redirects to login when not authenticated', async () => {
    authService.isAuthenticated.mockReturnValue(false);
    const router = createTestRouter();
    router.push = push;
    router.replace = replace;
    await router.push('/');
    const Comp = defineComponent({
      setup() {
        return useMainLayout();
      },
      render: () => h('div'),
    });
    mount(Comp, { global: { plugins: [router] } });
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('exposes unreadCount from notifications', async () => {
    const wrapper = await mountMainLayout();
    expect(wrapper.vm.unreadCount).toBe(1);
  });

  it('toggles showNotifications', async () => {
    const wrapper = await mountMainLayout();
    expect(wrapper.vm.showNotifications).toBe(false);
    wrapper.vm.toggleNotifications();
    expect(wrapper.vm.showNotifications).toBe(true);
    wrapper.vm.toggleNotifications();
    expect(wrapper.vm.showNotifications).toBe(false);
  });

  it('markAsRead and markAllAsRead delegate to notificationService', async () => {
    const wrapper = await mountMainLayout();
    wrapper.vm.markAsRead(5);
    expect(notificationService.markAsRead).toHaveBeenCalledWith(5);
    wrapper.vm.markAllAsRead();
    expect(notificationService.markAllAsRead).toHaveBeenCalled();
  });

  it('handleLogout calls auth, disconnect, replace', async () => {
    const wrapper = await mountMainLayout();
    await wrapper.vm.handleLogout();
    expect(authService.logout).toHaveBeenCalled();
    expect(notificationService.disconnect).toHaveBeenCalled();
    expect(replace).toHaveBeenCalled();
    const arg = replace.mock.calls[0][0];
    expect(arg.path).toBe('/login');
    expect(arg.query.from).toBe('logout');
  });

  it('initializes notifications and fetches user on mount', async () => {
    await mountMainLayout();
    expect(notificationService.init).toHaveBeenCalled();
    expect(authService.fetchCurrentUser).toHaveBeenCalled();
  });

  it('sidebarRoleLabel shows sales leader when type 6 and is_leader', async () => {
    authService.getCurrentUser.mockReturnValue({
      id: 2,
      name: 'Leader',
      email: 's@rakez.com',
      type: 6,
      is_leader: true,
      is_manager: false,
    });
    const wrapper = await mountMainLayout();
    expect(wrapper.vm.sidebarRoleLabel).toContain('قائد المبيعات');
  });

  it('sidebarRoleLabel for sales role (type 6) without leader flags', async () => {
    authService.getCurrentUser.mockReturnValue({
      id: 2,
      name: 'Sales',
      email: 's@rakez.com',
      type: 6,
      is_leader: false,
      is_manager: false,
    });
    const wrapper = await mountMainLayout();
    expect(wrapper.vm.sidebarRoleLabel).toContain('المبيعات');
  });
});

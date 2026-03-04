import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import AppSidebar from '../../src/layouts/components/AppSidebar.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
});

const stubSidebar = { template: '<div class="sidebar-stub"><slot /></div>' };
const stubSidebarHeader = { template: '<div class="sidebar-header-stub"><slot /></div>' };
const stubSidebarContent = { template: '<div class="sidebar-content-stub"><slot /></div>' };
const stubSidebarFooter = { template: '<div class="sidebar-footer-stub"><slot /></div>' };

vi.mock('../../src/components/ui/sidebar', () => ({
  Sidebar: { template: '<div class="sidebar-stub"><slot /></div>' },
  SidebarHeader: { template: '<div class="sidebar-header-stub"><slot /></div>' },
  SidebarContent: { template: '<div class="sidebar-content-stub"><slot /></div>' },
  SidebarFooter: { template: '<div class="sidebar-footer-stub"><slot /></div>' },
}));

vi.mock('../../src/composables/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
  }),
}));

const defaultProps = {
  user: { name: 'Test User', email: 'test@rakez.com' },
  userRole: 1,
  sidebarRoleLabel: 'Admin',
  hasPermission: vi.fn(() => true),
  hasAnyPermission: vi.fn(() => true),
};

const globalOptions = {
  global: {
    plugins: [router],
    stubs: {
      Sidebar: stubSidebar,
      SidebarHeader: stubSidebarHeader,
      SidebarContent: stubSidebarContent,
      SidebarFooter: stubSidebarFooter,
      RouterLink: { template: '<a><slot /></a>' },
    },
  },
};

describe('AppSidebar', () => {
  it('renders without throwing', () => {
    expect(() =>
      mount(AppSidebar, {
        props: defaultProps,
        ...globalOptions,
      })
    ).not.toThrow();
  });

  it('emits logout when logout button is clicked', async () => {
    const wrapper = mount(AppSidebar, {
      props: defaultProps,
      ...globalOptions,
    });
    await wrapper.find('.logout-btn').trigger('click');
    expect(wrapper.emitted('logout')).toBeTruthy();
  });
});

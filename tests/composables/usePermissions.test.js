/**
 * usePermissions Composable Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { usePermissions } from '../../src/composables/usePermissions';
import authService from '../../src/services/authService';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => null),
  },
}));

describe('usePermissions', () => {
  beforeEach(() => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
  });

  it('should return user, permissions, hasPermission, hasAnyPermission', () => {
    const TestComp = defineComponent({
      setup() {
        const { user, permissions, hasPermission, hasAnyPermission } = usePermissions();
        return { user, permissions, hasPermission, hasAnyPermission };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(wrapper.vm.user).toBeDefined();
    expect(wrapper.vm.permissions).toBeDefined();
    expect(typeof wrapper.vm.hasPermission).toBe('function');
    expect(typeof wrapper.vm.hasAnyPermission).toBe('function');
  });

  it('should return empty permissions when no user', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
    const TestComp = defineComponent({
      setup() {
        const { permissions } = usePermissions();
        return { permissions };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(Array.isArray(wrapper.vm.permissions)).toBe(true);
    expect(wrapper.vm.permissions.length).toBe(0);
  });

  it('should return hasPermission false when no user', () => {
    const TestComp = defineComponent({
      setup() {
        const { hasPermission } = usePermissions();
        return { hasPermission };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(wrapper.vm.hasPermission('contracts.view')).toBe(false);
  });

  it('should reflect user permissions when user has permissions', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      type: 1,
      permissions: ['contracts.view'],
    });
    const TestComp = defineComponent({
      setup() {
        const { hasPermission, hasAnyPermission } = usePermissions();
        return { hasPermission, hasAnyPermission };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(wrapper.vm.hasPermission('contracts.view')).toBe(true);
    expect(wrapper.vm.hasAnyPermission(['contracts.view', 'other'])).toBe(true);
  });
});

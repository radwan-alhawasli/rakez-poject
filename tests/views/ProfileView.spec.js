/**
 * ProfileView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ProfileView from '../../src/views/ProfileView.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({
      name: 'مستخدم تجريبي',
      email: 'test@rakez.com',
      type: 3,
      phone: null,
    })),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/constants/roles', () => ({
  getRoleLabel: vi.fn((type) => (type === 3 ? 'موظف المبيعات' : 'غير محدد')),
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

describe('ProfileView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/profile', component: ProfileView }],
    });
    await router.push('/profile');
    const pinia = createPinia();
    return mount(ProfileView, {
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

  it('displays user profile section', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.profile-page').exists()).toBe(true);
    expect(wrapper.find('.profile-section').exists()).toBe(true);
    expect(wrapper.text()).toContain('المعلومات الشخصية');
  });

  it('displays user name in header', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.welcome-title').exists()).toBe(true);
    expect(wrapper.find('.welcome-title').text()).toContain('مستخدم تجريبي');
  });
});

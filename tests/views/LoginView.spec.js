/**
 * LoginView Smoke Test
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import LoginView from '../../src/views/LoginView.vue';

vi.mock('../../src/utils/rbac', () => ({
  getDashboardPathForUser: vi.fn(() => '/dashboard'),
}));

describe('LoginView', () => {
  it('should render without throwing', () => {
    const Dashboard = { template: '<div>Dashboard</div>' };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: LoginView },
        { path: '/dashboard', component: Dashboard },
      ],
    });
    const pinia = createPinia();
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router, pinia],
        stubs: { LoginPage: true },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('should contain LoginPage component when not stubbed', async () => {
    const Dashboard = { template: '<div>Dashboard</div>' };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: LoginView },
        { path: '/dashboard', component: Dashboard },
      ],
    });
    const pinia = createPinia();
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router, pinia],
      },
    });
    expect(wrapper.findComponent({ name: 'LoginPage' }).exists()).toBe(true);
  });
});

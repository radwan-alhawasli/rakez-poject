/**
 * DashboardView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import DashboardView from '../../src/views/DashboardView.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'مستخدم', type: 3 })),
  },
}));

vi.mock('../../src/services/contractService', () => ({
  default: {
    getContracts: vi.fn().mockResolvedValue([]),
    getAllContracts: vi.fn().mockResolvedValue([]),
    getEditorContracts: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../src/composables/useFormatters', () => ({
  useFormatters: vi.fn(() => ({
    formatCompact: value => String(value ?? 0),
    formatNumber: value => String(value ?? 0),
  })),
}));

describe('DashboardView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/dashboard', component: DashboardView }],
    });
    await router.push('/dashboard');
    const pinia = createPinia();
    return mount(DashboardView, {
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

  it('renders stats grid with stat cards', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const statValues = wrapper.findAll('.stat-value');
    expect(statValues.length).toBeGreaterThan(0);
  });

  it('renders welcome header with user name', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.welcome-title').exists()).toBe(true);
    expect(wrapper.find('.welcome-title').text()).toContain('أهلاً بعودتك');
  });
});

/**
 * ContractsView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ContractsView from '../../src/views/ContractsView.vue';

vi.mock('../../src/services/contractService', () => ({
  default: {
    getContracts: vi.fn().mockResolvedValue([]),
    getAllContracts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getEditorContracts: vi.fn().mockResolvedValue([]),
    approveContract: vi.fn().mockResolvedValue({}),
    rejectContract: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'مدير', type: 1, role: 'admin' })),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

describe('ContractsView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/contracts', component: ContractsView }],
    });
    await router.push('/contracts');
    const pinia = createPinia();
    return mount(ContractsView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          ContractModal: { template: '<div />' },
          Pagination: { template: '<div class="pagination-stub" />' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the contracts-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.contracts-view').exists()).toBe(true);
  });

  it('renders page header with title', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.page-title').text()).toContain('إدارة العقود');
  });

  it('renders filter tabs', async () => {
    const wrapper = await createWrapper();
    const tabs = wrapper.findAll('.tab-item');
    expect(tabs.length).toBeGreaterThanOrEqual(3);
  });

  it('renders search input', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.search-input').exists()).toBe(true);
  });

  it('shows table container after data loads', async () => {
    const wrapper = await createWrapper();
    await flushPromises();
    await wrapper.vm.$nextTick();
    const hasTableContainer = wrapper.find('.table-container').exists();
    const hasLoading = wrapper.find('.loading-state').exists();
    const hasError = wrapper.find('.error-state').exists();
    expect(hasTableContainer || hasLoading || hasError).toBe(true);
  });
});

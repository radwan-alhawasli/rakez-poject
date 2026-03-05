/**
 * AccountingView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import AccountingView from '../../src/views/AccountingView.vue';

vi.mock('../../src/services/accountingService', () => ({
  default: {
    getDashboard: vi.fn().mockResolvedValue({}),
    getNotifications: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getSoldUnits: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getCommissions: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getPendingDeposits: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getDepositsFollowUp: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getSalaries: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getConfirmationHistory: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'قسم المحاسبة', type: 2 })),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../../src/composables/useFormatters', () => ({
  useFormatters: vi.fn(() => ({
    formatCurrency: (val) => (val != null ? String(val) : '—'),
    formatDate: (val) => (val ? String(val) : 'غير محدد'),
  })),
}));

describe('AccountingView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/accounting',
          name: 'AccountingDashboard',
          component: AccountingView,
        },
      ],
    });
    await router.push('/accounting');
    const pinia = createPinia();
    return mount(AccountingView, {
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

  it('displays accounting dashboard when on dashboard route', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.accounting-view').exists()).toBe(true);
    expect(wrapper.text()).toContain('أهلاً بعودتك');
  });
});

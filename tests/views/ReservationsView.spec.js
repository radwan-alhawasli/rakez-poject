/**
 * ReservationsView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import ReservationsView from '../../src/views/ReservationsView.vue';

vi.mock('../../src/services/salesService', () => ({
  default: {
    getReservations: vi.fn().mockResolvedValue([]),
    getWaitingList: vi.fn().mockResolvedValue([]),
    getNegotiations: vi.fn().mockResolvedValue([]),
    cancelReservation: vi.fn().mockResolvedValue({}),
    confirmReservation: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ id: 1, name: 'مستخدم', type: 2 })),
  },
}));

vi.mock('../../src/composables/usePermissions', () => ({
  usePermissions: vi.fn(() => ({
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
  })),
}));

vi.mock('../../src/composables/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock('../../src/composables/useFormatters', () => ({
  useFormatters: vi.fn(() => ({
    formatCurrency: (val) => (val != null ? String(val) : '—'),
    formatDate: (val) => (val ? String(val) : 'غير محدد'),
  })),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe('ReservationsView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/reservations', component: ReservationsView }],
    });
    await router.push('/reservations');
    const pinia = createPinia();
    return mount(ReservationsView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          ConfirmModal: { template: '<div />' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the reservations page container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.reservations-page').exists()).toBe(true);
  });

  it('renders page header with title', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.page-title').text()).toContain('حجوزاتي');
  });

  it('renders filter tab buttons', async () => {
    const wrapper = await createWrapper();
    const tabs = wrapper.findAll('.filter-tabs .tab-btn');
    expect(tabs.length).toBe(4);
  });

  it('has the active tab selected by default', async () => {
    const wrapper = await createWrapper();
    const activeTab = wrapper.find('.filter-tabs .tab-btn.active');
    expect(activeTab.exists()).toBe(true);
    expect(activeTab.text()).toContain('حجوزات');
  });
});

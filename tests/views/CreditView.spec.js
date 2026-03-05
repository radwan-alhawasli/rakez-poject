/**
 * CreditView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import CreditView from '../../src/views/CreditView.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ name: 'قسم الائتمان', type: 7 })),
  },
}));

vi.mock('../../src/services/creditService', () => ({
  default: {
    getDashboard: vi.fn().mockResolvedValue({}),
    getBookings: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getFinancing: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getSoldProjects: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getClaimFiles: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getTitleTransfers: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getNotifications: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
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

describe('CreditView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/credit', name: 'CreditDashboard', component: CreditView },
        { path: '/credit/bookings', name: 'CreditBookings', component: CreditView },
        { path: '/credit/financing', name: 'CreditFinancing', component: CreditView },
        { path: '/credit/notifications', name: 'CreditNotifications', component: CreditView },
        { path: '/credit/title-transfer', name: 'CreditTitleTransfer', component: CreditView },
        { path: '/credit/sold-projects', name: 'CreditSoldProjects', component: CreditView },
        { path: '/credit/claim-files', name: 'CreditClaimFiles', component: CreditView },
      ],
    });
    await router.push('/credit');
    const pinia = createPinia();
    return mount(CreditView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          teleport: true,
          CreditDashboardTab: { template: '<div class="credit-dashboard-stub">Dashboard</div>' },
          CreditNotificationsTab: { template: '<div>Notifications</div>' },
          CreditBookingsTab: { template: '<div>Bookings</div>' },
          CreditFinancingTab: { template: '<div>Financing</div>' },
          CreditTitleTransferTab: { template: '<div>Title Transfer</div>' },
          CreditSoldProjectsTab: { template: '<div>Sold Projects</div>' },
          CreditClaimFilesTab: { template: '<div>Claim Files</div>' },
        },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the credit-view container', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.credit-view').exists()).toBe(true);
  });

  it('renders tab-content area', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.find('.tab-content').exists()).toBe(true);
  });

  it('shows dashboard tab content by default', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.credit-dashboard-stub').exists()).toBe(true);
  });
});

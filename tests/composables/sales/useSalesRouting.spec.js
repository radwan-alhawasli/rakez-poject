import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { PERMISSIONS } from '@/constants/permissions';

const mockRoute = reactive({ name: 'SalesDashboard' });
const mockRouter = { push: vi.fn() };
const grantedPermissions = new Set();

const hasPermission = vi.fn(permission => grantedPermissions.has(permission));
const hasAnyPermission = vi.fn(permissions => {
  const list = Array.isArray(permissions) ? permissions : [permissions];
  return list.some(permission => grantedPermissions.has(permission));
});

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission,
    hasAnyPermission,
  }),
}));

import { useSalesRouting } from '@/composables/sales/useSalesRouting';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useSalesRouting();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useSalesRouting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grantedPermissions.clear();
    mockRoute.name = 'SalesDashboard';
  });

  it('derives active tab from route and reacts to route changes', async () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.activeTab).toBe('dashboard');

    mockRoute.name = 'SalesPaymentPlans';
    await nextTick();
    expect(wrapper.vm.activeTab).toBe('payment-plans');
  });

  it('switches tab by pushing mapped route name', () => {
    const wrapper = mountComposable();
    wrapper.vm.switchTab('sold-units');
    expect(mockRouter.push).toHaveBeenCalledWith({ name: 'SalesSoldUnits' });
  });

  it('maps every defined tab id to a route for navigation', () => {
    const wrapper = mountComposable();
    for (const tab of wrapper.vm.allTabs) {
      wrapper.vm.switchTab(tab.id);
    }
    expect(mockRouter.push).toHaveBeenCalledTimes(wrapper.vm.allTabs.length);
  });

  it('does not navigate for unknown tab id', () => {
    const wrapper = mountComposable();
    wrapper.vm.switchTab('unknown-tab-id');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('shows tabs based on required permissions and requiredAny', () => {
    grantedPermissions.add(PERMISSIONS.SALES_DASHBOARD_VIEW);
    grantedPermissions.add(PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE);
    grantedPermissions.add(PERMISSIONS.SALES_WAITING_LIST_CONVERT);

    const wrapper = mountComposable();
    const tabIds = wrapper.vm.visibleTabs.map(tab => tab.id);

    expect(tabIds).toContain('dashboard');
    expect(tabIds).toContain('payment-plans');
    expect(tabIds).toContain('waiting-list');
    expect(tabIds).not.toContain('team');
  });

  it('uses only known permission keys for tab gates', () => {
    const wrapper = mountComposable();
    const knownPermissions = new Set(Object.values(PERMISSIONS));

    for (const tab of wrapper.vm.allTabs) {
      if (tab.requiredPermission) {
        expect(knownPermissions.has(tab.requiredPermission)).toBe(true);
      }
      if (tab.requiredAny) {
        for (const permission of tab.requiredAny) {
          expect(knownPermissions.has(permission)).toBe(true);
        }
      }
    }

    const paymentTab = wrapper.vm.allTabs.find(tab => tab.id === 'payment-plans');
    expect(paymentTab.requiredPermission).toBe(PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import { mount } from '@vue/test-utils';

vi.mock('@/services/marketingService', () => ({
  default: {
    calculateBudget: vi.fn(),
  },
}));

vi.mock('@/services/notificationService', () => ({
  default: {
    addNotification: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useToast', () => {
  const toast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
  return { toast, useToast: () => ({ toast, toasts: { value: [] }, removeToast: vi.fn() }) };
});

vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatNumber: vi.fn(v => String(v)),
  }),
}));

import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useMarketingProjectBudget } from '@/composables/marketing/useMarketingProjectBudget';

function mountBudgetComposable() {
  const projects = ref([
    {
      id: 10,
      contract_number: '77',
      average_unit_price: '500000',
      commission_percentage: '5',
    },
  ]);

  const Comp = defineComponent({
    setup() {
      return useMarketingProjectBudget(projects);
    },
    render: () => h('div'),
  });

  return mount(Comp);
}

describe('useMarketingProjectBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('openCalculateBudgetModal resets state and opens modal', () => {
    const wrapper = mountBudgetComposable();

    wrapper.vm.budgetForm.project_id = '10';
    wrapper.vm.budgetResult = { marketing_value: 50 };

    wrapper.vm.openCalculateBudgetModal();

    expect(wrapper.vm.showCalculateBudgetModal).toBe(true);
    expect(wrapper.vm.budgetForm.project_id).toBe('');
    expect(wrapper.vm.budgetForm.contract_id).toBe('');
    expect(wrapper.vm.budgetForm.marketing_percent).toBe(10);
    expect(wrapper.vm.budgetResult).toBeNull();
  });

  it('onBudgetProjectChange clears fields when no project selected', () => {
    const wrapper = mountBudgetComposable();

    wrapper.vm.budgetForm.project_id = '';
    wrapper.vm.budgetForm.contract_id = '1';
    wrapper.vm.budgetForm.unit_price = '100';
    wrapper.vm.budgetForm.commission_percent = '2';

    wrapper.vm.onBudgetProjectChange();

    expect(wrapper.vm.budgetForm.contract_id).toBe('');
    expect(wrapper.vm.budgetForm.unit_price).toBe('');
    expect(wrapper.vm.budgetForm.commission_percent).toBe('');
  });

  it('onBudgetProjectChange fills fields from selected project', () => {
    const wrapper = mountBudgetComposable();

    wrapper.vm.budgetForm.project_id = '10';
    wrapper.vm.onBudgetProjectChange();

    expect(wrapper.vm.budgetForm.contract_id).toBe('77');
    expect(wrapper.vm.budgetForm.unit_price).toBe('500000');
    expect(wrapper.vm.budgetForm.commission_percent).toBe('5');
  });

  it('calculateBudget warns when required fields are missing', async () => {
    const wrapper = mountBudgetComposable();

    wrapper.vm.budgetForm.contract_id = '';
    wrapper.vm.budgetForm.unit_price = '';

    await wrapper.vm.calculateBudget();

    expect(toast.warning).toHaveBeenCalled();
    expect(marketingService.calculateBudget).not.toHaveBeenCalled();
  });

  it('calculateBudget stores service result and closes modal on success', async () => {
    marketingService.calculateBudget.mockResolvedValue({
      commission_value: 25000,
      marketing_value: 2500,
      daily_budget: 100,
      monthly_budget: 500,
    });

    const wrapper = mountBudgetComposable();
    wrapper.vm.showCalculateBudgetModal = true;
    wrapper.vm.budgetForm.contract_id = '77';
    wrapper.vm.budgetForm.unit_price = '500000';
    wrapper.vm.budgetForm.commission_percent = '5';
    wrapper.vm.budgetForm.marketing_percent = 10;

    await wrapper.vm.calculateBudget();

    expect(marketingService.calculateBudget).toHaveBeenCalledWith({
      contract_id: 77,
      unit_price: 500000,
      marketing_percent: 10,
    });
    expect(wrapper.vm.budgetResult).toEqual({
      commission_value: 25000,
      marketing_value: 2500,
      daily_budget: 100,
      monthly_budget: 500,
    });
    expect(notificationService.addNotification).toHaveBeenCalled();
    expect(wrapper.vm.showCalculateBudgetModal).toBe(false);
    expect(wrapper.vm.isSubmitting).toBe(false);
  });

  it('calculateBudget derives fallback values when response omits totals', async () => {
    marketingService.calculateBudget.mockResolvedValue({});

    const wrapper = mountBudgetComposable();
    wrapper.vm.budgetForm.contract_id = '77';
    wrapper.vm.budgetForm.unit_price = '500000';
    wrapper.vm.budgetForm.commission_percent = '5';
    wrapper.vm.budgetForm.marketing_percent = 10;
    wrapper.vm.budgetForm.contract_duration_days = '25';
    wrapper.vm.budgetForm.contract_duration_months = '5';

    await wrapper.vm.calculateBudget();

    expect(wrapper.vm.budgetResult).toEqual({
      commission_value: 25000,
      marketing_value: 2500,
      daily_budget: 100,
      monthly_budget: 500,
    });
  });

  it('calculateBudget handles service failure', async () => {
    marketingService.calculateBudget.mockRejectedValue(new Error('boom'));

    const wrapper = mountBudgetComposable();
    wrapper.vm.budgetForm.contract_id = '77';
    wrapper.vm.budgetForm.unit_price = '500000';

    await wrapper.vm.calculateBudget();

    expect(logger.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(wrapper.vm.isSubmitting).toBe(false);
  });
});

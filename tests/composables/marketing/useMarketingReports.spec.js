import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getProjects: vi.fn(),
    getProjectPerformanceReport: vi.fn(),
    getBudgetReport: vi.fn(),
    getExpectedBookingsReport: vi.fn(),
    getEmployeePerformanceReport: vi.fn(),
  },
}));

vi.mock('@/services/hrService', () => ({
  default: {
    getMarketerPerformanceReport: vi.fn(),
  },
}));

vi.mock('@/services/userService', () => ({
  default: {
    getEmployees: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import marketingService from '@/services/marketingService';
import hrService from '@/services/hrService';
import userService from '@/services/userService';
import { useMarketingReports } from '@/composables/marketing/useMarketingReports';

async function mountReports() {
  marketingService.getProjects.mockResolvedValue({ items: [{ id: 1, name: 'P1' }] });
  userService.getEmployees.mockResolvedValue([{ id: 1, type: 5, name: 'M1' }]);
  marketingService.getBudgetReport.mockResolvedValue({ spent: 100 });
  marketingService.getExpectedBookingsReport.mockResolvedValue({ total: 3 });
  marketingService.getProjectPerformanceReport.mockResolvedValue({});
  hrService.getMarketerPerformanceReport.mockResolvedValue({});

  const Comp = defineComponent({
    setup() {
      return useMarketingReports();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => expect(wrapper.vm.isLoadingReports).toBe(false));
  return wrapper;
}

describe('useMarketingReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads projects, employees, and reports on mount', async () => {
    const wrapper = await mountReports();
    expect(marketingService.getProjects).toHaveBeenCalled();
    expect(userService.getEmployees).toHaveBeenCalled();
    expect(marketingService.getBudgetReport).toHaveBeenCalled();
    expect(wrapper.vm.projects.length).toBeGreaterThanOrEqual(1);
  });

  it('reportSummary reflects loaded report data', async () => {
    const wrapper = await mountReports();
    expect(wrapper.vm.reportSummary.budgetAnalysis).toContain('spent');
  });

  it('exportReportsExcel creates a download link', async () => {
    const createEl = document.createElement.bind(document);
    const clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      const el = createEl(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:mock') });

    const wrapper = await mountReports();
    wrapper.vm.exportReportsExcel();

    expect(clickSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

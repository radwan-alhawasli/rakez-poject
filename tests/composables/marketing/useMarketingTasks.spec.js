import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/marketingService', () => ({
  default: {
    getTasks: vi.fn(),
    updateTaskStatus: vi.fn(),
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

import marketingService from '@/services/marketingService';
import notificationService from '@/services/notificationService';
import { toast } from '@/composables/useToast';
import { useMarketingTasks } from '@/composables/marketing/useMarketingTasks';

async function mountTasks() {
  const Comp = defineComponent({
    setup() {
      return useMarketingTasks();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => expect(wrapper.vm.isLoadingTasks).toBe(false));
  return wrapper;
}

describe('useMarketingTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads tasks from items array', async () => {
    marketingService.getTasks.mockResolvedValue({
      items: [{ id: 1, status: 'pending', title: 'T1' }],
    });
    const wrapper = await mountTasks();
    expect(wrapper.vm.marketingTasks).toHaveLength(1);
  });

  it('notifies when a new pending task appears', async () => {
    marketingService.getTasks.mockResolvedValueOnce({ items: [{ id: 99, status: 'new', title: 'N' }] });
    await mountTasks();
    expect(notificationService.addNotification).toHaveBeenCalled();
  });

  it('toggleTaskStatus updates task on success', async () => {
    marketingService.getTasks.mockResolvedValue({ items: [{ id: 1, status: 'in_progress', title: 'T' }] });
    marketingService.updateTaskStatus.mockResolvedValue({});
    const wrapper = await mountTasks();
    const task = { id: 1, status: 'in_progress', title: 'T' };
    await wrapper.vm.toggleTaskStatus(task);
    expect(marketingService.updateTaskStatus).toHaveBeenCalled();
    expect(notificationService.addNotification).toHaveBeenCalled();
  });

  it('toggleTaskStatus shows toast on error', async () => {
    marketingService.getTasks.mockResolvedValue({ items: [{ id: 1, status: 'pending', title: 'T' }] });
    marketingService.updateTaskStatus.mockRejectedValue(new Error('fail'));
    const wrapper = await mountTasks();
    await wrapper.vm.toggleTaskStatus(wrapper.vm.marketingTasks[0]);
    expect(toast.error).toHaveBeenCalled();
  });

  it('normalizeTaskStatus and getTaskStatusText map statuses', async () => {
    marketingService.getTasks.mockResolvedValue({ items: [] });
    const wrapper = await mountTasks();
    expect(wrapper.vm.normalizeTaskStatus('DONE')).toBe('completed');
    expect(wrapper.vm.getTaskStatusText('completed')).toBe('مكتملة');
    expect(wrapper.vm.getTaskStatusClass('pending')).toBe('task-pending');
  });

  it('clears tasks on load error', async () => {
    marketingService.getTasks.mockRejectedValue(new Error('x'));
    const wrapper = await mountTasks();
    expect(wrapper.vm.marketingTasks).toEqual([]);
  });
});

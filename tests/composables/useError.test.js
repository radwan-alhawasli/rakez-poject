/**
 * useError Composable Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useError } from '../../src/composables/useError';

vi.mock('../../src/utils/errorHandler', () => ({
  handleError: vi.fn(err => ({
    message: err?.message || 'Error',
    isExpected: false,
  })),
  retryWithBackoff: vi.fn(fn => fn()),
}));

vi.mock('../../src/services/notificationService', () => ({
  default: {
    addNotification: vi.fn(),
  },
}));

import { handleError } from '../../src/utils/errorHandler';
import notificationService from '../../src/services/notificationService';

describe('useError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error, isLoading, handle, clearError, execute, wrap', () => {
    const TestComp = defineComponent({
      setup() {
        const err = useError();
        return err;
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(wrapper.vm.error).toBeDefined();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(typeof wrapper.vm.handle).toBe('function');
    expect(typeof wrapper.vm.clearError).toBe('function');
    expect(typeof wrapper.vm.execute).toBe('function');
    expect(typeof wrapper.vm.wrap).toBe('function');
  });

  it('should set error when handle is called', () => {
    const TestComp = defineComponent({
      setup() {
        return useError();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    const err = new Error('Test error');
    wrapper.vm.handle(err);
    expect(handleError).toHaveBeenCalledWith(err, expect.any(Object));
    expect(notificationService.addNotification).toHaveBeenCalled();
    expect(wrapper.vm.error).toBe(err);
  });

  it('should clear error when clearError called', () => {
    const TestComp = defineComponent({
      setup() {
        return useError();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    wrapper.vm.handle(new Error('x'));
    expect(wrapper.vm.error).not.toBeNull();
    wrapper.vm.clearError();
    expect(wrapper.vm.error).toBeNull();
  });

  it('should execute fn and return result', async () => {
    const TestComp = defineComponent({
      setup() {
        return useError();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    const result = await wrapper.vm.execute(() => Promise.resolve(42), { showLoading: false });
    expect(result).toBe(42);
  });

  it('should set isLoading during execute', async () => {
    const TestComp = defineComponent({
      setup() {
        return useError();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    let resolvePromise;
    const p = new Promise(r => {
      resolvePromise = r;
    });
    const exec = wrapper.vm.execute(() => p, { showLoading: true });
    expect(wrapper.vm.isLoading).toBe(true);
    resolvePromise(1);
    await exec;
    expect(wrapper.vm.isLoading).toBe(false);
  });
});

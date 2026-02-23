/**
 * useApi Composable Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useApi } from '../../src/composables/useApi';

vi.mock('../../src/composables/useError', () => ({
  useError: vi.fn(() => ({
    handle: vi.fn(),
    execute: vi.fn(fn => fn()),
    isLoading: { value: false },
    error: { value: null },
  })),
}));

describe('useApi', () => {
  it('should return call, createCall, isLoading, error, handle', () => {
    const TestComp = defineComponent({
      setup() {
        return useApi();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(typeof wrapper.vm.call).toBe('function');
    expect(typeof wrapper.vm.createCall).toBe('function');
    expect(wrapper.vm.isLoading).toBeDefined();
    expect(wrapper.vm.error).toBeDefined();
    expect(typeof wrapper.vm.handle).toBe('function');
  });

  it('should call and return api response data', async () => {
    const TestComp = defineComponent({
      setup() {
        return useApi();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    const apiCall = vi.fn().mockResolvedValue({ data: { id: 1 } });
    const result = await wrapper.vm.call(apiCall);
    expect(apiCall).toHaveBeenCalled();
    expect(result).toEqual({ id: 1 });
  });

  it('createCall should return a function', () => {
    const TestComp = defineComponent({
      setup() {
        return useApi();
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    const wrapped = wrapper.vm.createCall(() => Promise.resolve(1));
    expect(typeof wrapped).toBe('function');
  });
});

/**
 * useToast Composable Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { useToast } from '../../src/composables/useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const { toasts, removeToast } = useToast();
    while (toasts.value && toasts.value.length) removeToast(toasts.value[0].id);
  });

  it('should return toasts, toast, removeToast', () => {
    const TestComp = defineComponent({
      setup() {
        const { toasts, toast: t, removeToast } = useToast();
        return { toasts, toast: t, removeToast };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(Array.isArray(wrapper.vm.toasts)).toBe(true);
    expect(wrapper.vm.toast).toBeDefined();
    expect(typeof wrapper.vm.toast.success).toBe('function');
    expect(typeof wrapper.vm.toast.error).toBe('function');
    expect(typeof wrapper.vm.removeToast).toBe('function');
  });

  it('should add toast on toast.success', () => {
    const TestComp = defineComponent({
      setup() {
        const { toasts, toast: t } = useToast();
        return { toasts, toast: t };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    expect(wrapper.vm.toasts.length).toBe(0);
    wrapper.vm.toast.success('Done!');
    expect(wrapper.vm.toasts.length).toBe(1);
    expect(wrapper.vm.toasts[0].type).toBe('success');
    expect(wrapper.vm.toasts[0].message).toBe('Done!');
  });

  it('should add toast on toast.error', () => {
    const TestComp = defineComponent({
      setup() {
        const { toasts, toast: t } = useToast();
        return { toasts, toast: t };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    wrapper.vm.toast.error('Error message');
    expect(wrapper.vm.toasts.length).toBe(1);
    expect(wrapper.vm.toasts[0].type).toBe('error');
    expect(wrapper.vm.toasts[0].message).toBe('Error message');
  });

  it('should remove toast when removeToast called', () => {
    const TestComp = defineComponent({
      setup() {
        const { toasts, toast: t, removeToast } = useToast();
        return { toasts, toast: t, removeToast };
      },
      render: () => h('div'),
    });
    const wrapper = mount(TestComp);
    const id = wrapper.vm.toast.info('Info');
    expect(wrapper.vm.toasts.length).toBe(1);
    wrapper.vm.removeToast(id);
    expect(wrapper.vm.toasts.length).toBe(0);
  });
});

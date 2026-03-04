import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AppModal from '../../src/components/AppModal.vue';

// Stub the Dialog and AppModalContent components
const stubs = {
  Dialog: {
    template: '<div><slot /></div>',
    props: ['open'],
    emits: ['update:open'],
  },
  AppModalContent: {
    template: '<div><slot /></div>',
    props: ['size', 'hideClose'],
  },
};

describe('AppModal', () => {
  it('renders without throwing', () => {
    const wrapper = mount(AppModal, {
      props: { open: true },
      global: { stubs },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders title when provided', () => {
    const wrapper = mount(AppModal, {
      props: { open: true, title: 'عنوان النافذة' },
      global: { stubs },
    });
    expect(wrapper.text()).toContain('عنوان النافذة');
  });

  it('renders subtitle when provided', () => {
    const wrapper = mount(AppModal, {
      props: { open: true, title: 'عنوان', subtitle: 'تفاصيل إضافية' },
      global: { stubs },
    });
    expect(wrapper.text()).toContain('تفاصيل إضافية');
  });

  it('does not render title section when title is empty', () => {
    const wrapper = mount(AppModal, {
      props: { open: true },
      global: { stubs },
    });
    expect(wrapper.find('h2').exists()).toBe(false);
  });

  it('renders default slot content', () => {
    const wrapper = mount(AppModal, {
      props: { open: true },
      slots: { default: '<p>محتوى النافذة</p>' },
      global: { stubs },
    });
    expect(wrapper.text()).toContain('محتوى النافذة');
  });

  it('renders footer slot content when provided', () => {
    const wrapper = mount(AppModal, {
      props: { open: true },
      slots: { footer: '<button>حفظ</button>' },
      global: { stubs },
    });
    expect(wrapper.text()).toContain('حفظ');
  });

  it('emits update:open when onOpenChange is called', async () => {
    const wrapper = mount(AppModal, {
      props: { open: true },
      global: { stubs },
    });
    wrapper.vm.onOpenChange(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:open')).toBeTruthy();
    expect(wrapper.emitted('update:open')[0][0]).toBe(false);
  });

  it('accepts size prop', () => {
    const wrapper = mount(AppModal, {
      props: { open: true, size: 'wide' },
      global: { stubs },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('accepts hideClose prop', () => {
    const wrapper = mount(AppModal, {
      props: { open: true, hideClose: true },
      global: { stubs },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

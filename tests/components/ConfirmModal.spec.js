import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmModal from '../../src/components/ConfirmModal.vue';

// Stub the AlertDialog components from the UI library
const alertDialogStubs = {
  AlertDialog: {
    template: '<div data-open="$attrs.open"><slot /></div>',
    props: ['open'],
  },
  AlertDialogContent: { template: '<div><slot /></div>' },
  AlertDialogHeader: { template: '<div><slot /></div>' },
  AlertDialogTitle: { template: '<div><slot /></div>' },
  AlertDialogDescription: { template: '<div><slot /></div>' },
  AlertDialogFooter: { template: '<div><slot /></div>' },
  AlertDialogCancel: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  AlertDialogAction: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
};

describe('ConfirmModal', () => {
  const defaultProps = {
    message: 'هل أنت متأكد؟',
    open: true,
  };

  it('renders without throwing', () => {
    const wrapper = mount(ConfirmModal, {
      props: defaultProps,
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the provided message', () => {
    const wrapper = mount(ConfirmModal, {
      props: { ...defaultProps, message: 'تأكيد الحذف النهائي' },
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.text()).toContain('تأكيد الحذف النهائي');
  });

  it('displays the default title when none is provided', () => {
    const wrapper = mount(ConfirmModal, {
      props: defaultProps,
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.text()).toContain('تأكيد الإجراء');
  });

  it('displays a custom title when provided', () => {
    const wrapper = mount(ConfirmModal, {
      props: { ...defaultProps, title: 'حذف العنصر' },
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.text()).toContain('حذف العنصر');
  });

  it('uses default button texts', () => {
    const wrapper = mount(ConfirmModal, {
      props: defaultProps,
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.text()).toContain('تأكيد');
    expect(wrapper.text()).toContain('إلغاء');
  });

  it('uses custom confirm and cancel texts', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        ...defaultProps,
        confirmText: 'نعم، احذف',
        cancelText: 'لا، تراجع',
      },
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.text()).toContain('نعم، احذف');
    expect(wrapper.text()).toContain('لا، تراجع');
  });

  it('emits confirm event when handleConfirm is called', async () => {
    const wrapper = mount(ConfirmModal, {
      props: defaultProps,
      global: { stubs: alertDialogStubs },
    });
    await wrapper.vm.handleConfirm();
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('emits cancel event when dialog closes without confirm', async () => {
    const wrapper = mount(ConfirmModal, {
      props: defaultProps,
      global: { stubs: alertDialogStubs },
    });
    // handleCancel sets closeSource = 'cancel'; onOpenChange(false) then emits 'cancel'
    await wrapper.vm.handleCancel();
    await wrapper.vm.onOpenChange(false);
    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('disables buttons when isLoading is true', () => {
    const wrapper = mount(ConfirmModal, {
      props: { ...defaultProps, isLoading: true },
      global: { stubs: alertDialogStubs },
    });
    const buttons = wrapper.findAll('button');
    buttons.forEach(btn => {
      expect(btn.attributes('disabled')).toBeDefined();
    });
  });

  it('applies danger type correctly', () => {
    const wrapper = mount(ConfirmModal, {
      props: { ...defaultProps, type: 'danger' },
      global: { stubs: alertDialogStubs },
    });
    // confirmButtonClass computed should be 'btn-danger'
    expect(wrapper.vm.confirmButtonClass).toBe('btn-danger');
  });

  it('applies warning type correctly', () => {
    const wrapper = mount(ConfirmModal, {
      props: { ...defaultProps, type: 'warning' },
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.vm.confirmButtonClass).toBe('btn-warning');
  });

  it('applies info/primary type correctly', () => {
    const wrapper = mount(ConfirmModal, {
      props: { ...defaultProps, type: 'info' },
      global: { stubs: alertDialogStubs },
    });
    expect(wrapper.vm.confirmButtonClass).toBe('btn-primary');
  });
});

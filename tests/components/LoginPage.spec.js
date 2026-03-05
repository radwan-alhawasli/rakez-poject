import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginPage from '../../src/components/LoginPage.vue';

vi.mock('../../src/services/authService', () => ({
  default: {
    login: vi.fn(),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

// Stub shadcn-style UI components to avoid rendering issues in jsdom
const stubComponents = {
  Button: { template: '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
  Input: { template: '<input v-bind="$attrs" @input="$emit(\'update:modelValue\', $event.target.value)" />', emits: ['update:modelValue'] },
};

import authService from '../../src/services/authService';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('renders email and password inputs', () => {
    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('does not call authService.login when fields are empty', async () => {
    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });
    await wrapper.find('form').trigger('submit');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls authService.login with correct credentials on submit', async () => {
    authService.login.mockResolvedValue({ id: 1, role: 'admin' });

    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });

    // Set reactive data via component internals
    wrapper.vm.email = 'admin@rakez.com';
    wrapper.vm.password = 'secret123';
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(authService.login).toHaveBeenCalledWith('admin@rakez.com', 'secret123');
  });

  it('emits login-success with user data on successful login', async () => {
    const mockUser = { id: 1, role: 'admin' };
    authService.login.mockResolvedValue(mockUser);

    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });

    wrapper.vm.email = 'admin@rakez.com';
    wrapper.vm.password = 'secret123';
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('login-success')).toBeTruthy();
    expect(wrapper.emitted('login-success')[0][0]).toEqual(mockUser);
  });

  it('shows error message when login fails', async () => {
    authService.login.mockRejectedValue(new Error('Unauthorized'));

    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });

    wrapper.vm.email = 'wrong@rakez.com';
    wrapper.vm.password = 'wrongpass';
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.error).toBeTruthy();
  });

  it('sets isLoading to false after login completes', async () => {
    authService.login.mockResolvedValue({ id: 1 });

    const wrapper = mount(LoginPage, {
      global: { stubs: stubComponents },
    });

    wrapper.vm.email = 'admin@rakez.com';
    wrapper.vm.password = 'pass';
    await wrapper.vm.$nextTick();

    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isLoading).toBe(false);
  });
});

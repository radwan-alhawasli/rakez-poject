import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '../../src/components/LoadingSpinner.vue';

describe('LoadingSpinner', () => {
  it('renders without throwing', () => {
    expect(() => mount(LoadingSpinner)).not.toThrow();
  });

  it('renders with default props', () => {
    const wrapper = mount(LoadingSpinner);
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.find('.spinner').exists()).toBe(true);
  });

  it('renders with custom message prop', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { text: 'جاري التحميل...' },
    });
    expect(wrapper.text()).toContain('جاري التحميل...');
  });

  it('applies size class correctly', () => {
    const wrapperSm = mount(LoadingSpinner, { props: { size: 'sm' } });
    expect(wrapperSm.find('.spinner--sm').exists()).toBe(true);

    const wrapperLg = mount(LoadingSpinner, { props: { size: 'lg' } });
    expect(wrapperLg.find('.spinner--lg').exists()).toBe(true);

    const wrapperMd = mount(LoadingSpinner, { props: { size: 'md' } });
    expect(wrapperMd.find('.spinner').exists()).toBe(true);
  });
});

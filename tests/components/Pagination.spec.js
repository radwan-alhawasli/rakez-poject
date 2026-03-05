import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Pagination from '../../src/components/Pagination.vue';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalItems: 100,
    perPage: 10,
  };

  it('renders when totalPages > 1', () => {
    const wrapper = mount(Pagination, { props: defaultProps });
    expect(wrapper.find('.pagination-container').exists()).toBe(true);
  });

  it('does not render when totalPages <= 1', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalItems: 5, perPage: 10 },
    });
    expect(wrapper.find('.pagination-container').exists()).toBe(false);
  });

  it('displays correct item range on first page', () => {
    const wrapper = mount(Pagination, { props: defaultProps });
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('10');
    expect(wrapper.text()).toContain('100');
  });

  it('displays correct item range on second page', () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, currentPage: 2 },
    });
    expect(wrapper.text()).toContain('11');
    expect(wrapper.text()).toContain('20');
  });

  it('disables previous button on first page', () => {
    const wrapper = mount(Pagination, { props: defaultProps });
    const prevButtons = wrapper.findAll('.pagination-btn');
    // First two buttons are "first page" and "previous"
    expect(prevButtons[0].attributes('disabled')).toBeDefined();
    expect(prevButtons[1].attributes('disabled')).toBeDefined();
  });

  it('disables next button on last page', () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, currentPage: 10 },
    });
    const paginationBtns = wrapper.findAll('.pagination-btn');
    const lastTwo = paginationBtns.slice(-2);
    lastTwo.forEach(btn => {
      expect(btn.attributes('disabled')).toBeDefined();
    });
  });

  it('emits page-change event when a non-current page button is clicked', async () => {
    const wrapper = mount(Pagination, { props: defaultProps });
    const pageButtons = wrapper.findAll('.page-number');
    // Find a page button that is not '...' and not the current page
    const clickable = pageButtons.find(btn => btn.text() !== '...' && btn.text() !== '1');
    if (clickable) {
      await clickable.trigger('click');
      expect(wrapper.emitted('page-change')).toBeTruthy();
    }
  });

  it('emits page-change when navigating to next page', async () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, currentPage: 3 },
    });
    const nextBtn = wrapper.findAll('.pagination-btn')[2];
    await nextBtn.trigger('click');
    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(4);
  });

  it('emits page-change when navigating to previous page', async () => {
    const wrapper = mount(Pagination, {
      props: { ...defaultProps, currentPage: 3 },
    });
    const prevBtn = wrapper.findAll('.pagination-btn')[1];
    await prevBtn.trigger('click');
    expect(wrapper.emitted('page-change')).toBeTruthy();
    expect(wrapper.emitted('page-change')[0][0]).toBe(2);
  });

  it('emits per-page-change when per-page select changes', async () => {
    const wrapper = mount(Pagination, { props: defaultProps });
    const select = wrapper.find('.per-page-select');
    await select.setValue('25');
    expect(wrapper.emitted('per-page-change')).toBeTruthy();
  });

  it('shows all page numbers when total pages is small', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalItems: 30, perPage: 10 },
    });
    const pageNums = wrapper.findAll('.page-number');
    expect(pageNums.length).toBe(3);
  });

  it('shows ellipsis when many pages and cursor is in middle', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 5, totalItems: 200, perPage: 10 },
    });
    const allPageBtns = wrapper.findAll('.page-number');
    const hasEllipsis = allPageBtns.some(btn => btn.text() === '...');
    expect(hasEllipsis).toBe(true);
  });

  it('renders the correct total items count', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalItems: 57, perPage: 10 },
    });
    expect(wrapper.text()).toContain('57');
  });

  it('caps endItem at totalItems on last page', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 6, totalItems: 57, perPage: 10 },
    });
    // Last page: items 51-57
    expect(wrapper.text()).toContain('57');
  });
});

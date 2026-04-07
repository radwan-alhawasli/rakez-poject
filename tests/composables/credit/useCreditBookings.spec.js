import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

const mockRoute = { name: 'CreditBookings', query: { tab: 'confirmed' }, params: {} };
const mockRouter = { push: vi.fn() };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}));

vi.mock('@/services/creditService', () => ({
  default: {
    getConfirmedBookings: vi.fn(),
    getNegotiationBookings: vi.fn(),
    getWaitingBookings: vi.fn(),
    getSoldBookings: vi.fn(),
    getCancelledBookings: vi.fn(),
    getBookingById: vi.fn(),
    initializeTitleTransfer: vi.fn(),
    scheduleTitleTransfer: vi.fn(),
    getFinancingTracker: vi.fn(),
    advanceFinancing: vi.fn(),
    cancelBooking: vi.fn(),
    updateNegotiation: vi.fn(),
    processWaitingBooking: vi.fn(),
    completeTitleTransfer: vi.fn(),
    getPendingTitleTransfers: vi.fn(),
    rejectFinancing: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useToast', () => {
  const t = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  };
  return { toast: t, useToast: () => ({ toast: t, toasts: { value: [] }, removeToast: vi.fn() }) };
});

vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatCurrency: vi.fn(v => `${v} SAR`),
    formatCurrencyAr: vi.fn(v => `${v} ر.س`),
    formatDate: vi.fn(v => v || '—'),
    formatNumber: vi.fn(v => String(v)),
  }),
}));

import creditService from '@/services/creditService';
import { toast } from '@/composables/useToast';
import { useCreditBookings } from '@/composables/credit/useCreditBookings';

function mountComposable() {
  const Comp = defineComponent({
    setup() {
      return useCreditBookings();
    },
    render: () => h('div'),
  });
  return mount(Comp);
}

describe('useCreditBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.name = 'CreditBookings';
    mockRoute.query = { tab: 'confirmed' };
  });

  it('should have correct initial state', () => {
    const wrapper = mountComposable();
    expect(wrapper.vm.isLoading).toBe(false);
    expect(wrapper.vm.selectedBooking).toBeNull();
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.perPage).toBe(25);
    expect(wrapper.vm.totalItems).toBe(0);
  });

  it('should load confirmed bookings by default (GET /credit/bookings/confirmed)', async () => {
    const mockItems = [{ id: 1, customer_name: 'أحمد', credit_status: 'confirmed' }];
    creditService.getConfirmedBookings.mockResolvedValue({ items: mockItems, total: 1 });
    const wrapper = mountComposable();
    await wrapper.vm.loadBookingsForCurrentTab();
    expect(creditService.getConfirmedBookings).toHaveBeenCalled();
  });

  it('should map legacy tab=all to confirmed and load confirmed', async () => {
    mockRoute.query = { tab: 'all' };
    creditService.getConfirmedBookings.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    expect(wrapper.vm.bookingsSubTab).toBe('confirmed');
    await wrapper.vm.loadBookingsForCurrentTab();
    expect(creditService.getConfirmedBookings).toHaveBeenCalled();
  });

  it('should setBookingsSubTab via router push', () => {
    const wrapper = mountComposable();
    wrapper.vm.setBookingsSubTab('negotiation');
    expect(mockRouter.push).toHaveBeenCalledWith({
      name: 'CreditBookings',
      query: expect.objectContaining({ tab: 'negotiation' }),
    });
  });

  it('should set selectedBooking on viewBookingDetail', async () => {
    const booking = { id: 10, customer_name: 'عمر' };
    creditService.getBookingById.mockResolvedValue({
      id: 10,
      customer_name: 'عمر',
      project: {},
      unit: {},
      client: {},
      financial: {},
      marketing: {},
    });
    const wrapper = mountComposable();
    await wrapper.vm.viewBookingDetail(booking);
    expect(wrapper.vm.selectedBooking).not.toBeNull();
    expect(wrapper.vm.selectedBooking.id).toBe(10);
  });

  it('should open schedule modal on onBookingSchedule (not prompt)', async () => {
    creditService.initializeTitleTransfer.mockResolvedValue({ id: 77 });
    const wrapper = mountComposable();
    creditService.getBookingById.mockResolvedValue({ id: 5, project: {}, unit: {}, client: {}, financial: {}, marketing: {} });
    await wrapper.vm.viewBookingDetail({ id: 5 });
    await wrapper.vm.onBookingSchedule();
    expect(wrapper.vm.showScheduleDateModal).toBe(true);
  });

  it('should handle error in loadBookingsForCurrentTab', async () => {
    creditService.getConfirmedBookings.mockRejectedValue(new Error('Network'));
    const wrapper = mountComposable();
    wrapper.vm.loadBookingsForCurrentTab();
    await vi.waitFor(() => {
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  it('should show warning toast when viewBookingDetail has no id', async () => {
    const wrapper = mountComposable();
    await wrapper.vm.viewBookingDetail({});
    expect(toast.warning).toHaveBeenCalled();
  });

  it('should handle pagination with handlePageChange', async () => {
    creditService.getConfirmedBookings.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePageChange(3);
    expect(wrapper.vm.currentPage).toBe(3);
  });

  it('should handle pagination with handlePerPageChange', async () => {
    creditService.getConfirmedBookings.mockResolvedValue({ items: [], total: 0 });
    const wrapper = mountComposable();
    wrapper.vm.handlePerPageChange(50);
    expect(wrapper.vm.perPage).toBe(50);
    expect(wrapper.vm.currentPage).toBe(1);
  });
});

import apiClient from '@/api/apiClient';
import { handleServiceError } from '@/utils/serviceErrorHandler';
import { extractPaginatedData } from '@/utils/paginationUtils';

export default {
  getReservationContext(unitId, params = {}) {
    const config = params && typeof params === 'object' && Object.keys(params).length > 0 ? { params } : {};
    return apiClient.get(`/sales/units/${unitId}/reservation-context`, config);
  },

  _normalizeReservationPayload(data) {
    const typeRaw = data?.reservation_type ?? data?.reservationType ?? 'negotiation';
    const typeMap = {
      عقد: 'confirmed_reservation',
      contract: 'confirmed_reservation',
      confirmed: 'confirmed_reservation',
      تفاوض: 'negotiation',
      negotiation: 'negotiation',
    };
    const reservation_type =
      typeMap[typeRaw] ?? (typeRaw === 'confirmed_reservation' || typeRaw === 'negotiation' ? typeRaw : 'negotiation');

    const payload = {
      contract_id: data?.contract_id,
      contract_unit_id: data?.contract_unit_id,
      contract_date: data?.contract_date || new Date().toISOString().split('T')[0],
      reservation_type,
      client_name: data?.client_name ?? '',
      client_mobile: data?.client_mobile ?? data?.phone ?? data?.mobile ?? '',
      client_nationality: data?.client_nationality ?? 'غير محدد',
      client_iban: data?.client_iban ?? data?.clientIban ?? '',
      payment_method: data?.payment_method ?? data?.paymentMethod ?? 'cash',
      down_payment_amount: Number(data?.down_payment_amount ?? data?.downPaymentAmount ?? 0),
      down_payment_status: data?.down_payment_status ?? data?.downPaymentStatus ?? 'refundable',
      purchase_mechanism: data?.purchase_mechanism ?? data?.purchaseMechanism ?? 'cash',
    };
    if (data?.evacuation_date) payload.evacuation_date = data.evacuation_date;
    if (reservation_type === 'negotiation') {
      payload.negotiation_notes = data?.negotiation_notes ?? '';
      payload.negotiation_reason = data?.negotiation_reason ?? 'other';
      payload.proposed_price =
        data?.proposed_price != null && data?.proposed_price !== ''
          ? Number(data.proposed_price)
          : 0;
    }
    return payload;
  },

  createReservation(data) {
    const payload = this._normalizeReservationPayload(data);
    return apiClient.post('/sales/reservations', payload);
  },

  async getReservations(params = {}) {
    try {
      const response = await apiClient.get('/sales/reservations', { params });
      const { items, total } = extractPaginatedData(response, []);
      return { items, total };
    } catch (error) {
      return handleServiceError(error, 'Fetch reservations', 'get') || { items: [], total: 0 };
    }
  },

  async getReservation(id) {
    const response = await apiClient.get(`/sales/reservations/${id}`);
    return response.data?.data ?? response.data ?? {};
  },

  confirmReservation(reservationId) {
    return apiClient.post(`/sales/reservations/${reservationId}/confirm`);
  },

  cancelReservation(reservationId, data = {}) {
    const cancellation_reason = data?.cancellation_reason ?? data?.reason ?? '';
    return apiClient.post(`/sales/reservations/${reservationId}/cancel`, {
      cancellation_reason: String(cancellation_reason),
    });
  },

  logAction(reservationId, data) {
    return apiClient.post(`/sales/reservations/${reservationId}/actions`, data);
  },

  async downloadVoucher(reservationId) {
    const response = await apiClient.get(`/sales/reservations/${reservationId}/voucher`, {
      responseType: 'blob',
    });
    return response?.data instanceof Blob ? response.data : response;
  },

  async downloadUnitPdf(unitId) {
    const response = await apiClient.get(`/sales/units/${unitId}/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });
    const blob = response?.data instanceof Blob ? response.data : response;
    let filename;
    const contentDisposition = response?.headers?.['content-disposition'];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match) filename = match[1].trim();
    }
    return { blob, filename };
  },

  async getPendingNegotiations(params = {}) {
    const response = await apiClient.get('/sales/negotiations/pending', { params });
    const { items } = extractPaginatedData(response, []);
    return Array.isArray(items) ? items : [];
  },

  async approveNegotiation(negotiationId, data = {}) {
    const response = await apiClient.post(`/sales/negotiations/${negotiationId}/approve`, data);
    return response.data?.data || response.data || {};
  },

  async rejectNegotiation(negotiationId, data = {}) {
    const response = await apiClient.post(`/sales/negotiations/${negotiationId}/reject`, data);
    return response.data?.data || response.data || {};
  },

  async getPaymentPlan(reservationId) {
    const response = await apiClient.get(`/sales/reservations/${reservationId}/payment-plan`);
    return response.data?.data || response.data || {};
  },

  async createPaymentPlan(reservationId, data) {
    const response = await apiClient.post(`/sales/reservations/${reservationId}/payment-plan`, data);
    return response.data?.data || response.data || {};
  },

  async updatePaymentInstallment(installmentId, data) {
    const response = await apiClient.put(`/sales/payment-installments/${installmentId}`, data);
    return response.data?.data || response.data || {};
  },

  async deletePaymentInstallment(installmentId) {
    const response = await apiClient.delete(`/sales/payment-installments/${installmentId}`);
    return response.data?.data || response.data || {};
  }
};

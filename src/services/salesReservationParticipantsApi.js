import apiClient from '@/api/apiClient';

/**
 * Reservation participants APIs (Simple Commission MVP support)
 *
 * GET  /sales/reservations/eligible-participants
 * GET  /sales/reservations/{reservation}/participants
 * PUT  /sales/reservations/{reservation}/participants
 */

export async function getEligibleReservationParticipants(params = {}) {
  const res = await apiClient.get('/sales/reservations/eligible-participants', { params });
  return res?.data?.data ?? res?.data ?? [];
}

/**
 * @param {string | number | null | undefined} reservationId
 */
export async function getReservationParticipants(reservationId) {
  const id = String(reservationId ?? '').trim();
  const res = await apiClient.get(`/sales/reservations/${id}/participants`);
  return res?.data?.data ?? res?.data ?? [];
}

/**
 * @param {string | number | null | undefined} reservationId
 * @param {Record<string, any>} payload
 */
export async function syncReservationParticipants(reservationId, payload) {
  const id = String(reservationId ?? '').trim();
  const res = await apiClient.put(`/sales/reservations/${id}/participants`, payload);
  return res?.data?.data ?? res?.data ?? res;
}


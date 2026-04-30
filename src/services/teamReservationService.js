import apiClient from '@/api/apiClient';
import { ensurePdfBlob } from '@/services/hr/hrPdfBlob';
import logger from '@/utils/logger';
import { normalizeVoucherDataPayload } from '@/utils/reservationVoucherNormalize';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { handleServiceError } from '@/utils/serviceErrorHandler';

export const getProjectManagementReservations = async (params = {}) => {
  try {
    const response = await apiClient.get('/project_management/reservations', { params });
    const data = response.data?.data ?? response.data;
    if (Array.isArray(data)) return data;
    const { items } = extractPaginatedData(response, []);
    if (Array.isArray(items) && items.length) return items;
    if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
    return [];
  } catch (error) {
    return handleServiceError(error, 'PM reservations list', 'get', []);
  }
};

/**
 * @param {number|string} unitId
 */
export const getProjectManagementUnitReservationContext = async unitId => {
  try {
    const response = await apiClient.get(`/project_management/units/${unitId}/reservation-context`);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`PM reservation context ${unitId}:`, error);
    throw error;
  }
};

/**
 * @param {Record<string, unknown>} body
 */
export const createProjectManagementReservation = async body => {
  try {
    const response = await apiClient.post('/project_management/reservations', body);
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error('PM create reservation:', error);
    throw error;
  }
};

/**
 * @param {number|string} reservationId
 * @param {Record<string, unknown>} [data]
 */
export const confirmProjectManagementReservation = async (reservationId, data = {}) => {
  try {
    const response = await apiClient.post(
      `/project_management/reservations/${reservationId}/confirm`,
      data
    );
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`PM confirm reservation ${reservationId}:`, error);
    throw error;
  }
};

/**
 * @param {number|string} reservationId
 * @param {Record<string, unknown>} [data]
 */
export const cancelProjectManagementReservation = async (reservationId, data = {}) => {
  try {
    const response = await apiClient.post(
      `/project_management/reservations/${reservationId}/cancel`,
      data
    );
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`PM cancel reservation ${reservationId}:`, error);
    throw error;
  }
};

/**
 * @param {number|string} reservationId
 * @param {Record<string, unknown>} data
 */
export const logProjectManagementReservationAction = async (reservationId, data) => {
  try {
    const response = await apiClient.post(
      `/project_management/reservations/${reservationId}/actions`,
      data
    );
    return response.data?.data ?? response.data ?? {};
  } catch (error) {
    logger.error(`PM reservation action ${reservationId}:`, error);
    throw error;
  }
};

/**
 * @param {number|string} reservationId
 */
export const downloadProjectManagementReservationVoucher = async reservationId => {
  const response = await apiClient.get(`/project_management/reservations/${reservationId}/voucher`, {
    responseType: 'blob',
  });
  return ensurePdfBlob(response);
};

/**
 * @param {number|string} reservationId
 */
export const getProjectManagementReservationVoucherData = async reservationId => {
  try {
    const response = await apiClient.get(
      `/project_management/reservations/${reservationId}/voucher-data`
    );
    const payload = response.data?.data ?? response.data ?? {};
    const base = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
    const normalized = normalizeVoucherDataPayload(base);
    if (normalized?.reservation != null) {
      return { ...base, ...normalized };
    }
    return base;
  } catch (error) {
    logger.error(`PM voucher-data ${reservationId}:`, error);
    throw error;
  }
};

/**
 * @param {number|string} reservationId
 */
export const fetchProjectManagementReservationVoucherDataBlob = async reservationId => {
  const response = await apiClient.get(
    `/project_management/reservations/${reservationId}/voucher-data`,
    { responseType: 'blob' }
  );
  const blob = response?.data;
  if (!(blob instanceof Blob)) {
    throw new Error('استجابة السند غير صالحة');
  }
  const contentType = String(response.headers?.['content-type'] || blob.type || '');
  const contentDisposition = String(response.headers?.['content-disposition'] || '');
  return { blob, contentType, contentDisposition };
};


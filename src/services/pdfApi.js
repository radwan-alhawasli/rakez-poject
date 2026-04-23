/**
 * PDF Data API — Most endpoints return JSON for client-side PDF generation.
 * See docs/PDF_DATA_SHAPES.md for JSON shapes. Some endpoints return PDF blobs (e.g. contracts/show/:id/pdf).
 */
import apiClient from '@/api/apiClient';
import { ensurePdfBlob } from '@/services/hr/hrPdfBlob';

/**
 * @param {any} response
 */
function extractData(response) {
  const data = response?.data;
  if (data != null && typeof data === 'object' && 'data' in data) return data.data;
  return data;
}

/**
 * Contract fill data for exclusive contract template.
 * GET /api/contracts/:id/fill-data
  * @param {any} contractId
 */
export async function getContractFillData(contractId) {
  const response = await apiClient.get(`/contracts/${contractId}/fill-data`);
  return extractData(response);
}

/**
 * Completed exclusive contract PDF from server (filled template).
 * GET /api/contracts/show/:id/pdf
 * @param {string|number} contractId
 * @returns {Promise<{ blob: Blob, filename?: string }>}
 */
export async function downloadContractFillDataPdf(contractId) {
  const id = contractId != null ? String(contractId).trim() : '';
  if (!id) {
    const err = new Error('معرف العقد مطلوب');
    throw err;
  }
  const response = await apiClient.get(`/contracts/show/${id}/pdf`, {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  });
  const blob = await ensurePdfBlob(response);
  let filename;
  const contentDisposition = response?.headers?.['content-disposition'];
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/);
    if (match) filename = match[1].trim();
  }
  return { blob, filename };
}

/**
 * Reservation voucher data (reservation, project, unit, employee).
 * GET /api/sales/reservations/:id/voucher-data
 * Note: downloadVoucher (file) is unchanged when a stored PDF exists.
  * @param {any} reservationId
 */
export async function getReservationVoucherData(reservationId) {
  const response = await apiClient.get(`/sales/reservations/${reservationId}/voucher-data`);
  return extractData(response);
}

/**
 * Unit details for unit PDF.
 * GET /api/sales/units/:unitId/pdf-data
 * Note: unitPdf (file download) is unchanged.
  * @param {any} unitId
 */
export async function getUnitPdfData(unitId) {
  const response = await apiClient.get(`/sales/units/${unitId}/pdf-data`);
  return extractData(response);
}

/**
 * Commission claim + distributions for PDF.
 * GET /api/accounting/commissions/:id/pdf-data
  * @param {any} claimId
 */
export async function getCommissionClaimPdfData(claimId) {
  const response = await apiClient.get(`/accounting/commissions/${claimId}/pdf-data`);
  return extractData(response);
}

/**
 * Deposit claim for PDF.
 * GET /api/accounting/deposits/:id/pdf-data
  * @param {any} depositId
 */
export async function getDepositClaimPdfData(depositId) {
  const response = await apiClient.get(`/accounting/deposits/${depositId}/pdf-data`);
  return extractData(response);
}

/**
 * Marketer performance report (unified report shape or existing report shape).
 * GET /hr/reports/marketer-performance?month=&year=&format=json
 */
export async function getMarketerPerformanceReportPdfData(params = {}) {
  const response = await apiClient.get('/hr/reports/marketer-performance', {
    params: { ...params, format: 'json' },
  });
  return extractData(response);
}

/**
 * Expiring contracts report.
 * GET /hr/reports/expiring-contracts?days=&format=json
 */
export async function getExpiringContractsReportPdfData(days = 30) {
  const response = await apiClient.get('/hr/reports/expiring-contracts', {
    params: { days, format: 'json' },
  });
  return extractData(response);
}

/**
 * Marketing reports list for PDF export (unified report shape or reportRows).
 * GET /marketing/reports with same filters as report view
 */
export async function getMarketingReportsPdfData(params = {}) {
  const response = await apiClient.get('/marketing/reports', { params });
  return extractData(response);
}

/**
 * Developer plan data for PDF.
 * GET /marketing/reports/developer-plan/:contractId/pdf-data
  * @param {any} contractId
 */
export async function getDeveloperPlanPdfData(contractId) {
  const response = await apiClient.get(`/marketing/reports/developer-plan/${contractId}/pdf-data`);
  return extractData(response);
}

/**
 * Employee plans for project (for PDF export).
 * GET /marketing/employee-plans/pdf-data?marketing_project_id=
  * @param {any} marketingProjectId
 */
export async function getEmployeePlansPdfData(marketingProjectId) {
  const response = await apiClient.get('/marketing/employee-plans/pdf-data', {
    params: { marketing_project_id: marketingProjectId },
  });
  return extractData(response);
}

/**
 * Contract summary for project management PDF.
 * GET /contracts/:id/summary-pdf-data
  * @param {any} contractId
 */
export async function getContractSummaryPdfData(contractId) {
  const response = await apiClient.get(`/contracts/${contractId}/summary-pdf-data`);
  return extractData(response);
}

/**
 * HR contract PDF data (for frontend-built contract PDF).
 * GET /hr/contracts/:id/pdf-data
  * @param {any} contractId
 */
export async function getHrContractPdfData(contractId) {
  const response = await apiClient.get(`/hr/contracts/${contractId}/pdf-data`);
  return extractData(response);
}

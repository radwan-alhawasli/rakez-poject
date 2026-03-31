import apiClient from '@/api/apiClient';
import logger from '@/utils/logger';

import { ensurePdfBlob } from '@/services/hr/hrPdfBlob.js';

// ==================== Reporting APIs (Mocked if not in Postman) ====================

/**
 * Generate monthly team performance report
 * GET /hr/reports/team-performance (params: month, year, format)
  * @param {any} month
  * @param {any} year
 */
export const generateTeamPerformanceReport = async (month, year, format = 'pdf') => {
  try {
    const response = await apiClient.get('/hr/reports/team-performance', {
      params: { month, year, format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });

    if (format === 'pdf' && response.data instanceof Blob) {
      const blob = await ensurePdfBlob(response);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team_performance_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response.data;
  } catch (error) {
    logger.error('Error generating team performance report:', error);
    throw error;
  }
};

/**
 * Generate marketer performance report (PDF built on frontend from API data).
 * GET /hr/reports/marketer-performance (params: marketer_id, month, year, format)
  * @param {any} marketerId
  * @param {any} month
  * @param {any} year
 */
export const generateMarketerReport = async (marketerId, month, year, format = 'pdf') => {
  try {
    if (format === 'pdf') {
      try {
        const dataResponse = await apiClient.get('/hr/reports/marketer-performance', {
          params: { marketer_id: marketerId, month, year, format: 'json' },
          responseType: 'json',
        });
        const report = dataResponse?.data?.data ?? dataResponse?.data ?? dataResponse;
        const { generateMarketerPerformanceReportPdf } = await import('@/services/pdfService');
        const pdfBytes = await generateMarketerPerformanceReportPdf(report, new Date().toISOString().slice(0, 10));
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `marketer_performance_${marketerId}_${month}_${year}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return blob;
      } catch (_err) {
        const response = await apiClient.get('/hr/reports/marketer-performance', {
          params: { marketer_id: marketerId, month, year, format: 'pdf' },
          responseType: 'blob',
        });
        if (response.data instanceof Blob) {
          const blob = await ensurePdfBlob(response);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `marketer_performance_${marketerId}_${month}_${year}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
        return response.data;
      }
    }
    const response = await apiClient.get('/hr/reports/marketer-performance', {
      params: { marketer_id: marketerId, month, year, format },
      responseType: 'json',
    });
    return response.data;
  } catch (error) {
    logger.error('Error generating marketer performance report:', error);
    throw error;
  }
};

/**
 * Generate employee list report
 * GET /hr/reports/employee-count (params: format)
 */
export const generateEmployeesReport = async (format = 'pdf') => {
  try {
    const response = await apiClient.get('/hr/reports/employee-count', {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json',
    });

    if (format === 'pdf' && response.data instanceof Blob) {
      const blob = await ensurePdfBlob(response);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employee_list_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response.data;
  } catch (error) {
    logger.error('Error generating employees report:', error);
    throw error;
  }
};

/**
 * Generate expiring/ended contracts report (PDF built on frontend from API data).
 * GET /hr/reports/expiring-contracts (params: days, format)
 */
export const generateExpiringContractsReport = async (days = 30, format = 'pdf') => {
  try {
    if (format === 'pdf') {
      try {
        const dataResponse = await apiClient.get('/hr/reports/expiring-contracts', {
          params: { days, format: 'json' },
          responseType: 'json',
        });
        const report = dataResponse?.data?.data ?? dataResponse?.data ?? dataResponse;
        const { generateExpiringContractsReportPdf } = await import('@/services/pdfService');
        const pdfBytes = await generateExpiringContractsReportPdf(report, days);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `expiring_contracts_${days}days.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return blob;
      } catch (_err) {
        const response = await apiClient.get('/hr/reports/expiring-contracts', {
          params: { days, format: 'pdf' },
          responseType: 'blob',
        });
        if (response.data instanceof Blob) {
          const blob = await ensurePdfBlob(response);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `expiring_contracts_${days}days.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
        return response.data;
      }
    }
    const response = await apiClient.get('/hr/reports/expiring-contracts', {
      params: { days, format },
      responseType: 'json',
    });
    return response.data;
  } catch (error) {
    logger.error('Error generating expiring contracts report:', error);
    throw error;
  }
};

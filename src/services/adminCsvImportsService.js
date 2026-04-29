import apiClient from '@/api/apiClient';
import serverClient from '@/api/serverClient';

/**
 * Upload CSV as multipart/form-data with field name `file`.
 * @param {'api'|'server'} client
 * @param {string} path
 * @param {File} file
 * @param {(pct: number) => void} [onProgress]
 */
async function uploadCsv(client, path, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  const axiosClient = client === 'server' ? serverClient : apiClient;

  return axiosClient.post(path, formData, {
    onUploadProgress: e => {
      if (!onProgress) return;
      const total = e.total || 0;
      if (!total) return;
      const pct = Math.max(0, Math.min(100, Math.round((e.loaded / total) * 100)));
      onProgress(pct);
    },
  });
}

export const adminCsvImportsService = {
  importCitiesDistricts(file, onProgress) {
    return uploadCsv('api', '/admin/csv/cities/import_csv', file, onProgress);
  },
  importDistricts(file, onProgress) {
    return uploadCsv('api', '/admin/csv/districts/import_csv', file, onProgress);
  },
  importTeams(file, onProgress) {
    return uploadCsv('api', '/admin/csv/teams/import_csv', file, onProgress);
  },
  importEmployees(file, onProgress) {
    // IMPORTANT: this uses SERVER_URL (not api base_url)
    return uploadCsv('server', '/admin/csv/employees/import_employees_csv', file, onProgress);
  },
  importContracts(file, onProgress) {
    return uploadCsv('api', '/admin/csv/contracts/import_csv', file, onProgress);
  },
  importContractInfo(contractId, file, onProgress) {
    return uploadCsv('api', `/admin/csv/contracts/import_info_csv/${contractId}`, file, onProgress);
  },
  importSecondPartyData(contractId, file, onProgress) {
    return uploadCsv('api', `/admin/csv/second-party-data/import_csv/${contractId}`, file, onProgress);
  },
};

export default adminCsvImportsService;

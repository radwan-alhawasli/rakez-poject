/**
 * Axios client for endpoints that use SERVER_URL (not API base_url).
 * - Attaches Bearer token
 * - Supports FormData (multipart/form-data) without forcing Content-Type
 *
 * @module api/serverClient
 */

import axios from 'axios';
import logger from '@/utils/logger';
import secureStorage from '@/utils/secureStorage';
import { getApiErrorMessage } from '@/utils/errorHandler';

function getServerBaseUrl() {
  const fromEnv = String(import.meta.env?.VITE_SERVER_URL || import.meta.env?.VITE_APP_SERVER_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  // Fallback: derive from VITE_APP_API_BASE_URL that usually ends with `/api`
  const apiBase = String(import.meta.env?.VITE_APP_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!apiBase) return '';
  return apiBase.replace(/\/api$/i, '');
}

const serverBaseUrl = getServerBaseUrl();

const serverClient = axios.create({
  baseURL: serverBaseUrl || undefined,
  headers: { Accept: 'application/json' },
  timeout: 60_000,
});

serverClient.interceptors.request.use(
  config => {
    const token = secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      secureStorage.updateLastActivity();
    }
    if (config.data && typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  error => Promise.reject(error)
);

serverClient.interceptors.response.use(
  r => r,
  error => {
    const friendlyMessage = getApiErrorMessage(error);
    const apiError = new Error(friendlyMessage);
    // @ts-ignore
    apiError.name = 'ServerAPIError';
    // @ts-ignore
    apiError.status = error?.response?.status ?? null;
    // @ts-ignore
    apiError.response = { status: error?.response?.status ?? null, data: error?.response?.data };
    // @ts-ignore
    apiError.data = error?.response?.data;
    // @ts-ignore
    apiError.url = error?.config?.url || '';

    if (!import.meta.env.PROD) {
      logger.error('[serverClient] API Error:', error?.response?.status, error?.config?.url, friendlyMessage);
    }
    return Promise.reject(apiError);
  }
);

export default serverClient;

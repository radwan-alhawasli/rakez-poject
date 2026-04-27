/// <reference types="vite/client" />

export {};

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    useCache?: boolean;
    usePersistentCache?: boolean;
    cacheTTL?: number;
  }
}

/** Axios/API-normalized errors in services (checkJs; optional fields). */
declare global {
  interface Error {
    status?: number | null;
    response?: { status?: number; data?: unknown; message?: string };
    data?: unknown;
    code?: string;
    originalError?: unknown;
    isAuthRedirect?: boolean;
    userMessage?: string;
    isOffline?: boolean;
    config?: { url?: string; method?: string; params?: unknown };
    info?: unknown;
    type?: string;
    url?: string;
    method?: string;
  }
}


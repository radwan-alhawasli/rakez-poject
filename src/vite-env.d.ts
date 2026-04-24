/// <reference types="vite/client" />

export {};

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
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
    url?: string;
    method?: string;
  }
}


declare module '@/constants/roles' {
  export const ROLE_MAP: Record<string, number>;
  export const ROLE_ADMIN: number;
  export const ROLE_PROJECT_MANAGEMENT: number;
  export const ROLE_EDITOR: number;
  export const ROLE_DEVELOPER: number;
  export const ROLE_SALES: number;
  export const ROLE_SALES_LEADER: number;
  export const ROLE_CREDIT: number;
  export const ROLE_ACCOUNTING: number;
  export const ROLE_ACCOUNTANT: number;
  export const ROLE_HR: number;
  export const ROLE_MARKETING: number;
  export const ROLE_INVENTORY: number;
}

declare module '@/constants/permissions' {
  export const BOOTSTRAP_ROLE_MAP: Record<string, string[]>;
  export const ROLE_TO_BOOTSTRAP_KEY: Record<number, string>;
  export const SALES_BASE_PERMISSIONS: string[];
  export const SALES_LEADER_EXTRA_PERMISSIONS: string[];
}

declare module '@/api/apiClient' {
  import { AxiosInstance } from 'axios';
  const apiClient: AxiosInstance;
  export default apiClient;
}

declare module '@/utils/secureStorage' {
  const secureStorage: {
    setToken(token: string): void;
    getToken(): string | null;
    setRefreshToken(token: string): void;
    setUserInfo(user: any): void;
    getUserInfo(): any;
    clearSession(): void;
    isSessionExpired(): boolean;
    shouldShowWarning(): boolean;
    getTimeUntilExpiration(): number;
    extendSession(): void;
  };
  export default secureStorage;
}

declare module '@/utils/serviceErrorHandler' {
  export function handleServiceError(error: any, context: string, method: string, defaultReturn?: any): any;
}

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthService = {
  isAuthenticated: vi.fn(),
  getCurrentUser: vi.fn(),
  isSessionExpiring: vi.fn(() => false),
};

vi.mock('@/services/authService', () => ({
  default: mockAuthService,
}));

vi.mock('@/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('@/utils/rbac', () => ({
  canAccessRoute: vi.fn(() => true),
  getDashboardPathForUser: vi.fn(() => '/dashboard'),
  isSalesLeader: vi.fn(() => false),
}));

vi.mock('@/services/notificationService', () => ({
  default: { addNotification: vi.fn() },
}));

describe('Router guards', () => {
  let router;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    router = (await import('@/router/index.js')).default;
  });

  it('redirects to login when not authenticated and route requires auth', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockReturnValue(null);

    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('allows navigation when authenticated', async () => {
    const mockUser = { email: 'admin@rakez.com', type: 1 };
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);

    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  it('allows navigation to public routes (login) without auth', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockReturnValue(null);

    await router.push('/login');

    expect(router.currentRoute.value.path).toBe('/login');
  });
});

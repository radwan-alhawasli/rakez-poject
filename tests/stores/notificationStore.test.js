/**
 * Notification Store Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '../../src/stores/notificationStore';
import notificationService from '../../src/services/notificationService';

vi.mock('../../src/services/notificationService', () => {
  const state = { value: [] };
  const unreadCount = { value: 0 };
  return {
    default: {
      init: vi.fn(),
      fetchAll: vi.fn(),
      addNotification: vi.fn(),
      state,
      unreadCount,
    },
  };
});

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    notificationService.state.value = [];
    notificationService.unreadCount.value = 0;
  });

  it('should have initial state and getters', () => {
    const store = useNotificationStore();
    expect(store.notifications).toEqual([]);
    expect(store.allNotifications).toEqual([]);
    expect(store.unreadCount).toBe(0);
  });

  it('should have initial state and getters', () => {
    const store = useNotificationStore();
    expect(store.notifications).toEqual([]);
    expect(store.allNotifications).toEqual([]);
    expect(store.unreadCount).toBe(0);
  });

  it('initialize should sync from service', async () => {
    notificationService.state.value = [{ id: 1, read: false }];
    notificationService.unreadCount.value = 1;
    vi.mocked(notificationService.init).mockResolvedValue();

    const store = useNotificationStore();
    await store.initialize();

    expect(notificationService.init).toHaveBeenCalled();
    expect(store.notifications.length).toBe(1);
    expect(store.unreadCount).toBe(1);
  });
});

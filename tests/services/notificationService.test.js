import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import notificationService from '../../src/services/notificationService';

vi.mock('../../src/services/authService', () => ({
  default: {
    isAuthenticated: vi.fn(() => true),
    getCurrentUser: vi.fn(() => ({ id: 1, type: 1 })),
    getToken: vi.fn(() => 'mock_token'),
  },
}));

vi.mock('../../src/plugins/pusher', () => ({
  createPusher: vi.fn(() => ({
    subscribe: vi.fn(() => ({ bind: vi.fn(), unbind_all: vi.fn() })),
    disconnect: vi.fn(),
  })),
}));

describe('notificationService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
    notificationService.disconnect();
  });

  it('fetchAll uses /notifications and /admin/notifications when admin', async () => {
    mock.onGet('/notifications').reply(200, { data: [{ id: 1, message: 'A', read_at: null }] });
    mock.onGet('/admin/notifications').reply(200, { data: [] });

    await notificationService.fetchAll();
    const urls = mock.history.get.map(r => r.url);
    expect(urls).toContain('/notifications');
    expect(urls).toContain('/admin/notifications');
  });

  it('markAsRead patches /user/notifications/:id/read for non-accounting user', async () => {
    notificationService.state.value = [{ id: 10, read: false }];
    mock.onPatch('/user/notifications/10/read').reply(200, { data: { ok: true } });
    await notificationService.markAsRead(10);
    expect(mock.history.patch[0].url).toBe('/user/notifications/10/read');
  });

  it('markAllAsRead patches /user/notifications/mark-all-read for non-accounting user', async () => {
    notificationService.state.value = [{ id: 1, read: false }];
    mock.onPatch('/user/notifications/mark-all-read').reply(200, { data: { ok: true } });
    await notificationService.markAllAsRead();
    expect(mock.history.patch[0].url).toBe('/user/notifications/mark-all-read');
  });

  it('supports generic notifications endpoints', async () => {
    mock.onGet('/notifications').reply(200, { data: [] });
    mock.onGet('/notifications/public').reply(200, { data: [] });
    mock.onDelete('/notifications/2').reply(200, { data: { deleted: true } });

    const my = await notificationService.getMyNotifications();
    const pub = await notificationService.getPublicNotifications();
    const del = await notificationService.deleteNotification(2);

    expect(Array.isArray(my)).toBe(true);
    expect(Array.isArray(pub)).toBe(true);
    expect(del.deleted).toBe(true);
  });

  it('sendPublicNotification sends { title, body } when given a string', async () => {
    mock.onPost('/admin/notifications/send-public').reply(200, { ok: true });
    await notificationService.sendPublicNotification('hello');
    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toEqual({ title: 'إشعار', body: 'hello' });
  });

  it('sendPublicNotification sends { title, body } when given an object', async () => {
    mock.onPost('/admin/notifications/send-public').reply(200, { ok: true });
    await notificationService.sendPublicNotification({ title: 'عنوان', body: 'نص' });
    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toEqual({ title: 'عنوان', body: 'نص' });
  });

  it('sendUserNotification sends { user_id, title, body } when given a string', async () => {
    mock.onPost('/admin/notifications/send-to-user').reply(200, { ok: true });
    await notificationService.sendUserNotification(5, 'msg');
    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toEqual({ user_id: 5, title: 'إشعار', body: 'msg' });
  });

  it('sendUserNotification sends { user_id, title, body } when given an object', async () => {
    mock.onPost('/admin/notifications/send-to-user').reply(200, { ok: true });
    await notificationService.sendUserNotification(5, { title: 'عنوان', body: 'نص' });
    const body = JSON.parse(mock.history.post[0].data);
    expect(body).toEqual({ user_id: 5, title: 'عنوان', body: 'نص' });
  });
});

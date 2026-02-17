import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../utils/testSetup'
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory'
import apiClient from '../../src/api/apiClient'
import notificationService from '../../src/services/notificationService'

vi.mock('../../src/services/authService', () => ({
  default: {
    isAuthenticated: vi.fn(() => true),
    getCurrentUser: vi.fn(() => ({ id: 1, type: 1 })),
    getToken: vi.fn(() => 'mock_token')
  }
}))

vi.mock('../../src/plugins/pusher', () => ({
  createPusher: vi.fn(() => ({
    subscribe: vi.fn(() => ({ bind: vi.fn(), unbind_all: vi.fn() })),
    disconnect: vi.fn()
  }))
}))

describe('notificationService', () => {
  let mock

  beforeEach(() => {
    mock = createApiMock({}, apiClient)
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetMocks(mock)
    restoreMocks(mock)
    notificationService.disconnect()
  })

  it('fetchAll uses /notifications and /admin/notifications when admin', async () => {
    mock.onGet('/notifications').reply(200, { data: [{ id: 1, message: 'A', read_at: null }] })
    mock.onGet('/admin/notifications').reply(200, { data: [] })

    await notificationService.fetchAll()
    const urls = mock.history.get.map((r) => r.url)
    expect(urls).toContain('/notifications')
    expect(urls).toContain('/admin/notifications')
  })

  it('markAsRead posts to /notifications/:id/read', async () => {
    notificationService.state.value = [{ id: 10, read: false }]
    mock.onPost('/notifications/10/read').reply(200, { data: { ok: true } })
    await notificationService.markAsRead(10)
    expect(mock.history.post[0].url).toBe('/notifications/10/read')
  })

  it('markAllAsRead posts to /notifications/read-all', async () => {
    notificationService.state.value = [{ id: 1, read: false }]
    mock.onPost('/notifications/read-all').reply(200, { data: { ok: true } })
    await notificationService.markAllAsRead()
    expect(mock.history.post[0].url).toBe('/notifications/read-all')
  })

  it('supports generic notifications endpoints', async () => {
    mock.onGet('/notifications').reply(200, { data: [] })
    mock.onGet('/notifications/public').reply(200, { data: [] })
    mock.onDelete('/notifications/2').reply(200, { data: { deleted: true } })

    const my = await notificationService.getMyNotifications()
    const pub = await notificationService.getPublicNotifications()
    const del = await notificationService.deleteNotification(2)

    expect(Array.isArray(my)).toBe(true)
    expect(Array.isArray(pub)).toBe(true)
    expect(del.deleted).toBe(true)
  })
})

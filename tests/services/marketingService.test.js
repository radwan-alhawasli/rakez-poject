import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../utils/testSetup'
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory'
import apiClient from '../../src/api/apiClient'
import marketingService from '../../src/services/marketingService'

describe('marketingService', () => {
  let mock

  beforeEach(() => {
    mock = createApiMock({}, apiClient)
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetMocks(mock)
    restoreMocks(mock)
  })

  it('normalizes dashboard KPI values', async () => {
    mock.onGet('/marketing/dashboard').reply(200, {
      data: {
        total_leads: '10',
        daily_deposits_count: '2'
      }
    })
    const result = await marketingService.getDashboard()
    expect(result.total_leads).toBe(10)
    expect(result.daily_deposits_count).toBe(2)
  })

  it('returns paginated projects as {items,total}', async () => {
    mock.onGet('/marketing/projects').reply(200, {
      data: [{ id: 1, project_name: 'P1', units: [] }],
      meta: { pagination: { total: 1 } }
    })
    const result = await marketingService.getProjects()
    expect(Array.isArray(result.items)).toBe(true)
    expect(result.total).toBe(1)
  })

  it('creates expected sale and computes normalized fields', async () => {
    mock.onPost('/marketing/expected-sales').reply(200, {
      data: {
        project_id: 1,
        direct_communications: 100,
        hand_raises: 50,
        conversion_rate: 0.01,
        campaign_budget: 10000
      }
    })
    const result = await marketingService.createExpectedSale({ project_id: 1 })
    expect(result.expected_bookings).toBe(2)
    expect(result.deposit_per_booking).toBe(5000)
  })

  it('supports expected sale conversion_rate passed as percent', async () => {
    mock.onPost('/marketing/expected-sales').reply(200, {
      data: {
        project_id: 1,
        direct_communications: 100,
        hand_raises: 50,
        conversion_rate: 2.5,
        campaign_budget: 10000
      }
    })

    const result = await marketingService.createExpectedSale({ project_id: 1 })
    expect(result.conversion_rate_percent).toBe(2.5)
    expect(result.expected_bookings).toBe(4)
    expect(result.deposit_per_booking).toBe(2500)
  })

  it('updates task status using PUT /marketing/tasks/:id', async () => {
    mock.onPut('/marketing/tasks/7').reply(200, { data: { id: 7, status: 'completed' } })
    const result = await marketingService.updateTaskStatus(7, 'completed')
    expect(result.status).toBe('completed')
  })

  it('supports lead assign and convert endpoints', async () => {
    mock.onPost('/marketing/leads/8/assign').reply(200, { data: { ok: true } })
    mock.onPost('/marketing/leads/8/convert').reply(200, { data: { converted: true } })

    const assigned = await marketingService.assignLead(8, { user_id: 3 })
    const converted = await marketingService.convertLead(8)

    expect(assigned.ok).toBe(true)
    expect(converted.converted).toBe(true)
  })
})

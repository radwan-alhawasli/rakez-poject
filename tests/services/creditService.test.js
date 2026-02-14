/**
 * Credit Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../utils/testSetup'
import { createApiMock, resetMocks, restoreMocks, createSuccessResponse, createErrorResponse } from '../utils/apiMockFactory'
import apiClient from '../../src/api/apiClient'
import creditService from '../../src/services/creditService'

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

const asList = (result) => (Array.isArray(result) ? result : (result?.items || []))

describe('creditService', () => {
  let mock

  beforeEach(() => {
    mock = createApiMock({}, apiClient)
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetMocks(mock)
    restoreMocks(mock)
  })

  describe('getDashboard', () => {
    it('should fetch credit dashboard data', async () => {
      const mockDashboard = { total_bookings: 50, pending_financing: 10 }
      mock.onGet('/credit/dashboard').reply(200, createSuccessResponse(mockDashboard))

      const result = await creditService.getDashboard()

      expect(mock.history.get.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should handle error when fetching dashboard', async () => {
      mock.onGet('/credit/dashboard').reply(500, createErrorResponse('Server error', 500))

      await expect(creditService.getDashboard()).rejects.toThrow()
    })
  })

  describe('getConfirmedBookings', () => {
    it('should fetch confirmed bookings', async () => {
      const mockBookings = [{ id: 1, status: 'confirmed' }]
      mock.onGet('/credit/bookings/confirmed').reply(200, createSuccessResponse(mockBookings))

      const result = await creditService.getConfirmedBookings()

      expect(mock.history.get.length).toBe(1)
      expect(Array.isArray(asList(result))).toBe(true)
    })

    it('should handle empty response', async () => {
      mock.onGet('/credit/bookings/confirmed').reply(200, { data: [] })

      const result = await creditService.getConfirmedBookings()
      const items = asList(result)
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBe(0)
    })
  })

  describe('getConfirmedBookingById', () => {
    it('should fetch confirmed booking details', async () => {
      const bookingId = 1
      const mockBooking = { id: bookingId, status: 'confirmed' }
      mock.onGet(`/credit/bookings/confirmed/${bookingId}`).reply(200, createSuccessResponse(mockBooking))

      const result = await creditService.getConfirmedBookingById(bookingId)

      expect(mock.history.get.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should handle 404 error', async () => {
      mock.onGet('/credit/bookings/confirmed/999').reply(404, createErrorResponse('Not found', 404))

      await expect(creditService.getConfirmedBookingById(999)).rejects.toThrow()
    })
  })

  describe('getNegotiationBookings', () => {
    it('should fetch negotiation bookings', async () => {
      const mockBookings = [{ id: 1, status: 'negotiation' }]
      mock.onGet('/credit/bookings/negotiation').reply(200, createSuccessResponse(mockBookings))

      const result = await creditService.getNegotiationBookings()

      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('updateNegotiation', () => {
    it('should update negotiation status', async () => {
      const bookingId = 1
      const updateData = { status: 'agreed', notes: 'Customer accepted' }
      mock.onPut(`/credit/bookings/negotiation/${bookingId}`).reply(200, createSuccessResponse({ id: bookingId, ...updateData }))

      const result = await creditService.updateNegotiation(bookingId, updateData)

      expect(mock.history.put.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getWaitingBookings', () => {
    it('should fetch waiting bookings', async () => {
      const mockBookings = [{ id: 1, status: 'waiting' }]
      mock.onGet('/credit/bookings/waiting').reply(200, createSuccessResponse(mockBookings))

      const result = await creditService.getWaitingBookings()

      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('processWaitingBooking', () => {
    it('should process waiting booking', async () => {
      const bookingId = 1
      const processData = { action: 'approve', notes: 'Documentation verified' }
      mock.onPost(`/credit/bookings/waiting/${bookingId}/process`).reply(200, createSuccessResponse({ id: bookingId, processed: true }))

      const result = await creditService.processWaitingBooking(bookingId, processData)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getFinancing', () => {
    it('should fetch financing applications', async () => {
      const mockFinancing = [{ id: 1, amount: 1000000 }]
      mock.onGet('/credit/financing').reply(200, createSuccessResponse(mockFinancing))

      const result = await creditService.getFinancing()

      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('getFinancingById', () => {
    it('should fetch financing details', async () => {
      const financingId = 1
      const mockFinancing = { id: financingId, amount: 1000000 }
      mock.onGet(`/credit/financing/${financingId}`).reply(200, createSuccessResponse(mockFinancing))

      const result = await creditService.getFinancingById(financingId)

      expect(result).toBeDefined()
    })
  })

  describe('updateFinancing', () => {
    it('should update financing application', async () => {
      const financingId = 1
      const updateData = { status: 'approved', bank: 'Al Rajhi Bank' }
      mock.onPut(`/credit/financing/${financingId}`).reply(200, createSuccessResponse({ id: financingId, ...updateData }))

      const result = await creditService.updateFinancing(financingId, updateData)

      expect(mock.history.put.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getTitleTransfers', () => {
    it('should fetch title transfer requests', async () => {
      const mockTransfers = [{ id: 1, contract_id: 100 }]
      mock.onGet('/credit/title-transfer').reply(200, createSuccessResponse(mockTransfers))

      const result = await creditService.getTitleTransfers()

      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('createTitleTransfer', () => {
    it('should create title transfer request', async () => {
      const transferData = { contract_id: 100, transfer_date: '2026-03-01' }
      mock.onPost('/credit/title-transfer').reply(201, createSuccessResponse({ id: 1, ...transferData }))

      const result = await creditService.createTitleTransfer(transferData)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('completeTitleTransfer', () => {
    it('should complete title transfer', async () => {
      const transferId = 1
      const completionData = { completion_date: '2026-03-05', deed_number: 'DEE-2026-001234' }
      mock.onPost(`/credit/title-transfer/${transferId}/complete`).reply(200, createSuccessResponse({ id: transferId, completed: true }))

      const result = await creditService.completeTitleTransfer(transferId, completionData)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getSoldProjects', () => {
    it('should fetch sold projects', async () => {
      const mockProjects = [{ id: 1, name: 'Project 1' }]
      mock.onGet('/credit/sold-projects').reply(200, createSuccessResponse(mockProjects))

      const result = await creditService.getSoldProjects()

      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('getSoldProjectById', () => {
    it('should fetch sold project details', async () => {
      const projectId = 1
      const mockProject = { id: projectId, name: 'Project 1' }
      mock.onGet(`/credit/sold-projects/${projectId}`).reply(200, createSuccessResponse(mockProject))

      const result = await creditService.getSoldProjectById(projectId)

      expect(result).toBeDefined()
    })
  })

  describe('getClaimFiles', () => {
    it('should fetch claim files', async () => {
      const mockClaims = [{ id: 1, claim_amount: 150000 }]
      mock.onGet('/credit/claim-files').reply(200, createSuccessResponse(mockClaims))

      const result = await creditService.getClaimFiles()

      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('createClaimFile', () => {
    it('should create claim file', async () => {
      const claimData = { contract_id: 100, claim_amount: 150000, claim_type: 'commission' }
      mock.onPost('/credit/claim-files').reply(201, createSuccessResponse({ id: 1, ...claimData }))

      const result = await creditService.createClaimFile(claimData)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('submitClaim', () => {
    it('should submit claim file', async () => {
      const claimId = 1
      mock.onPost(`/credit/claim-files/${claimId}/submit`).reply(200, createSuccessResponse({ id: claimId, submitted: true }))

      const result = await creditService.submitClaim(claimId)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('approveClaim', () => {
    it('should approve claim payment', async () => {
      const claimId = 1
      const approvalData = { approved_amount: 150000, payment_date: '2026-03-15' }
      mock.onPost(`/credit/claim-files/${claimId}/approve`).reply(200, createSuccessResponse({ id: claimId, approved: true }))

      const result = await creditService.approveClaim(claimId, approvalData)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      mock.onGet('/credit/dashboard').reply(400, createErrorResponse('Bad request', 400))

      await expect(creditService.getDashboard()).rejects.toThrow()
    })

    it('should handle 401 Unauthorized', async () => {
      mock.onGet('/credit/bookings/confirmed').reply(401, createErrorResponse('Unauthorized', 401))

      await expect(creditService.getConfirmedBookings()).rejects.toThrow()
    })

    it('should handle 403 Forbidden', async () => {
      mock.onPost('/credit/claim-files').reply(403, createErrorResponse('Forbidden', 403))

      await expect(creditService.createClaimFile({})).rejects.toThrow()
    })

    it('should handle 404 Not Found', async () => {
      mock.onGet('/credit/bookings/confirmed/999').reply(404, createErrorResponse('Not found', 404))

      await expect(creditService.getConfirmedBookingById(999)).rejects.toThrow()
    })

    it('should handle 422 Validation Error', async () => {
      mock.onPut('/credit/financing/1').reply(422, createErrorResponse('Validation failed', 422))

      await expect(creditService.updateFinancing(1, {})).rejects.toThrow()
    })

    it('should handle 500 Server Error', async () => {
      mock.onGet('/credit/dashboard').reply(500, createErrorResponse('Server error', 500))

      await expect(creditService.getDashboard()).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      mock.onGet('/credit/dashboard').networkError()

      await expect(creditService.getDashboard()).rejects.toThrow()
    })

    it('should handle timeout errors', async () => {
      mock.onGet('/credit/bookings/confirmed').timeout()

      await expect(creditService.getConfirmedBookings()).rejects.toThrow()
    })
  })

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null response data', async () => {
      mock.onGet('/credit/dashboard').reply(200, { data: null })

      const result = await creditService.getDashboard()
      expect(result).toEqual({})
    })

    it('should handle missing data property', async () => {
      mock.onGet('/credit/dashboard').reply(200, {})

      const result = await creditService.getDashboard()
      expect(result).toEqual({})
    })

    it('should handle empty string response', async () => {
      mock.onGet('/credit/bookings/confirmed').reply(200, '')

      const result = await creditService.getConfirmedBookings()
      expect(Array.isArray(asList(result))).toBe(true)
    })

    it('should handle invalid booking ID', async () => {
      mock.onGet('/credit/bookings/confirmed/invalid').reply(400, createErrorResponse('Invalid ID', 400))

      await expect(creditService.getConfirmedBookingById('invalid')).rejects.toThrow()
    })

    it('should handle zero booking ID', async () => {
      mock.onGet('/credit/bookings/confirmed/0').reply(400, createErrorResponse('Invalid ID', 400))

      await expect(creditService.getConfirmedBookingById(0)).rejects.toThrow()
    })

    it('should handle negative booking ID', async () => {
      mock.onGet('/credit/bookings/confirmed/-1').reply(400, createErrorResponse('Invalid ID', 400))

      await expect(creditService.getConfirmedBookingById(-1)).rejects.toThrow()
    })

    it('should handle empty array response', async () => {
      mock.onGet('/credit/bookings/confirmed').reply(200, { data: [] })

      const result = await creditService.getConfirmedBookings()
      const items = asList(result)
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBe(0)
    })

    it('should handle missing required fields in createClaimFile', async () => {
      mock.onPost('/credit/claim-files').reply(422, createErrorResponse('Missing required fields', 422))

      await expect(creditService.createClaimFile({})).rejects.toThrow()
    })
  })
})

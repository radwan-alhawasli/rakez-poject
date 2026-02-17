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

    it('should return empty object when response data is null', async () => {
      mock.onGet('/credit/dashboard').reply(200, { data: null })
      const result = await creditService.getDashboard()
      expect(result).toEqual({})
    })
  })

  describe('refreshDashboard', () => {
    it('should post to refresh dashboard', async () => {
      const mockData = { refreshed: true }
      mock.onPost('/credit/dashboard/refresh').reply(200, mockData)
      const result = await creditService.refreshDashboard()
      expect(mock.history.post.length).toBe(1)
      expect(result).toEqual(mockData)
    })
  })

  describe('getNotifications', () => {
    it('should fetch credit notifications with items and total', async () => {
      mock.onGet('/credit/notifications').reply(200, { data: [{ id: 1 }], meta: { total: 1 } })
      const result = await creditService.getNotifications()
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(Array.isArray(result.items)).toBe(true)
    })
  })

  describe('getClaimFilePdfDownloadUrl', () => {
    it('should return URL string for claim file pdf', () => {
      const url = creditService.getClaimFilePdfDownloadUrl(42)
      expect(typeof url).toBe('string')
      expect(url).toContain('/credit/claim-files/42/pdf')
    })
  })

  describe('getNotificationsProxy', () => {
    it('should fetch notifications via proxy URL', async () => {
      mock.onGet('/notifications').reply(200, { data: [{ id: 1 }], meta: { total: 1 } })
      const result = await creditService.getNotificationsProxy()
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(Array.isArray(result.items)).toBe(true)
    })
  })

  describe('markNotificationRead', () => {
    it('should mark notification as read', async () => {
      mock.onPost('/credit/notifications/1/read').reply(200, { success: true })
      const result = await creditService.markNotificationRead(1)
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('markAllNotificationsRead', () => {
    it('should mark all notifications as read', async () => {
      mock.onPost('/credit/notifications/read-all').reply(200, { success: true })
      const result = await creditService.markAllNotificationsRead()
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getBookingById', () => {
    it('should fetch booking by id', async () => {
      const bookingId = 1
      mock.onGet(`/credit/bookings/${bookingId}`).reply(200, { data: { id: bookingId } })
      const result = await creditService.getBookingById(bookingId)
      expect(result).toBeDefined()
      expect(mock.history.get.length).toBe(1)
    })

    it('should throw for invalid booking id', async () => {
      await expect(creditService.getBookingById(null)).rejects.toThrow('معرف الحجز غير صالح')
      await expect(creditService.getBookingById('')).rejects.toThrow()
      await expect(creditService.getBookingById(undefined)).rejects.toThrow()
    })
  })

  describe('cancelBooking', () => {
    it('should cancel booking with reason', async () => {
      mock.onPost('/credit/bookings/1/cancel').reply(200, { data: { cancelled: true } })
      const result = await creditService.cancelBooking(1, { cancellation_reason: 'Bank rejected' })
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should throw for invalid booking id', async () => {
      await expect(creditService.cancelBooking(null)).rejects.toThrow()
    })
  })

  describe('getSoldBookings', () => {
    it('should fetch sold bookings', async () => {
      mock.onGet('/credit/bookings/sold').reply(200, { data: [{ id: 1 }], meta: { total: 1 } })
      const result = await creditService.getSoldBookings()
      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('getCancelledBookings', () => {
    it('should fetch cancelled bookings', async () => {
      mock.onGet('/credit/bookings/cancelled').reply(200, { data: [] })
      const result = await creditService.getCancelledBookings()
      expect(Array.isArray(asList(result))).toBe(true)
    })
  })

  describe('advanceFinancing', () => {
    it('should advance financing stage', async () => {
      mock.onPost('/credit/bookings/1/financing/advance').reply(200, { data: { stage: 2 } })
      const result = await creditService.advanceFinancing(1, { bank_name: 'Bank' })
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should throw for invalid booking id', async () => {
      await expect(creditService.advanceFinancing(null)).rejects.toThrow()
    })
  })

  describe('initializeFinancingTracker', () => {
    it('should initialize financing tracker', async () => {
      mock.onPost('/credit/bookings/1/financing').reply(201, { data: { id: 1 } })
      const result = await creditService.initializeFinancingTracker(1)
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getFinancingTracker', () => {
    it('should fetch financing tracker', async () => {
      mock.onGet('/credit/bookings/1/financing').reply(200, { data: { current_stage: 1 } })
      const result = await creditService.getFinancingTracker(1)
      expect(result).toBeDefined()
    })

    it('should return default on 404', async () => {
      mock.onGet('/credit/bookings/999/financing').reply(404, { message: 'Not found' })
      const result = await creditService.getFinancingTracker(999)
      expect(result).toBeNull()
    })
  })

  describe('completeFinancingStage', () => {
    it('should complete financing stage', async () => {
      mock.onPatch('/credit/bookings/1/financing/stage/1').reply(200, { data: { completed: true } })
      const result = await creditService.completeFinancingStage(1, 1, { bank_name: 'Bank' })
      expect(mock.history.patch.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('rejectFinancing', () => {
    it('should reject financing with object', async () => {
      mock.onPost('/credit/bookings/1/financing/reject').reply(200, { data: { rejected: true } })
      const result = await creditService.rejectFinancing(1, { reason: 'رفض التمويل' })
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should reject financing with string reason', async () => {
      mock.onPost('/credit/bookings/1/financing/reject').reply(200, { data: {} })
      await creditService.rejectFinancing(1, 'رفض')
      expect(mock.history.post[0].data).toBe(JSON.stringify({ reason: 'رفض' }))
    })
  })

  describe('initializeTitleTransfer', () => {
    it('should initialize title transfer', async () => {
      mock.onPost('/credit/bookings/1/title-transfer').reply(200, { data: { id: 1 } })
      const result = await creditService.initializeTitleTransfer(1)
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('scheduleTitleTransfer', () => {
    it('should schedule title transfer', async () => {
      mock.onPatch('/credit/title-transfer/1/schedule').reply(200, { data: { scheduled_date: '2026-03-01' } })
      const result = await creditService.scheduleTitleTransfer(1, { scheduled_date: '2026-03-01' })
      expect(mock.history.patch.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('unscheduleTitleTransfer', () => {
    it('should unschedule title transfer', async () => {
      mock.onPatch('/credit/title-transfer/1/unschedule').reply(200, { data: {} })
      const result = await creditService.unscheduleTitleTransfer(1)
      expect(mock.history.patch.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('getPendingTitleTransfers', () => {
    it('should fetch pending title transfers', async () => {
      mock.onGet('/credit/title-transfers/pending').reply(200, { data: [{ id: 1 }] })
      const result = await creditService.getPendingTitleTransfers()
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
    })
  })

  describe('getClaimFileById', () => {
    it('should fetch claim file by id', async () => {
      mock.onGet('/credit/claim-files/1').reply(200, { data: { id: 1 } })
      const result = await creditService.getClaimFileById(1)
      expect(result).toBeDefined()
    })
  })

  describe('generateClaimFilePdf', () => {
    it('should generate claim file pdf', async () => {
      mock.onPost('/credit/claim-files/1/pdf').reply(200, { data: { pdf_path: '/path' } })
      const result = await creditService.generateClaimFilePdf(1)
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })
  })

  describe('generateClaimFileForBooking', () => {
    it('should generate claim file for booking', async () => {
      mock.onPost('/credit/bookings/1/claim-file').reply(200, { data: { id: 1 } })
      const result = await creditService.generateClaimFileForBooking(1)
      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should throw for invalid booking id', async () => {
      await expect(creditService.generateClaimFileForBooking(null)).rejects.toThrow()
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

  describe('Payment Plan (Tab 3.3)', () => {
    it('should get payment plan for booking', async () => {
      const bookingId = 1
      const mockPlan = { installments: [{ id: 1, amount: 100000, due_date: '2026-03-01' }] }
      mock.onGet(`/credit/bookings/${bookingId}/payment-plan`).reply(200, createSuccessResponse(mockPlan))

      const result = await creditService.getPaymentPlan(bookingId)

      expect(mock.history.get.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should create payment plan for booking', async () => {
      const bookingId = 1
      const data = { installments: [{ due_date: '2026-03-01', amount: 100000, description: 'الدفعة الأولى' }] }
      mock.onPost(`/credit/bookings/${bookingId}/payment-plan`).reply(201, createSuccessResponse({ id: 1, ...data }))

      const result = await creditService.createPaymentPlan(bookingId, data)

      expect(mock.history.post.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should update installment', async () => {
      const installmentId = 1
      const data = { due_date: '2026-03-15', amount: 120000, status: 'pending' }
      mock.onPut(`/credit/payment-installments/${installmentId}`).reply(200, createSuccessResponse({ id: installmentId, ...data }))

      const result = await creditService.updateInstallment(installmentId, data)

      expect(mock.history.put.length).toBe(1)
      expect(result).toBeDefined()
    })

    it('should delete installment', async () => {
      const installmentId = 1
      mock.onDelete(`/credit/payment-installments/${installmentId}`).reply(200, createSuccessResponse({ deleted: true }))

      const result = await creditService.deleteInstallment(installmentId)

      expect(mock.history.delete.length).toBe(1)
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

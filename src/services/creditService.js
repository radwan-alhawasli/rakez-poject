import apiClient from '../api/apiClient'
import logger from '../utils/logger'
import { handleServiceError } from '../utils/serviceErrorHandler'
import { extractPaginatedData } from '../utils/paginationUtils'

/**
 * Credit Department Service
 * Manages credit operations including bookings, financing, title transfers, and claim files
 */
const creditService = {
  /**
   * Get credit department dashboard
   * GET /credit/dashboard
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboard(params = {}) {
    try {
      const response = await apiClient.get('/credit/dashboard', { params })
      // If response.data.data is explicitly null, return empty object
      if (response.data?.data === null) {
        return {}
      }
      // Otherwise use normal extraction logic
      const data = response.data?.data ?? response.data
      // Return empty object if final data is null or undefined
      return (data === null || data === undefined) ? {} : data
    } catch (error) {
      return handleServiceError(error, 'Error fetching credit dashboard', 'get', {}) || {}
    }
  },

  // --- Bookings - Confirmed ---

  /**
   * Get confirmed bookings
   * GET /credit/bookings/confirmed
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of confirmed bookings
   */
  async getConfirmedBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/confirmed', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching confirmed bookings', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Get confirmed booking details
   * GET /credit/bookings/confirmed/:booking_id
   * @param {number|string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getConfirmedBookingById(bookingId) {
    try {
      const response = await apiClient.get(`/credit/bookings/confirmed/${bookingId}`)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error fetching confirmed booking ${bookingId}:`, error)
      throw error
    }
  },

  // --- Bookings - Negotiation ---

  /**
   * Get bookings under negotiation
   * GET /credit/bookings/negotiation
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of bookings under negotiation
   */
  async getNegotiationBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/negotiation', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching negotiation bookings', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Update negotiation status
   * PUT /credit/bookings/negotiation/:booking_id
   * @param {number|string} bookingId - Booking ID
   * @param {Object} data - Update data (status, notes, etc.)
   * @returns {Promise<Object>} Updated booking
   */
  async updateNegotiation(bookingId, data) {
    try {
      const response = await apiClient.put(`/credit/bookings/negotiation/${bookingId}`, data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error updating negotiation ${bookingId}:`, error)
      throw error
    }
  },

  // --- Bookings - Waiting ---

  /**
   * Get waiting bookings
   * GET /credit/bookings/waiting
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of waiting bookings
   */
  async getWaitingBookings(params = {}) {
    try {
      const response = await apiClient.get('/credit/bookings/waiting', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching waiting bookings', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Process waiting booking
   * POST /credit/bookings/waiting/:booking_id/process
   * @param {number|string} bookingId - Booking ID
   * @param {Object} data - Process data (action, notes, etc.)
   * @returns {Promise<Object>} Processed booking
   */
  async processWaitingBooking(bookingId, data) {
    try {
      const response = await apiClient.post(`/credit/bookings/waiting/${bookingId}/process`, data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error processing waiting booking ${bookingId}:`, error)
      throw error
    }
  },

  // --- Financing Tracker ---

  /**
   * Get financing applications
   * GET /credit/financing
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of financing applications
   */
  async getFinancing(params = {}) {
    try {
      const response = await apiClient.get('/credit/financing', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching financing', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Get financing details
   * GET /credit/financing/:financing_id
   * @param {number|string} financingId - Financing ID
   * @returns {Promise<Object>} Financing details
   */
  async getFinancingById(financingId) {
    try {
      const response = await apiClient.get(`/credit/financing/${financingId}`)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error fetching financing ${financingId}:`, error)
      throw error
    }
  },

  /**
   * Update financing application
   * PUT /credit/financing/:financing_id
   * @param {number|string} financingId - Financing ID
   * @param {Object} data - Update data (status, bank, amount, approval_date, etc.)
   * @returns {Promise<Object>} Updated financing
   */
  async updateFinancing(financingId, data) {
    try {
      const response = await apiClient.put(`/credit/financing/${financingId}`, data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error updating financing ${financingId}:`, error)
      throw error
    }
  },

  // --- Title Transfer ---

  /**
   * Get title transfer requests
   * GET /credit/title-transfer
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of title transfer requests
   */
  async getTitleTransfers(params = {}) {
    try {
      const response = await apiClient.get('/credit/title-transfer', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching title transfers', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Create title transfer request
   * POST /credit/title-transfer
   * @param {Object} data - Transfer data (contract_id, transfer_date, status, etc.)
   * @returns {Promise<Object>} Created transfer
   */
  async createTitleTransfer(data) {
    try {
      const response = await apiClient.post('/credit/title-transfer', data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error creating title transfer:', error)
      throw error
    }
  },

  /**
   * Complete title transfer
   * POST /credit/title-transfer/:transfer_id/complete
   * @param {number|string} transferId - Transfer ID
   * @param {Object} data - Completion data (completion_date, deed_number, etc.)
   * @returns {Promise<Object>} Completed transfer
   */
  async completeTitleTransfer(transferId, data) {
    try {
      const response = await apiClient.post(`/credit/title-transfer/${transferId}/complete`, data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error completing title transfer ${transferId}:`, error)
      throw error
    }
  },

  // --- Sold Projects ---

  /**
   * Get sold projects requiring credit processing
   * GET /credit/sold-projects
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of sold projects
   */
  async getSoldProjects(params = {}) {
    try {
      const response = await apiClient.get('/credit/sold-projects', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching sold projects', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Get sold project details
   * GET /credit/sold-projects/:project_id
   * @param {number|string} projectId - Project ID
   * @returns {Promise<Object>} Project details
   */
  async getSoldProjectById(projectId) {
    try {
      const response = await apiClient.get(`/credit/sold-projects/${projectId}`)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error fetching sold project ${projectId}:`, error)
      throw error
    }
  },

  // --- Claim Files ---

  /**
   * Get commission claim files
   * GET /credit/claim-files
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of claim files
   */
  async getClaimFiles(params = {}) {
    try {
      const response = await apiClient.get('/credit/claim-files', { params })
      const { items, total } = extractPaginatedData(response, [])
      return { items, total }
    } catch (error) {
      return handleServiceError(error, 'Error fetching claim files', 'get') || { items: [], total: 0 }
    }
  },

  /**
   * Create claim file
   * POST /credit/claim-files
   * @param {Object} data - Claim data (contract_id, claim_amount, claim_type, notes, etc.)
   * @returns {Promise<Object>} Created claim file
   */
  async createClaimFile(data) {
    try {
      const response = await apiClient.post('/credit/claim-files', data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error('Error creating claim file:', error)
      throw error
    }
  },

  /**
   * Submit claim file to developer
   * POST /credit/claim-files/:claim_id/submit
   * @param {number|string} claimId - Claim ID
   * @returns {Promise<Object>} Submitted claim
   */
  async submitClaim(claimId) {
    try {
      const response = await apiClient.post(`/credit/claim-files/${claimId}/submit`)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error submitting claim ${claimId}:`, error)
      throw error
    }
  },

  /**
   * Approve claim payment
   * POST /credit/claim-files/:claim_id/approve
   * @param {number|string} claimId - Claim ID
   * @param {Object} data - Approval data (approved_amount, payment_date, etc.)
   * @returns {Promise<Object>} Approved claim
   */
  async approveClaim(claimId, data) {
    try {
      const response = await apiClient.post(`/credit/claim-files/${claimId}/approve`, data)
      return response.data?.data || response.data || {}
    } catch (error) {
      logger.error(`Error approving claim ${claimId}:`, error)
      throw error
    }
  }
}

export default creditService

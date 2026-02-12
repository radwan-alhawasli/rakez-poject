import apiClient from '../api/apiClient'
import { handleServiceError } from '../utils/serviceErrorHandler'

/**
 * Exclusive Projects Service
 * Manages exclusive project operations
 */
const exclusiveProjectService = {
  /**
   * Get list of exclusive projects
   * GET /exclusive-projects
   */
  async getExclusiveProjects(params = {}) {
    try {
      const response = await apiClient.get('/exclusive-projects', { params })
      const projects = response.data?.data || response.data || []
      return Array.isArray(projects) ? projects : []
    } catch (error) {
      return handleServiceError(error, 'Fetch exclusive projects', 'get', [])
    }
  },

  /**
   * Get exclusive project details
   * GET /exclusive-projects/:id
   */
  async getExclusiveProjectById(id) {
    try {
      const response = await apiClient.get(`/exclusive-projects/${id}`)
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, `Fetch exclusive project ${id}`, 'get', {})
    }
  },

  /**
   * Create new exclusive project
   * POST /exclusive-projects
   */
  async createExclusiveProject(projectData) {
    try {
      const response = await apiClient.post('/exclusive-projects', projectData)
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, 'Create exclusive project', 'post')
    }
  },

  /**
   * Update exclusive project
   * PUT /exclusive-projects/:id
   */
  async updateExclusiveProject(id, projectData) {
    try {
      const response = await apiClient.put(`/exclusive-projects/${id}`, projectData)
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, `Update exclusive project ${id}`, 'put')
    }
  },

  /**
   * Delete exclusive project
   * DELETE /exclusive-projects/:id
   */
  async deleteExclusiveProject(id) {
    try {
      const response = await apiClient.delete(`/exclusive-projects/${id}`)
      return response.data
    } catch (error) {
      return handleServiceError(error, `Delete exclusive project ${id}`, 'delete')
    }
  },

  /**
   * Approve exclusive project
   * POST /exclusive-projects/:id/approve
   */
  async approveExclusiveProject(id, notes = '') {
    try {
      const response = await apiClient.post(`/exclusive-projects/${id}/approve`, { notes })
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, `Approve exclusive project ${id}`, 'post')
    }
  },

  /**
   * Reject exclusive project
   * POST /exclusive-projects/:id/reject
   */
  async rejectExclusiveProject(id, reason = '') {
    try {
      const response = await apiClient.post(`/exclusive-projects/${id}/reject`, { reason })
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, `Reject exclusive project ${id}`, 'post')
    }
  },

  /**
   * Complete exclusive project contract
   * POST /exclusive-projects/:id/complete-contract
   * @param {number|string} id - Project ID
   * @param {Object} data - Contract data (contract_number, signed_date, etc.)
   * @returns {Promise<Object>} Completed contract data
   */
  async completeExclusiveContract(id, data) {
    try {
      const response = await apiClient.post(`/exclusive-projects/${id}/complete-contract`, data)
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, `Complete exclusive contract for project ${id}`, 'post')
    }
  },

  /**
   * Get exclusive project statistics
   * GET /exclusive-projects/statistics
   */
  async getExclusiveProjectStatistics(params = {}) {
    try {
      const response = await apiClient.get('/exclusive-projects/statistics', { params })
      return response.data?.data || response.data || {}
    } catch (error) {
      return handleServiceError(error, 'Fetch exclusive project statistics', 'get', {})
    }
  }
}

export default exclusiveProjectService

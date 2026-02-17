/**
 * Photography Department Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../utils/testSetup'
import { createApiMock, resetMocks, restoreMocks, createErrorResponse } from '../utils/apiMockFactory'
import apiClient from '../../src/api/apiClient'
import photographyDepartmentService from '../../src/services/photographyDepartmentService'

describe('photographyDepartmentService', () => {
  let mock

  beforeEach(() => {
    mock = createApiMock({}, apiClient)
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetMocks(mock)
    restoreMocks(mock)
  })

  describe('getByContractId', () => {
    it('should fetch photography department data by contract id', async () => {
      const contractId = 1
      const mockData = { contract_id: contractId, photos: [] }
      mock.onGet(`/photography-department/show/${contractId}`).reply(200, mockData)

      const result = await photographyDepartmentService.getByContractId(contractId)

      expect(mock.history.get.length).toBe(1)
      expect(result).toEqual(mockData)
    })

    it('should return data from response.data.data when present', async () => {
      const contractId = 1
      const inner = { contract_id: contractId, photos: [] }
      mock.onGet(`/photography-department/show/${contractId}`).reply(200, { data: inner })

      const result = await photographyDepartmentService.getByContractId(contractId)

      expect(result).toEqual(inner)
    })

    it('should return empty object on 404', async () => {
      mock.onGet('/photography-department/show/999').reply(404, createErrorResponse('Not found', 404))

      const result = await photographyDepartmentService.getByContractId(999)

      expect(result).toEqual({})
    })
  })

  describe('store', () => {
    it('should post photography department data', async () => {
      const contractId = 2
      const data = { photos: ['photo1.jpg'] }
      const mockResponse = { id: 1, contract_id: contractId }
      mock.onPost(`/photography-department/store/${contractId}`).reply(200, mockResponse)

      const result = await photographyDepartmentService.store(contractId, data)

      expect(mock.history.post.length).toBe(1)
      expect(result).toEqual(mockResponse)
    })

    it('should throw on store error', async () => {
      mock.onPost('/photography-department/store/1').reply(500, createErrorResponse('Server error', 500))

      await expect(photographyDepartmentService.store(1, {})).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('should put photography department data', async () => {
      const contractId = 3
      const data = { photos: ['updated.jpg'] }
      const mockResponse = { id: 1 }
      mock.onPut(`/photography-department/update/${contractId}`).reply(200, mockResponse)

      const result = await photographyDepartmentService.update(contractId, data)

      expect(mock.history.put.length).toBe(1)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('approve', () => {
    it('should post approval for contract', async () => {
      const contractId = 4
      const data = { status: 'approved' }
      const mockResponse = { approved: true }
      mock.onPost(`/photography-department/approve/${contractId}`).reply(200, mockResponse)

      const result = await photographyDepartmentService.approve(contractId, data)

      expect(mock.history.post.length).toBe(1)
      expect(mock.history.post[0].data).toBe(JSON.stringify(data))
      expect(result).toEqual(mockResponse)
    })

    it('should throw on approve error', async () => {
      mock.onPost('/photography-department/approve/1').reply(403, createErrorResponse('Forbidden', 403))

      await expect(photographyDepartmentService.approve(1, {})).rejects.toThrow()
    })
  })
})

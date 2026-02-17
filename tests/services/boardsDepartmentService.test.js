/**
 * Boards Department Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../utils/testSetup'
import { createApiMock, resetMocks, restoreMocks, createErrorResponse } from '../utils/apiMockFactory'
import apiClient from '../../src/api/apiClient'
import boardsDepartmentService from '../../src/services/boardsDepartmentService'

describe('boardsDepartmentService', () => {
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
    it('should fetch boards department data by contract id', async () => {
      const contractId = 1
      const mockData = { contract_id: contractId, boards: [] }
      mock.onGet(`/boards-department/show/${contractId}`).reply(200, mockData)

      const result = await boardsDepartmentService.getByContractId(contractId)

      expect(mock.history.get.length).toBe(1)
      expect(result).toEqual(mockData)
    })

    it('should return data from response.data.data when present', async () => {
      const contractId = 1
      const inner = { contract_id: contractId, boards: ['B1'] }
      mock.onGet(`/boards-department/show/${contractId}`).reply(200, { data: inner })

      const result = await boardsDepartmentService.getByContractId(contractId)

      expect(result).toEqual(inner)
    })

    it('should return empty object on 404', async () => {
      mock.onGet('/boards-department/show/999').reply(404, createErrorResponse('Not found', 404))

      const result = await boardsDepartmentService.getByContractId(999)

      expect(result).toEqual({})
    })
  })

  describe('store', () => {
    it('should post boards department data', async () => {
      const contractId = 2
      const data = { boards: ['Board 1'] }
      const mockResponse = { id: 1, contract_id: contractId }
      mock.onPost(`/boards-department/store/${contractId}`).reply(200, mockResponse)

      const result = await boardsDepartmentService.store(contractId, data)

      expect(mock.history.post.length).toBe(1)
      expect(mock.history.post[0].data).toBe(JSON.stringify(data))
      expect(result).toEqual(mockResponse)
    })

    it('should throw on store error', async () => {
      mock.onPost('/boards-department/store/1').reply(500, createErrorResponse('Server error', 500))

      await expect(boardsDepartmentService.store(1, {})).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('should put boards department data', async () => {
      const contractId = 3
      const data = { boards: ['Updated'] }
      const mockResponse = { id: 1, contract_id: contractId }
      mock.onPut(`/boards-department/update/${contractId}`).reply(200, mockResponse)

      const result = await boardsDepartmentService.update(contractId, data)

      expect(mock.history.put.length).toBe(1)
      expect(result).toEqual(mockResponse)
    })

    it('should throw on update error', async () => {
      mock.onPut('/boards-department/update/1').reply(422, createErrorResponse('Validation failed', 422))

      await expect(boardsDepartmentService.update(1, {})).rejects.toThrow()
    })
  })
})

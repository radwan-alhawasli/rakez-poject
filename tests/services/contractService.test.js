import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '../utils/testSetup'
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory'
import apiClient from '../../src/api/apiClient'
import contractService from '../../src/services/contractService'

describe('contractService', () => {
  let mock

  beforeEach(() => {
    mock = createApiMock({}, apiClient)
  })

  afterEach(() => {
    resetMocks(mock)
    restoreMocks(mock)
  })

  it('getAllContracts returns paginated shape', async () => {
    mock.onGet('/admin/contracts/adminIndex').reply(200, { data: [{ id: 1 }], meta: { total: 1 } })
    const result = await contractService.getAllContracts()
    expect(Array.isArray(result.items)).toBe(true)
    expect(result.total).toBe(1)
  })

  it('getContracts returns list', async () => {
    mock.onGet('/contracts/index').reply(200, { data: [{ id: 1 }, { id: 2 }] })
    const result = await contractService.getContracts()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
  })

  it('getContractById returns object', async () => {
    mock.onGet('/contracts/show/1').reply(200, { data: { id: 1, project_name: 'P1' } })
    const result = await contractService.getContractById(1)
    expect(result.id).toBe(1)
  })

  it('createContract posts payload', async () => {
    const payload = { project_name: 'P1' }
    mock.onPost('/contracts/store').reply(201, { data: { id: 1 } })
    const result = await contractService.createContract(payload)
    expect(result).toBeDefined()
  })

  it('getContractUnits returns array', async () => {
    mock.onGet('/contracts/units/show/1').reply(200, { data: [{ id: 1, unit_number: 'A1' }] })
    const result = await contractService.getContractUnits(1)
    expect(Array.isArray(result)).toBe(true)
  })
})

/**
 * Contract Store Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useContractStore } from '../../src/stores/contractStore'
import contractService from '../../src/services/contractService'

const mockAuthStore = { currentUser: { type: 5 } }

vi.mock('../../src/services/contractService', () => ({
  default: {
    getContracts: vi.fn(),
    getAllContracts: vi.fn(),
    getEditorContracts: vi.fn()
  }
}))

vi.mock('../../src/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore
}))

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() }
}))

describe('contractStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockAuthStore.currentUser = { type: 5 }
  })

  it('should have initial state and getters', () => {
    const store = useContractStore()
    expect(store.contracts).toEqual([])
    expect(store.allContracts).toEqual([])
    expect(store.contractCount).toBe(0)
  })

  it('fetchContracts should call getContracts for non-admin user', async () => {
    vi.mocked(contractService.getContracts).mockResolvedValue([{ id: 1 }])

    const store = useContractStore()
    await store.fetchContracts()

    expect(contractService.getContracts).toHaveBeenCalled()
    expect(store.contracts).toEqual([{ id: 1 }])
  })

  it('fetchContracts should call getAllContracts for admin', async () => {
    mockAuthStore.currentUser = { type: 1 }
    vi.mocked(contractService.getAllContracts).mockResolvedValue({ items: [{ id: 1 }], total: 1 })

    const store = useContractStore()
    await store.fetchContracts()

    expect(contractService.getAllContracts).toHaveBeenCalled()
    expect(store.isLoading).toBe(false)
  })
})

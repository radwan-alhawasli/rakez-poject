import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import {
  createApiMock,
  resetMocks,
  restoreMocks,
  createErrorResponse,
} from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import contractService from '../../src/services/contractService';

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('contractService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getAllContracts', () => {
    it('returns paginated shape', async () => {
      mock
        .onGet('/contracts/admin-index')
        .reply(200, { data: [{ id: 1 }], meta: { total: 1 } });
      const result = await contractService.getAllContracts();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.total).toBe(1);
    });

    it('returns empty on error', async () => {
      mock
        .onGet('/contracts/admin-index')
        .reply(500, createErrorResponse('Server error', 500));
      const result = await contractService.getAllContracts();
      expect(result).toEqual({ items: [], total: 0 });
    });
  });

  describe('listContractsPM', () => {
    it('returns array from response.data.data', async () => {
      mock.onGet('/contracts/admin-index').reply(200, { data: { data: [{ id: 1 }] } });
      const result = await contractService.listContractsPM();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('returns empty array on error', async () => {
      mock.onGet('/contracts/admin-index').reply(500, {});
      const result = await contractService.listContractsPM();
      expect(result).toEqual([]);
    });
  });

  describe('getContracts', () => {
    it('returns list from response.data', async () => {
      mock.onGet('/contracts/index').reply(200, { data: [{ id: 1 }, { id: 2 }] });
      const result = await contractService.getContracts();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('returns list from response.data.data.data', async () => {
      mock.onGet('/contracts/index').reply(200, { data: { data: [{ id: 1 }] } });
      const result = await contractService.getContracts();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('returns empty array on error', async () => {
      mock.onGet('/contracts/index').reply(500, {});
      const result = await contractService.getContracts();
      expect(result).toEqual([]);
    });
  });

  describe('getContractById', () => {
    it('returns object', async () => {
      mock.onGet('/contracts/show/1').reply(200, { data: { id: 1, project_name: 'P1' } });
      const result = await contractService.getContractById(1);
      expect(result.id).toBe(1);
    });
  });

  describe('createContract', () => {
    it('posts payload', async () => {
      const payload = { project_name: 'P1' };
      mock.onPost('/contracts/store').reply(201, { data: { id: 1 } });
      const result = await contractService.createContract(payload);
      expect(result).toBeDefined();
    });
  });

  describe('getContractUnits', () => {
    it('returns array', async () => {
      mock.onGet('/contracts/units/show/1').reply(200, { data: [{ id: 1, unit_number: 'A1' }] });
      const result = await contractService.getContractUnits(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateContract', () => {
    it('puts payload', async () => {
      const payload = { project_name: 'P2' };
      mock.onPut('/contracts/update/1').reply(200, { data: { id: 1 } });
      const result = await contractService.updateContract(1, payload);
      expect(mock.history.put.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getEditorContracts', () => {
    it('returns list', async () => {
      mock.onGet('/editor/contracts/index').reply(200, { data: [{ id: 1 }] });
      const result = await contractService.getEditorContracts();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateContractStatus', () => {
    it('patches admin status', async () => {
      mock
        .onPatch('/admin/contracts/adminUpdateStatus/1')
        .reply(200, { data: { status: 'approved' } });
      const result = await contractService.updateContractStatus(1, 'approved');
      expect(mock.history.patch.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('approveContract', () => {
    it('calls updateContractStatus with approved', async () => {
      mock
        .onPatch('/admin/contracts/adminUpdateStatus/1')
        .reply(200, { data: { status: 'approved' } });
      const result = await contractService.approveContract(1);
      expect(mock.history.patch.length).toBe(1);
      expect(mock.history.patch[0].data).toBe(JSON.stringify({ status: 'approved' }));
      expect(result).toBeDefined();
    });
  });

  describe('rejectContract', () => {
    it('calls updateContractStatus with rejected', async () => {
      mock
        .onPatch('/admin/contracts/adminUpdateStatus/1')
        .reply(200, { data: { status: 'rejected' } });
      const result = await contractService.rejectContract(1);
      expect(mock.history.patch.length).toBe(1);
      expect(mock.history.patch[0].data).toBe(JSON.stringify({ status: 'rejected' }));
      expect(result).toBeDefined();
    });
  });

  describe('updateContractStatusProjectManager', () => {
    it('patches PM endpoint', async () => {
      mock.onPatch('/contracts/update-status/1').reply(200, { data: { status: 'approved' } });
      const result = await contractService.updateContractStatusProjectManager(1, 'approved');
      expect(mock.history.patch.length).toBe(1);
      expect(mock.history.patch[0].url).toContain('/contracts/update-status/1');
      expect(result).toBeDefined();
    });

    it('handles error', async () => {
      mock.onPatch('/contracts/update-status/1').reply(403, createErrorResponse('Forbidden', 403));
      await expect(
        contractService.updateContractStatusProjectManager(1, 'approved')
      ).rejects.toThrow();
    });
  });

  describe('getDevelopers', () => {
    it('returns array', async () => {
      mock.onGet('/second-party-data/second-parties').reply(200, { data: [{ id: 1, name: 'D1' }] });
      const result = await contractService.getDevelopers();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

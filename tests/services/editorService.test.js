/**
 * Editor Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import {
  createApiMock,
  resetMocks,
  restoreMocks,
  createSuccessResponse,
  createErrorResponse,
} from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import editorService from '../../src/services/editorService';

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('editorService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getContracts', () => {
    it('should fetch contracts for editing', async () => {
      const mockContracts = [{ id: 1, contract_number: 'CT-001' }];
      mock.onGet('/editor/contracts/index').reply(200, createSuccessResponse(mockContracts));

      const result = await editorService.getContracts();

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should pass query parameters', async () => {
      const params = { status: 'pending' };
      mock.onGet('/editor/contracts/index', { params }).reply(200, createSuccessResponse([]));

      await editorService.getContracts(params);

      expect(mock.history.get.length).toBe(1);
    });
  });

  describe('getContractById', () => {
    it('should fetch contract details for editing', async () => {
      const contractId = 1;
      const mockContract = { id: contractId, contract_number: 'CT-001' };
      mock.onGet(`/editor/contracts/show/${contractId}`).reply(200, { data: mockContract });

      const result = await editorService.getContractById(contractId);

      expect(result).toBeDefined();
      expect(result.id).toBe(contractId);
    });

    it('should handle 404 error', async () => {
      mock.onGet('/editor/contracts/show/999').reply(404, createErrorResponse('Not found', 404));

      await expect(editorService.getContractById(999)).rejects.toThrow();
    });
  });

  describe('getMontage', () => {
    it('should fetch montage details for contract', async () => {
      const contractId = 1;
      const mockMontage = { id: 1, contract_id: contractId, status: 'in_progress' };
      mock
        .onGet(`/editor/montage-department/show/${contractId}`)
        .reply(200, createSuccessResponse(mockMontage));

      const result = await editorService.getMontage(contractId);

      expect(result).toBeDefined();
    });
  });

  describe('createMontage', () => {
    it('should create montage task', async () => {
      const contractId = 100;
      const montageData = { status: 'in_progress', notes: 'Video editing' };
      mock
        .onPost(`/editor/montage-department/store/${contractId}`)
        .reply(201, createSuccessResponse({ id: 1, contract_id: contractId, ...montageData }));

      const result = await editorService.createMontage(contractId, montageData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });

    it('should handle validation errors', async () => {
      mock
        .onPost('/editor/montage-department/store/1')
        .reply(422, createErrorResponse('Validation failed', 422));

      await expect(editorService.createMontage(1, {})).rejects.toThrow();
    });
  });

  describe('updateMontage', () => {
    it('should update montage status', async () => {
      const montageId = 1;
      const updateData = {
        status: 'completed',
        file_url: 'https://storage.example.com/montage/contract-100.mp4',
      };
      mock
        .onPut(`/editor/montage-department/update/${montageId}`)
        .reply(200, createSuccessResponse({ id: montageId, ...updateData }));

      const result = await editorService.updateMontage(montageId, updateData);

      expect(mock.history.put.length).toBe(1);
      expect(result).toBeDefined();
    });

    it('should handle 404 error when updating non-existent montage', async () => {
      mock
        .onPut('/editor/montage-department/update/999')
        .reply(404, createErrorResponse('Not found', 404));

      await expect(editorService.updateMontage(999, {})).rejects.toThrow();
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request', async () => {
      mock.onGet('/editor/contracts/index').reply(400, createErrorResponse('Bad request', 400));

      await expect(editorService.getContracts()).rejects.toThrow();
    });

    it('should handle 401 Unauthorized', async () => {
      mock.onGet('/editor/contracts/show/1').reply(401, createErrorResponse('Unauthorized', 401));

      await expect(editorService.getContractById(1)).rejects.toThrow();
    });

    it('should handle 403 Forbidden', async () => {
      mock
        .onPost('/editor/montage-department/store/1')
        .reply(403, createErrorResponse('Forbidden', 403));

      await expect(editorService.createMontage(1, {})).rejects.toThrow();
    });

    it('should handle 422 Validation Error', async () => {
      mock
        .onPut('/editor/montage-department/update/1')
        .reply(422, createErrorResponse('Validation failed', 422));

      await expect(editorService.updateMontage(1, {})).rejects.toThrow();
    });

    it('should handle 404 Not Found', async () => {
      mock.onGet('/editor/contracts/show/999').reply(404, createErrorResponse('Not found', 404));

      await expect(editorService.getContractById(999)).rejects.toThrow();
    });

    it('should handle 500 Server Error', async () => {
      mock.onGet('/editor/contracts/index').reply(500, createErrorResponse('Server error', 500));

      await expect(editorService.getContracts()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/editor/contracts/index').networkError();

      await expect(editorService.getContracts()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onPost('/editor/montage-department/store/1').timeout();

      await expect(editorService.createMontage(1, {})).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null response data', async () => {
      mock.onGet('/editor/contracts/index').reply(200, { data: null });

      const result = await editorService.getContracts();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty array response', async () => {
      mock.onGet('/editor/contracts/index').reply(200, { data: [] });

      const result = await editorService.getContracts();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle invalid contract ID', async () => {
      mock
        .onGet('/editor/contracts/show/invalid')
        .reply(400, createErrorResponse('Invalid ID', 400));

      await expect(editorService.getContractById('invalid')).rejects.toThrow();
    });

    it('should handle missing required fields in createMontage', async () => {
      mock
        .onPost('/editor/montage-department/store/1')
        .reply(422, createErrorResponse('Missing required fields', 422));

      await expect(editorService.createMontage(1, {})).rejects.toThrow();
    });

    it('should handle empty update data', async () => {
      mock
        .onPut('/editor/montage-department/update/1')
        .reply(200, createSuccessResponse({ id: 1 }));

      const result = await editorService.updateMontage(1, {});
      expect(result).toBeDefined();
    });

    it('should handle zero contract ID', async () => {
      mock.onGet('/editor/contracts/show/0').reply(400, createErrorResponse('Invalid ID', 400));

      await expect(editorService.getContractById(0)).rejects.toThrow();
    });

    it('should handle negative contract ID', async () => {
      mock.onGet('/editor/contracts/show/-1').reply(400, createErrorResponse('Invalid ID', 400));

      await expect(editorService.getContractById(-1)).rejects.toThrow();
    });
  });
});

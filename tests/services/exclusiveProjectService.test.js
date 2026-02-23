/**
 * Exclusive Project Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import exclusiveProjectService from '../../src/services/exclusiveProjectService';

describe('exclusiveProjectService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getExclusiveProjects', () => {
    it('should fetch list of exclusive projects', async () => {
      const mockProjects = [{ id: 1, name: 'Exclusive Project 1' }];
      mock.onGet('/exclusive-projects').reply(200, { data: mockProjects });

      const result = await exclusiveProjectService.getExclusiveProjects();

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });
  });

  describe('getExclusiveProjectById', () => {
    it('should fetch exclusive project by ID', async () => {
      const projectId = 1;
      const mockProject = { id: projectId, name: 'Exclusive Project 1' };
      mock.onGet(`/exclusive-projects/${projectId}`).reply(200, { data: mockProject });

      const result = await exclusiveProjectService.getExclusiveProjectById(projectId);

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(projectId);
    });
  });

  describe('createExclusiveProject', () => {
    it('should create a new exclusive project', async () => {
      const projectData = { name: 'New Exclusive Project', developer_id: 1 };
      mock.onPost('/exclusive-projects').reply(201, { data: { id: 1 } });

      const result = await exclusiveProjectService.createExclusiveProject(projectData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('approveExclusiveProject', () => {
    it('should approve an exclusive project', async () => {
      const projectId = 1;
      const notes = 'Approved';
      mock
        .onPost(`/exclusive-projects/${projectId}/approve`)
        .reply(200, { data: { approved: true } });

      const result = await exclusiveProjectService.approveExclusiveProject(projectId, notes);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('rejectExclusiveProject', () => {
    it('should reject an exclusive project', async () => {
      const projectId = 1;
      const reason = 'Not acceptable';
      mock
        .onPost(`/exclusive-projects/${projectId}/reject`)
        .reply(200, { data: { rejected: true } });

      const result = await exclusiveProjectService.rejectExclusiveProject(projectId, reason);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('completeExclusiveContract', () => {
    it('should complete contract via PUT /exclusive-projects/:id/contract', async () => {
      const projectId = 1;
      const contractData = { contract_number: 'C-001', signed_date: '2026-02-20' };
      mock
        .onPut(`/exclusive-projects/${projectId}/contract`)
        .reply(200, { data: { id: projectId, completed: true } });

      const result = await exclusiveProjectService.completeExclusiveContract(
        projectId,
        contractData
      );

      expect(mock.history.put.length).toBe(1);
      expect(result.completed).toBe(true);
    });
  });
});

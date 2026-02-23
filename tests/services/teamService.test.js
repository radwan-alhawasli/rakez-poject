/**
 * Team Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../utils/testSetup';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';
import * as teamService from '../../src/services/teamService';

describe('teamService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('getTeams', () => {
    it('should fetch teams list', async () => {
      const mockTeams = [{ id: 1, name: 'Team 1' }];
      mock.onGet('/project_management/teams/index').reply(200, { data: mockTeams });

      const result = await teamService.getTeams();

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle search parameter', async () => {
      const search = 'Team';
      mock.onGet('/project_management/teams/index').reply(200, { data: [] });

      await teamService.getTeams(search);

      expect(mock.history.get[0].params).toEqual({ search });
    });
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const teamData = { name: 'New Team', description: 'Team description' };
      mock.onPost('/project_management/teams/store').reply(201, { data: { id: 1 } });

      const result = await teamService.createTeam(teamData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('updateTeam', () => {
    it('should update a team', async () => {
      const teamId = 1;
      const teamData = { name: 'Updated Team' };
      mock
        .onPost(`/project_management/teams/update/${teamId}`)
        .reply(200, { data: { id: teamId } });

      const result = await teamService.updateTeam(teamId, teamData);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getTeamById', () => {
    it('should fetch team by ID', async () => {
      const teamId = 1;
      const mockTeam = { id: teamId, name: 'Team 1' };
      mock.onGet(`/project_management/teams/show/${teamId}`).reply(200, { data: mockTeam });

      const result = await teamService.getTeamById(teamId);

      expect(mock.history.get.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team', async () => {
      const teamId = 1;
      mock
        .onDelete(`/project_management/teams/delete/${teamId}`)
        .reply(200, { data: { deleted: true } });

      await teamService.deleteTeam(teamId);

      expect(mock.history.delete.length).toBe(1);
    });
  });

  describe('addTeamsToContract', () => {
    it('should add teams to a contract', async () => {
      const contractId = 1;
      const teamIds = [1, 2];
      // Mock the first endpoint that the service tries (project_management)
      mock
        .onPost(`/project_management/teams/add/${contractId}`)
        .reply(200, { data: { added: true } });

      const result = await teamService.addTeamsToContract(contractId, teamIds);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request for getTeams', async () => {
      mock.onGet('/project_management/teams/index').reply(400, { error: 'Bad request' });

      await expect(teamService.getTeams()).rejects.toThrow();
    });

    it('should handle 401 Unauthorized for getTeamById', async () => {
      mock.onGet('/project_management/teams/show/1').reply(401, { error: 'Unauthorized' });

      await expect(teamService.getTeamById(1)).rejects.toThrow();
    });

    it('should handle 403 Forbidden for createTeam', async () => {
      mock.onPost('/project_management/teams/store').reply(403, { error: 'Forbidden' });

      await expect(teamService.createTeam({})).rejects.toThrow();
    });

    it('should handle 404 Not Found for updateTeam', async () => {
      mock.onPost('/project_management/teams/update/999').reply(404, { error: 'Not found' });

      await expect(teamService.updateTeam(999, {})).rejects.toThrow();
    });

    it('should handle 422 Validation Error for createTeam', async () => {
      mock
        .onPost('/project_management/teams/store')
        .reply(422, { error: 'Validation failed', errors: { name: ['Required'] } });

      await expect(teamService.createTeam({})).rejects.toThrow();
    });

    it('should handle 500 Server Error for deleteTeam', async () => {
      mock.onDelete('/project_management/teams/delete/1').reply(500, { error: 'Server error' });

      await expect(teamService.deleteTeam(1)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/project_management/teams/index').networkError();

      await expect(teamService.getTeams()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/project_management/teams/show/1').timeout();

      await expect(teamService.getTeamById(1)).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null response data', async () => {
      mock.onGet('/project_management/teams/show/1').reply(200, { data: null });

      const result = await teamService.getTeamById(1);
      expect(result).toBeDefined();
    });

    it('should handle empty array response for getTeams', async () => {
      mock.onGet('/project_management/teams/index').reply(200, { data: [] });

      const result = await teamService.getTeams();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle missing data property', async () => {
      mock.onGet('/project_management/teams/show/1').reply(200, {});

      const result = await teamService.getTeamById(1);
      expect(result).toBeDefined();
    });

    it('should handle invalid team ID', async () => {
      mock.onGet('/project_management/teams/show/invalid').reply(400, { error: 'Invalid ID' });

      await expect(teamService.getTeamById('invalid')).rejects.toThrow();
    });

    it('should handle empty team data object', async () => {
      mock
        .onPost('/project_management/teams/store')
        .reply(422, { error: 'Missing required fields' });

      await expect(teamService.createTeam({})).rejects.toThrow();
    });

    it('should handle empty teamIds array', async () => {
      mock.onPost('/project_teams/teams/add/1').reply(400, { error: 'Team IDs required' });

      await expect(teamService.addTeamsToContract(1, [])).rejects.toThrow();
    });

    it('should handle zero team ID', async () => {
      mock.onGet('/project_management/teams/show/0').reply(400, { error: 'Invalid ID' });

      await expect(teamService.getTeamById(0)).rejects.toThrow();
    });
  });
});

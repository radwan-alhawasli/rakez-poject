/**
 * AI Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createApiMock, resetMocks, restoreMocks } from '../utils/apiMockFactory';
import apiClient from '../../src/api/apiClient';

// Mock dependencies
vi.mock('../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../src/utils/csrf', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    setupCsrfInterceptor: vi.fn(),
    initCsrf: vi.fn(),
  };
});

vi.mock('../../src/utils/tokenRefresh', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    setupTokenRefreshInterceptor: vi.fn(),
    initTokenRefresh: vi.fn(),
  };
});

vi.mock('../../src/utils/secureStorage', () => ({
  default: {
    getToken: vi.fn(() => null),
    updateLastActivity: vi.fn(),
    isSessionExpired: vi.fn(() => false),
    clearSession: vi.fn(),
  },
}));

import aiService from '../../src/services/aiService';

describe('aiService', () => {
  let mock;

  beforeEach(() => {
    mock = createApiMock({}, apiClient);
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetMocks(mock);
    restoreMocks(mock);
  });

  describe('askQuestion', () => {
    it('should send a question to AI', async () => {
      const payload = { question: 'What is the project status?', section: 'general' };
      const mockResponse = { answer: 'The project is on track', session_id: '123' };
      mock.onPost('/ai/ask').reply(200, { data: mockResponse });

      const result = await aiService.askQuestion(payload);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('chat', () => {
    it('should send a chat message', async () => {
      const payload = { message: 'Hello', session_id: '123', section: 'general' };
      const mockResponse = { response: 'Hello! How can I help?', session_id: '123' };
      mock.onPost('/ai/chat').reply(200, { data: mockResponse });

      const result = await aiService.chat(payload);

      expect(mock.history.post.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getConversations', () => {
    it('should fetch conversation history', async () => {
      const mockConversations = [{ id: 1, session_id: '123', created_at: '2026-01-01' }];
      mock.onGet('/ai/v2/conversations').reply(200, { data: mockConversations });

      const result = await aiService.getConversations();

      expect(mock.history.get.length).toBe(1);
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(1);
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation', async () => {
      const sessionId = '123';
      mock.onDelete(`/ai/v2/conversations/${sessionId}`).reply(200, { data: { deleted: true } });

      const result = await aiService.deleteConversation(sessionId);

      expect(mock.history.delete.length).toBe(1);
      expect(result).toBeDefined();
    });
  });

  describe('getAvailableSections', () => {
    it('should fetch available AI sections', async () => {
      const mockSections = [
        { key: 'general', name: 'General' },
        { key: 'contracts', name: 'Contracts' },
      ];
      mock.onGet('/ai/sections').reply(200, { data: mockSections });

      const result = await aiService.getAvailableSections();

      expect(mock.history.get.length).toBe(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // Error scenarios
  describe('Error Handling', () => {
    it('should handle 400 Bad Request for askQuestion', async () => {
      mock.onPost('/ai/ask').reply(400, { error: 'Bad request' });

      await expect(aiService.askQuestion({})).rejects.toThrow();
    });

    it('should handle 401 Unauthorized for chat', async () => {
      mock.onPost('/ai/chat').reply(401, { error: 'Unauthorized' });

      await expect(aiService.chat({})).rejects.toThrow();
    });

    it('should handle 403 Forbidden for getConversations', async () => {
      mock.onGet('/ai/v2/conversations').reply(403, { error: 'Forbidden' });

      const result = await aiService.getConversations();
      expect(result).toBeDefined();
    });

    it('should handle 404 Not Found for deleteConversation', async () => {
      mock.onDelete('/ai/v2/conversations/invalid').reply(404, { error: 'Not found' });

      await expect(aiService.deleteConversation('invalid')).rejects.toThrow();
    });

    it('should handle 422 Validation Error for askQuestion', async () => {
      mock
        .onPost('/ai/ask')
        .reply(422, { error: 'Validation failed', errors: { question: ['Required'] } });

      await expect(aiService.askQuestion({})).rejects.toThrow();
    });

    it('should handle 500 Server Error for getAvailableSections', async () => {
      mock.onGet('/ai/sections').reply(500, { error: 'Server error' });

      await expect(aiService.getAvailableSections()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onPost('/ai/ask').networkError();

      await expect(aiService.askQuestion({ question: 'test' })).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onPost('/ai/chat').timeout();

      await expect(aiService.chat({ message: 'test' })).rejects.toThrow();
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle null response data', async () => {
      mock.onGet('/ai/sections').reply(200, { data: null });

      const result = await aiService.getAvailableSections();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty array response for getConversations', async () => {
      mock.onGet('/ai/v2/conversations').reply(200, { data: [] });

      const result = await aiService.getConversations();
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(0);
    });

    it('should handle missing data property', async () => {
      mock.onPost('/ai/ask').reply(200, {});

      const result = await aiService.askQuestion({ question: 'test' });
      expect(result).toBeDefined();
    });

    it('should handle empty question', async () => {
      mock.onPost('/ai/ask').reply(422, { error: 'Question required' });

      await expect(aiService.askQuestion({ question: '' })).rejects.toThrow();
    });

    it('should handle invalid session ID', async () => {
      mock.onDelete('/ai/conversations/').reply(400, { error: 'Invalid session ID' });

      await expect(aiService.deleteConversation('')).rejects.toThrow();
    });
  });

  // Knowledge Management (Postman: /ai/assistant/knowledge)
  describe('Knowledge Management', () => {
    it('assistantChat posts to /ai/assistant/chat', async () => {
      mock.onPost('/ai/assistant/chat').reply(200, { data: { answer: 'مرحبا' } });
      const result = await aiService.assistantChat({ message: 'كيف أنشئ حجز؟' });
      expect(mock.history.post[0].url).toBe('/ai/assistant/chat');
      const body = JSON.parse(mock.history.post[0].data);
      expect(body).toEqual({ message: 'كيف أنشئ حجز؟', language: 'ar' });
      expect(result.answer).toBe('مرحبا');
    });

    it('getKnowledge fetches from /ai/assistant/knowledge', async () => {
      mock
        .onGet('/ai/assistant/knowledge')
        .reply(200, { data: [{ id: 1, title: 'K1' }], meta: { total: 1 } });
      const result = await aiService.getKnowledge({ module: 'sales' });
      expect(mock.history.get[0].url).toContain('/ai/assistant/knowledge');
      expect(result).toHaveProperty('items');
    });

    it('createKnowledge posts to /ai/assistant/knowledge', async () => {
      mock.onPost('/ai/assistant/knowledge').reply(201, { data: { id: 1 } });
      const result = await aiService.createKnowledge({ module: 'sales', title: 'test' });
      expect(mock.history.post[0].url).toBe('/ai/assistant/knowledge');
      expect(result.id).toBe(1);
    });

    it('updateKnowledge puts to /ai/assistant/knowledge/:id', async () => {
      mock.onPut('/ai/assistant/knowledge/5').reply(200, { data: { id: 5, updated: true } });
      const result = await aiService.updateKnowledge(5, { title: 'updated' });
      expect(mock.history.put[0].url).toBe('/ai/assistant/knowledge/5');
      expect(result.updated).toBe(true);
    });

    it('deleteKnowledge deletes /ai/assistant/knowledge/:id', async () => {
      mock.onDelete('/ai/assistant/knowledge/5').reply(200, { data: { deleted: true } });
      const result = await aiService.deleteKnowledge(5);
      expect(mock.history.delete[0].url).toBe('/ai/assistant/knowledge/5');
      expect(result.deleted).toBe(true);
    });
  });
});

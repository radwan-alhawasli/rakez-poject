/**
 * Tests for useChatbot streaming behavior: message append, abort, fallback, status labels
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn(), log: vi.fn(), info: vi.fn() },
}));

vi.mock('../../src/utils/safeHtml', () => ({
  sanitizeMarkdown: vi.fn(text => `<p>${text}</p>`),
}));

vi.mock('../../src/utils/routeMapper', () => ({
  backendRouteToVuePath: vi.fn(r => r),
}));

const mockChatStream = vi.fn();
const mockChat = vi.fn();
const mockExplainAccess = vi.fn();

vi.mock('../../src/services/aiAssistantV2', () => ({
  chatStream: (...args) => mockChatStream(...args),
  chat: (...args) => mockChat(...args),
  explainAccess: (...args) => mockExplainAccess(...args),
  AI_V2_MESSAGES: {
    FORBIDDEN: 'ممنوع',
    UNAVAILABLE: 'غير متاح',
  },
}));

import { useChatbot, STATUS_LABELS } from '../../src/composables/useChatbot';

describe('useChatbot streaming', () => {
  let chatbot;
  const routeRef = ref({ path: '/dashboard', params: {} });

  beforeEach(() => {
    vi.clearAllMocks();
    chatbot = useChatbot(routeRef);
  });

  afterEach(() => {
    chatbot.dispose();
  });

  it('exposes streaming state refs', () => {
    expect(chatbot.isStreaming.value).toBe(false);
    expect(chatbot.streamingHtml.value).toBe('');
    expect(chatbot.statusLabel.value).toBe('');
  });

  it('STATUS_LABELS has Arabic labels for known stages', () => {
    expect(STATUS_LABELS.checking_permissions).toBeTruthy();
    expect(STATUS_LABELS.loading_catalog).toBeTruthy();
    expect(STATUS_LABELS.running_tool).toBeTruthy();
    expect(STATUS_LABELS.drafting_answer).toBeTruthy();
  });

  it('sends message via streaming and appends final message', async () => {
    mockChatStream.mockImplementation(async (msg, sid, ctx, callbacks) => {
      callbacks.onStatus({ stage: 'drafting_answer' });
      callbacks.onDelta({ text: 'Hello' });
      callbacks.onDelta({ text: ' world' });
      callbacks.onMeta({ session_id: 'sess-1', sources: [], links: [] });
      callbacks.onDone();
    });

    chatbot.inputText.value = 'Test message';
    await chatbot.sendMessage();
    await nextTick();

    expect(chatbot.messages.value).toHaveLength(2);
    expect(chatbot.messages.value[0].role).toBe('user');
    expect(chatbot.messages.value[0].content).toBe('Test message');
    expect(chatbot.messages.value[1].role).toBe('assistant');
    expect(chatbot.messages.value[1].content).toBe('Hello world');
    expect(chatbot.isStreaming.value).toBe(false);
    expect(chatbot.isTyping.value).toBe(false);
  });

  it('falls back to non-streaming when chatStream throws non-HTTP error', async () => {
    mockChatStream.mockRejectedValue(new Error('Network error'));
    mockChat.mockResolvedValue({
      data: {
        answer_markdown: 'Fallback answer',
        session_id: 's1',
        sources: [],
        links: [],
        follow_up_questions: [],
        access_notes: {},
      },
    });

    chatbot.inputText.value = 'Test fallback';
    await chatbot.sendMessage();
    await nextTick();

    expect(chatbot.messages.value).toHaveLength(2);
    expect(chatbot.messages.value[1].content).toBe('Fallback answer');
  });

  it('handles 403 during streaming gracefully', async () => {
    const err = new Error('Forbidden');
    err.status = 403;
    mockChatStream.mockRejectedValue(err);

    chatbot.inputText.value = 'restricted';
    await chatbot.sendMessage();
    await nextTick();

    expect(chatbot.messages.value).toHaveLength(2);
    const assistantMsg = chatbot.messages.value[1];
    expect(assistantMsg.content).toBe('ممنوع');
    expect(assistantMsg.isError).toBe(true);
  });

  it('handles SSE error event from backend', async () => {
    mockChatStream.mockImplementation(async (msg, sid, ctx, callbacks) => {
      callbacks.onError({ message: 'Service unavailable', code: 503 });
      callbacks.onDone();
    });

    chatbot.inputText.value = 'test error event';
    await chatbot.sendMessage();
    await nextTick();

    const assistantMsg = chatbot.messages.value[1];
    expect(assistantMsg.content).toBe('غير متاح');
    expect(assistantMsg.isError).toBe(true);
  });

  it('keeps partial text on abort', async () => {
    mockChatStream.mockImplementation(async (msg, sid, ctx, callbacks) => {
      callbacks.onDelta({ text: 'Partial content' });
      const err = new DOMException('Aborted', 'AbortError');
      throw err;
    });

    chatbot.inputText.value = 'will abort';
    await chatbot.sendMessage();
    await nextTick();

    const assistantMsg = chatbot.messages.value[1];
    expect(assistantMsg.content).toBe('Partial content');
    expect(chatbot.isStreaming.value).toBe(false);
  });

  it('prevents sending while streaming is active', async () => {
    let resolveStream;
    mockChatStream.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveStream = resolve;
        })
    );

    chatbot.inputText.value = 'first';
    const sendPromise = chatbot.sendMessage();

    chatbot.inputText.value = 'second';
    await chatbot.sendMessage();

    expect(chatbot.messages.value.filter(m => m.role === 'user')).toHaveLength(1);
    resolveStream();
    await sendPromise;
  });

  it('retryLastMessage re-sends on error messages', async () => {
    mockChatStream.mockImplementation(async (msg, sid, ctx, callbacks) => {
      callbacks.onDelta({ text: 'Success' });
      callbacks.onDone();
    });

    chatbot.messages.value = [
      { role: 'user', content: 'test retry' },
      { role: 'assistant', content: 'Error!', isError: true },
    ];

    chatbot.retryLastMessage();
    await nextTick();

    expect(chatbot.inputText.value).toBe('');
  });

  it('copyMessageContent calls clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await chatbot.copyMessageContent('test content');
    expect(writeText).toHaveBeenCalledWith('test content');
  });
});

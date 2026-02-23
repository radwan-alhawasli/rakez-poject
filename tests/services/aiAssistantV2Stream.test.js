/**
 * Tests for AI Assistant v2 streaming: SSE parser and chatStream()
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn(), log: vi.fn(), info: vi.fn() },
}));
vi.mock('../../src/utils/csrf', () => ({ setupCsrfInterceptor: vi.fn(), initCsrf: vi.fn() }));
vi.mock('../../src/utils/tokenRefresh', () => ({
  setupTokenRefreshInterceptor: vi.fn(),
  initTokenRefresh: vi.fn(),
}));
vi.mock('../../src/utils/secureStorage', () => ({
  default: {
    getToken: vi.fn(() => 'test-token'),
    updateLastActivity: vi.fn(),
    isSessionExpired: vi.fn(() => false),
    clearSession: vi.fn(),
  },
}));
vi.mock('../../src/config/appConfig', () => ({
  default: { apiBaseUrl: 'http://localhost:8000/api' },
}));

import { parseSSE, chatStream } from '../../src/services/aiAssistantV2';

/* eslint-disable no-undef */

describe('parseSSE', () => {
  it('parses a single complete event', () => {
    const buffer = 'event: delta\ndata: {"text":"hello"}\n\n';
    const { events, remainder } = parseSSE(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('delta');
    expect(events[0].data).toBe('{"text":"hello"}');
    expect(remainder).toBe('');
  });

  it('parses multiple events in one buffer', () => {
    const buffer =
      'event: status\ndata: {"stage":"checking_permissions"}\n\n' +
      'event: delta\ndata: {"text":"Hi"}\n\n' +
      'event: done\ndata: {}\n\n';
    const { events, remainder } = parseSSE(buffer);
    expect(events).toHaveLength(3);
    expect(events[0].event).toBe('status');
    expect(events[1].event).toBe('delta');
    expect(events[2].event).toBe('done');
    expect(remainder).toBe('');
  });

  it('keeps incomplete event as remainder', () => {
    const buffer = 'event: delta\ndata: {"text":"hel';
    const { events, remainder } = parseSSE(buffer);
    expect(events).toHaveLength(0);
    expect(remainder).toBe('event: delta\ndata: {"text":"hel');
  });

  it('handles mixed complete and incomplete events', () => {
    const buffer =
      'event: status\ndata: {"stage":"loading"}\n\n' + 'event: delta\ndata: {"text":"pa';
    const { events, remainder } = parseSSE(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('status');
    expect(remainder).toBe('event: delta\ndata: {"text":"pa');
  });

  it('defaults event type to "message" if no event line', () => {
    const buffer = 'data: {"text":"hi"}\n\n';
    const { events } = parseSSE(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('message');
  });

  it('skips empty blocks', () => {
    const buffer = '\n\nevent: done\ndata: {}\n\n';
    const { events } = parseSSE(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('done');
  });

  it('handles multi-line data fields', () => {
    const buffer = 'event: delta\ndata: line1\ndata: line2\n\n';
    const { events } = parseSSE(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].data).toBe('line1\nline2');
  });
});

describe('chatStream', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function makeSSEStream(chunks) {
    const encoder = new TextEncoder();
    let idx = 0;
    return new ReadableStream({
      pull(controller) {
        if (idx < chunks.length) {
          controller.enqueue(encoder.encode(chunks[idx]));
          idx++;
        } else {
          controller.close();
        }
      },
    });
  }

  it('calls onStatus and onDelta callbacks during streaming', async () => {
    const chunks = [
      'event: status\ndata: {"stage":"checking_permissions"}\n\n',
      'event: delta\ndata: {"text":"Hello"}\n\nevent: delta\ndata: {"text":" world"}\n\n',
      'event: done\ndata: {}\n\n',
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: makeSSEStream(chunks),
    });

    const onStatus = vi.fn();
    const onDelta = vi.fn();
    const onDone = vi.fn();

    await chatStream('test', null, {}, { onStatus, onDelta, onDone });

    expect(onStatus).toHaveBeenCalledWith({ stage: 'checking_permissions' });
    expect(onDelta).toHaveBeenCalledTimes(2);
    expect(onDelta).toHaveBeenCalledWith({ text: 'Hello' });
    expect(onDelta).toHaveBeenCalledWith({ text: ' world' });
    expect(onDone).toHaveBeenCalled();
  });

  it('calls onMeta with session and sources', async () => {
    const meta = { session_id: 'abc', sources: [{ title: 'Doc1' }], links: [] };
    const chunks = [`event: meta\ndata: ${JSON.stringify(meta)}\n\n`, 'event: done\ndata: {}\n\n'];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: makeSSEStream(chunks),
    });

    const onMeta = vi.fn();
    await chatStream('test', null, {}, { onMeta });

    expect(onMeta).toHaveBeenCalledWith(meta);
  });

  it('calls onError for SSE error events', async () => {
    const chunks = [
      'event: error\ndata: {"message":"forbidden","code":403}\n\n',
      'event: done\ndata: {}\n\n',
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: makeSSEStream(chunks),
    });

    const onError = vi.fn();
    await chatStream('test', null, {}, { onError });

    expect(onError).toHaveBeenCalledWith({ message: 'forbidden', code: 403 });
  });

  it('throws on non-OK HTTP response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    });

    await expect(chatStream('test', null, {}, {})).rejects.toThrow('Forbidden');
  });

  it('supports abort via AbortController', async () => {
    const controller = new AbortController();
    const encoder = new TextEncoder();

    let pullCount = 0;
    const stream = new ReadableStream({
      pull(ctrl) {
        pullCount++;
        if (pullCount === 1) {
          ctrl.enqueue(encoder.encode('event: delta\ndata: {"text":"chunk1"}\n\n'));
        } else {
          controller.abort();
          ctrl.error(new DOMException('Aborted', 'AbortError'));
        }
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: stream,
    });

    const onDelta = vi.fn();
    await expect(chatStream('test', null, {}, { onDelta }, controller.signal)).rejects.toThrow();

    expect(onDelta).toHaveBeenCalledWith({ text: 'chunk1' });
  });

  it('sends correct headers including Bearer token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: makeSSEStream(['event: done\ndata: {}\n\n']),
    });

    await chatStream('hello', 'sess-1', { route: '/sales' }, {});

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/ai/v2/chat/stream',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        }),
      })
    );

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.message).toBe('hello');
    expect(body.session_id).toBe('sess-1');
    expect(body.page_context).toEqual({ route: '/sales' });
  });
});

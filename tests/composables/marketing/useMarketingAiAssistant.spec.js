import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/services/aiService', () => ({
  default: {
    getConversations: vi.fn(),
    getAvailableSections: vi.fn(),
    chatStream: vi.fn(),
    deleteConversation: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  default: { error: vi.fn(), debug: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('@/composables/useToast', () => {
  const toast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
  return { toast, useToast: () => ({ toast, toasts: { value: [] }, removeToast: vi.fn() }) };
});

import aiService from '@/services/aiService';
import { toast } from '@/composables/useToast';
import { useMarketingAiAssistant } from '@/composables/marketing/useMarketingAiAssistant';

async function mountAi() {
  aiService.getConversations.mockResolvedValue([{ id: 's1', session_id: 's1' }]);
  aiService.getAvailableSections.mockResolvedValue([
    { key: 'general', label: 'General', allowed_context_params: [] },
  ]);

  const Comp = defineComponent({
    setup() {
      return useMarketingAiAssistant();
    },
    render: () => h('div'),
  });
  const wrapper = mount(Comp);
  await vi.waitFor(() => {
    expect(wrapper.vm.isLoadingConversations).toBe(false);
  });
  return wrapper;
}

describe('useMarketingAiAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads conversations and sections on mount', async () => {
    const wrapper = await mountAi();
    expect(wrapper.vm.conversations.length).toBe(1);
    expect(wrapper.vm.aiSections.length).toBe(1);
    expect(wrapper.vm.aiSelectedSectionKey).toBe('general');
  });

  it('startNewChat clears state', async () => {
    const wrapper = await mountAi();
    wrapper.vm.chatMessages.push({ role: 'user', content: 'x' });
    wrapper.vm.startNewChat();
    expect(wrapper.vm.chatMessages).toEqual([]);
    expect(wrapper.vm.currentSessionId).toBeNull();
  });

  it('sendPrompt sets query and triggers send', async () => {
    aiService.chatStream.mockImplementation(async (_payload, onChunk) => {
      onChunk('hi');
      return { session_id: 'new-session' };
    });
    const wrapper = await mountAi();
    wrapper.vm.sendPrompt('hello');
    await flushPromises();
    await vi.waitFor(() => expect(wrapper.vm.isAiTyping).toBe(false));
    expect(aiService.chatStream).toHaveBeenCalled();
  });

  it('deleteChat calls API and updates list', async () => {
    aiService.deleteConversation.mockResolvedValue({});
    const wrapper = await mountAi();
    await wrapper.vm.deleteChat('s1');
    expect(aiService.deleteConversation).toHaveBeenCalledWith('s1');
    expect(toast.success).toHaveBeenCalled();
  });

  it('deleteChat shows toast on error', async () => {
    aiService.deleteConversation.mockRejectedValue(new Error('x'));
    const wrapper = await mountAi();
    await wrapper.vm.deleteChat('s1');
    expect(toast.error).toHaveBeenCalled();
  });

  it('getConversationId reads id fields', async () => {
    const wrapper = await mountAi();
    expect(wrapper.vm.getConversationId({ id: 1 })).toBe(1);
    expect(wrapper.vm.getConversationId({ session_id: 'z' })).toBe('z');
  });
});

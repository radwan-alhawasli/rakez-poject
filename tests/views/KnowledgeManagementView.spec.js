/**
 * KnowledgeManagementView Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import KnowledgeManagementView from '@/modules/knowledge/views/KnowledgeManagementView.vue';

vi.mock('../../src/services/aiService', () => ({
  default: {
    getKnowledge: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    createKnowledge: vi.fn().mockResolvedValue({}),
    updateKnowledge: vi.fn().mockResolvedValue({}),
    deleteKnowledge: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe('KnowledgeManagementView', () => {
  const createWrapper = async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/knowledge', component: KnowledgeManagementView }],
    });
    await router.push('/knowledge');
    const pinia = createPinia();
    return mount(KnowledgeManagementView, {
      global: {
        plugins: [router, pinia],
        stubs: { teleport: true },
      },
    });
  };

  it('renders without throwing', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the knowledge management title', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.knowledge-title').exists()).toBe(true);
    expect(wrapper.find('.knowledge-title').text()).toBe('إدارة قاعدة المعرفة');
  });

  it('renders knowledge view container', async () => {
    const wrapper = await createWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.knowledge-view').exists()).toBe(true);
    expect(wrapper.find('.knowledge-header').exists()).toBe(true);
  });
});

<template>
  <div class="agents-view">
    <div class="agents-layout">
      <div class="main-content">
        <!-- Header -->
        <div class="section-header">
          <div class="header-content">
            <h2 class="section-title page-title">الوكلاء</h2>
            <p class="section-subtitle page-subtitle">إعداد ومتابعة وكلاء المحادثة.</p>
          </div>
          <button class="add-btn" @click="openAddModal">
            <svg
              class="btn-icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>وكيل جديد</span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs-wrap">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab content -->
        <div class="tab-panels">
          <!-- General: agents list -->
          <div v-show="activeTab === 'general'" class="tab-panel">
            <div class="data-table-container">
              <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل البيانات...</p>
              </div>
              <div v-else-if="agents.length === 0" class="empty-state">
                <p>لا يوجد وكلاء. أضف وكيلاً جديداً للبدء.</p>
              </div>
              <div v-else class="table-responsive">
              <table class="data-table table-mobile-stacked">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الحالة</th>
                    <th>آخر تحديث</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="agent in agents" :key="agent.id">
                    <td data-label="الاسم">
                      <div class="agent-name-cell">{{ agent.name }}</div>
                      <div v-if="agent.description" class="agent-desc-cell">
                        {{ agent.description }}
                      </div>
                    </td>
                    <td data-label="الحالة">
                      <span class="status-badge active">نشط</span>
                    </td>
                    <td data-label="آخر تحديث" class="date-cell">{{ formatDate(agent.updatedAt || agent.createdAt) }}</td>
                    <td data-label="الإجراءات">
                      <div class="actions">
                        <button class="action-btn edit" @click="editAgent(agent)" title="تعديل">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path
                              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                            ></path>
                            <path
                              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                            ></path>
                          </svg>
                        </button>
                        <button class="action-btn delete" @click="confirmDelete(agent)" title="حذف">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path
                              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                            ></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </div>
          <div v-show="activeTab === 'action_buttons'" class="tab-panel">
            <p class="tab-placeholder">
              إعدادات أزرار الإجراءات تُدار من خلال نموذج تعديل كل وكيل.
            </p>
          </div>
          <div v-show="activeTab === 'messages'" class="tab-panel">
            <p class="tab-placeholder">الرسائل والإعدادات النصية للوكلاء.</p>
          </div>
          <div v-show="activeTab === 'permissions'" class="tab-panel">
            <p class="tab-placeholder">الصلاحيات والوصول للوكلاء.</p>
          </div>
        </div>
      </div>

      <!-- Preview panel -->
      <aside v-if="previewAgent" class="preview-panel">
        <h3 class="preview-title">معاينة</h3>
        <div class="preview-chat">
          <div class="preview-bubble bot">مرحباً، كيف يمكنني مساعدتك؟</div>
          <div class="preview-bubble user">أريد الاستفسار عن وحدة.</div>
          <div class="preview-actions">
            <button v-if="previewAgent.humanHelpEnabled" type="button" class="preview-btn primary">
              {{ previewAgent.humanHelpLabel || 'Human Help' }}
            </button>
            <button v-if="previewAgent.finishEnabled" type="button" class="preview-btn secondary">
              {{ previewAgent.finishLabel || 'Finish Conversation' }}
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Agent Modal -->
    <AgentModal
      v-if="showModal"
      :edit-agent="selectedAgent"
      :is-loading="isSaving"
      @close="closeModal"
      @submit="handleSaveAgent"
    />

    <!-- Confirm Delete -->
    <ConfirmModal
      v-if="showConfirmModal"
      title="تأكيد الحذف"
      :message="confirmMessage"
      type="danger"
      confirm-text="حذف"
      @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import agentService from '@/services/agentService';
import AgentModal from '@/components/AgentModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export default {
  name: 'AgentsView',
  components: {
    AgentModal,
    ConfirmModal,
  },
  setup() {
    const agents = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    const selectedAgent = ref(null);
    const isSaving = ref(false);
    const showConfirmModal = ref(false);
    const agentToDelete = ref(null);
    const activeTab = ref('general');

    const tabs = [
      { id: 'general', label: 'عام' },
      { id: 'action_buttons', label: 'أزرار الإجراءات' },
      { id: 'messages', label: 'الرسائل' },
      { id: 'permissions', label: 'الصلاحيات' },
    ];

    const previewAgent = computed(
      () => selectedAgent.value || (agents.value.length ? agents.value[0] : null)
    );

    const confirmMessage = computed(() =>
      agentToDelete.value
        ? `هل أنت متأكد من حذف الوكيل "${agentToDelete.value.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
        : ''
    );

    async function fetchAgents() {
      loading.value = true;
      try {
        agents.value = await agentService.getAgents();
      } catch (_e) {
        toast.error('فشل تحميل قائمة الوكلاء');
        agents.value = [];
      } finally {
        loading.value = false;
      }
    }

    function openAddModal() {
      selectedAgent.value = null;
      showModal.value = true;
    }

    function editAgent(agent) {
      selectedAgent.value = { ...agent };
      showModal.value = true;
    }

    function closeModal() {
      showModal.value = false;
      selectedAgent.value = null;
    }

    async function handleSaveAgent(payload) {
      isSaving.value = true;
      try {
        if (selectedAgent.value?.id) {
          await agentService.updateAgent(selectedAgent.value.id, payload);
          toast.success('تم تحديث الوكيل بنجاح');
        } else {
          await agentService.createAgent(payload);
          toast.success('تم إضافة الوكيل بنجاح');
        }
        closeModal();
        await fetchAgents();
      } catch (_e) {
        toast.error('فشل حفظ الوكيل');
      } finally {
        isSaving.value = false;
      }
    }

    function confirmDelete(agent) {
      agentToDelete.value = agent;
      showConfirmModal.value = true;
    }

    async function handleConfirmDelete() {
      if (!agentToDelete.value) return;
      try {
        const deleted = await agentService.deleteAgent(agentToDelete.value.id);
        if (deleted) {
          toast.success('تم حذف الوكيل');
          await fetchAgents();
        } else {
          toast.error('فشل حذف الوكيل');
        }
      } catch (_e) {
        toast.error('فشل حذف الوكيل');
      }
      showConfirmModal.value = false;
      agentToDelete.value = null;
    }

    const { formatDate } = useFormatters();

    onMounted(() => {
      fetchAgents();
    });

    return {
      agents,
      loading,
      showModal,
      selectedAgent,
      isSaving,
      showConfirmModal,
      confirmMessage,
      activeTab,
      tabs,
      previewAgent,
      openAddModal,
      editAgent,
      closeModal,
      handleSaveAgent,
      confirmDelete,
      handleConfirmDelete,
      formatDate,
    };
  },
};
</script>

<style scoped src="./styles/AgentsView.scoped.s1.css"></style>
<style scoped src="./styles/AgentsView.scoped.s2.css"></style>

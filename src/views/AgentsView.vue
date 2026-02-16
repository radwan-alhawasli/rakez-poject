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
            <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
              <table v-else class="data-table">
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
                    <td>
                      <div class="agent-name-cell">{{ agent.name }}</div>
                      <div v-if="agent.description" class="agent-desc-cell">{{ agent.description }}</div>
                    </td>
                    <td>
                      <span class="status-badge active">نشط</span>
                    </td>
                    <td class="date-cell">{{ formatDate(agent.updatedAt || agent.createdAt) }}</td>
                    <td>
                      <div class="actions">
                        <button class="action-btn edit" @click="editAgent(agent)" title="تعديل">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn delete" @click="confirmDelete(agent)" title="حذف">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-show="activeTab === 'action_buttons'" class="tab-panel">
            <p class="tab-placeholder">إعدادات أزرار الإجراءات تُدار من خلال نموذج تعديل كل وكيل.</p>
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
            <button v-if="previewAgent.humanHelpEnabled" type="button" class="preview-btn primary">{{ previewAgent.humanHelpLabel || 'Human Help' }}</button>
            <button v-if="previewAgent.finishEnabled" type="button" class="preview-btn secondary">{{ previewAgent.finishLabel || 'Finish Conversation' }}</button>
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
import { ref, computed, onMounted } from 'vue'
import agentService from '../services/agentService'
import AgentModal from '../components/AgentModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { toast } from '../composables/useToast'

export default {
  name: 'AgentsView',
  components: {
    AgentModal,
    ConfirmModal
  },
  setup() {
    const agents = ref([])
    const loading = ref(true)
    const showModal = ref(false)
    const selectedAgent = ref(null)
    const isSaving = ref(false)
    const showConfirmModal = ref(false)
    const agentToDelete = ref(null)
    const activeTab = ref('general')

    const tabs = [
      { id: 'general', label: 'عام' },
      { id: 'action_buttons', label: 'أزرار الإجراءات' },
      { id: 'messages', label: 'الرسائل' },
      { id: 'permissions', label: 'الصلاحيات' }
    ]

    const previewAgent = computed(() => selectedAgent.value || (agents.value.length ? agents.value[0] : null))

    const confirmMessage = computed(() =>
      agentToDelete.value ? `هل أنت متأكد من حذف الوكيل "${agentToDelete.value.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : ''
    )

    async function fetchAgents() {
      loading.value = true
      try {
        agents.value = await agentService.getAgents()
      } catch (e) {
        toast.error('فشل تحميل قائمة الوكلاء')
        agents.value = []
      } finally {
        loading.value = false
      }
    }

    function openAddModal() {
      selectedAgent.value = null
      showModal.value = true
    }

    function editAgent(agent) {
      selectedAgent.value = { ...agent }
      showModal.value = true
    }

    function closeModal() {
      showModal.value = false
      selectedAgent.value = null
    }

    async function handleSaveAgent(payload) {
      isSaving.value = true
      try {
        if (selectedAgent.value?.id) {
          await agentService.updateAgent(selectedAgent.value.id, payload)
          toast.success('تم تحديث الوكيل بنجاح')
        } else {
          await agentService.createAgent(payload)
          toast.success('تم إضافة الوكيل بنجاح')
        }
        closeModal()
        await fetchAgents()
      } catch (e) {
        toast.error('فشل حفظ الوكيل')
      } finally {
        isSaving.value = false
      }
    }

    function confirmDelete(agent) {
      agentToDelete.value = agent
      showConfirmModal.value = true
    }

    async function handleConfirmDelete() {
      if (!agentToDelete.value) return
      try {
        const deleted = await agentService.deleteAgent(agentToDelete.value.id)
        if (deleted) {
          toast.success('تم حذف الوكيل')
          await fetchAgents()
        } else {
          toast.error('فشل حذف الوكيل')
        }
      } catch (e) {
        toast.error('فشل حذف الوكيل')
      }
      showConfirmModal.value = false
      agentToDelete.value = null
    }

    function formatDate(iso) {
      if (!iso) return '-'
      const d = new Date(iso)
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    onMounted(() => {
      fetchAgents()
    })

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
      formatDate
    }
  }
}
</script>

<style scoped>
.agents-view {
  padding: 0;
  font-family: 'Cairo', 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
  direction: rtl;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.agents-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content { }
.section-title.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 5px 0;
  font-family: 'Cairo', 'Amiri', serif;
}

.section-subtitle.page-subtitle {
  color: var(--color-dark-gray, #64748b);
  font-size: 15px;
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, var(--color-gold, #B1A28F) 0%, var(--color-gold-dark, #8c7851) 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.25);
  font-family: 'Cairo', 'Tajawal', sans-serif;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(177, 162, 143, 0.35);
}

.btn-icon-svg {
  width: 20px;
  height: 20px;
}

.tabs-wrap {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-medium-gray, #e2e8f0);
}

.tab-btn {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  font-family: 'Cairo', 'Tajawal', sans-serif;
}

.tab-btn:hover {
  color: var(--color-navy, #1e3a5f);
}

.tab-btn.active {
  color: var(--color-gold, #B1A28F);
  border-bottom-color: var(--color-gold, #B1A28F);
}

.tab-panels {
  min-height: 200px;
}

.tab-panel { }
.tab-placeholder {
  color: var(--color-dark-gray, #64748b);
  font-size: 15px;
  margin: 0;
}

.data-table-container {
  background: var(--color-white, #fff);
  border-radius: var(--radius-lg, 20px);
  border: 1px solid rgba(177, 162, 143, 0.12);
  box-shadow: var(--shadow-md, 0 4px 20px -5px rgba(0, 0, 0, 0.08));
  overflow: hidden;
}

.loading-state,
.empty-state {
  padding: 48px 24px;
  text-align: center;
  color: var(--color-dark-gray, #64748b);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--color-medium-gray, #e2e8f0);
  border-top-color: var(--color-gold, #B1A28F);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px 20px;
  text-align: right;
  border-bottom: 1px solid var(--color-medium-gray, #e2e8f0);
}

.data-table th {
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  background: var(--color-off-white, #fdfbf7);
}

.data-table tbody tr:hover {
  background: rgba(177, 162, 143, 0.04);
}

.agent-name-cell {
  font-weight: 600;
  color: var(--color-charcoal, #1e293b);
}

.agent-desc-cell {
  font-size: 13px;
  color: var(--color-dark-gray, #64748b);
  margin-top: 4px;
}

.date-cell {
  font-size: 14px;
  color: var(--color-dark-gray, #64748b);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-medium-gray, #e2e8f0);
  border-radius: 10px;
  background: var(--color-white, #fff);
  color: var(--color-dark-gray, #64748b);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.edit:hover {
  border-color: var(--color-gold, #B1A28F);
  color: var(--color-gold, #B1A28F);
}

.action-btn.delete:hover {
  border-color: var(--color-error, #ef4444);
  color: var(--color-error, #ef4444);
  background: #fef2f2;
}

/* Preview panel */
.preview-panel {
  width: 320px;
  flex-shrink: 0;
  background: var(--color-white, #fff);
  border-radius: var(--radius-lg, 20px);
  box-shadow: var(--shadow-md, 0 4px 20px -5px rgba(0, 0, 0, 0.08));
  border: 1px solid rgba(177, 162, 143, 0.12);
  padding: 20px;
}

.preview-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 16px 0;
}

.preview-chat {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  max-width: 90%;
}

.preview-bubble.bot {
  align-self: flex-start;
  background: var(--color-light-gray, #f8fafc);
  color: var(--color-charcoal, #1e293b);
}

.preview-bubble.user {
  align-self: flex-end;
  background: var(--color-info, #3b82f6);
  color: white;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.preview-btn {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: default;
}

.preview-btn.primary {
  background: var(--color-info, #3b82f6);
  color: white;
}

.preview-btn.secondary {
  background: var(--color-white, #fff);
  color: var(--color-charcoal, #1e293b);
  border: 1px solid var(--color-medium-gray, #e2e8f0);
}

@media (max-width: 1024px) {
  .preview-panel {
    display: none;
  }
}
</style>

<template>
  <div class="editor-view">
    <div class="page-header">
      <h1 class="page-title">قسم المحرر</h1>
      <p class="page-subtitle">إدارة العقود والتصوير والإعلام للمشاريع.</p>
    </div>

    <div class="tab-content custom-scrollbar">
      <div v-if="activeTab === 'contracts'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">عقود المحرر</h2>
            <p class="section-subtitle">قائمة العقود المتاحة للمحرر.</p>
          </div>
        </div>
        <div class="metrics-table-container">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم العقد</th>
                <th>المشروع</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contract in contracts" :key="contract.id">
                <td>{{ contract.id }}</td>
                <td>{{ contract.project_name || contract.contract_name || 'غير محدد' }}</td>
                <td>
                  <span class="status-tag good">{{ contract.status || 'قيد المعالجة' }}</span>
                </td>
                <td>
                  <button class="btn-action edit" @click="viewContract(contract)">عرض</button>
                </td>
              </tr>
              <tr v-if="contracts.length === 0 && !isLoading">
                <td
                  colspan="4"
                  style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
                >
                  لا توجد عقود
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="activeTab === 'photography'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">قائمة التصوير</h2>
            <p class="section-subtitle">المشاريع المعلقة للتصوير.</p>
          </div>
        </div>
        <div class="empty-state">
          <p>استخدم إدارة المشاريع للوصول إلى وظائف التصوير.</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'media'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">الموافقة على الصور</h2>
            <p class="section-subtitle">مراجعة واعتماد الصور المرفوعة.</p>
          </div>
        </div>
        <div class="empty-state">
          <p>استخدم الموافقة على الصور من القائمة الرئيسية.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import editorService from '../services/editorService';
import logger from '../utils/logger';

export default {
  name: 'EditorView',
  setup() {
    const route = useRoute();
    const isLoading = ref(false);
    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'EditorContracts') return 'contracts';
      if (name === 'EditorPhotography') return 'photography';
      if (name === 'EditorMedia') return 'media';
      return 'contracts';
    });

    const contracts = ref([]);

    const loadContracts = async () => {
      isLoading.value = true;
      try {
        const data = await editorService.getContracts();
        contracts.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading editor contracts:', error);
        contracts.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const viewContract = () => {};

    watch(
      activeTab,
      newTab => {
        if (newTab === 'contracts') loadContracts();
      },
      { immediate: true }
    );

    return {
      activeTab,
      isLoading,
      contracts,
      viewContract,
    };
  },
};
</script>

<style scoped>
.editor-view {
  padding: 24px;
}
.page-header {
  margin-bottom: 30px;
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}
.page-subtitle {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
}

.section-header-compact {
  margin-bottom: 20px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 4px 0;
}
.section-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 0;
}
.metrics-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.metrics-table th {
  text-align: right;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-bottom: 1px solid var(--color-medium-gray);
  white-space: nowrap;
}
.metrics-table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal);
}
.metrics-table tr:last-child td {
  border-bottom: none;
}
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.status-tag.good {
  background: #ecfdf5;
  color: #059669;
}
.btn-action {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-action.edit {
  background: var(--color-light-gray);
  color: var(--color-navy);
}
.btn-action.edit:hover {
  background: var(--color-medium-gray);
}
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-dark-gray);
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
}

/* Responsive: tablet landscape */
@media (max-width: 992px) {
  .editor-view {
    padding: 20px;
  }
  .page-title {
    font-size: 24px;
  }
}

/* Responsive: tablet portrait */
@media (max-width: 768px) {
  .editor-view {
    padding: 16px;
  }
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .metrics-table-container {
    margin-inline: -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* Responsive: mobile */
@media (max-width: 576px) {
  .editor-view {
    padding: 12px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .section-title {
    font-size: 17px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 10px;
    font-size: 12px;
  }
  .btn-action {
    padding: 8px 12px;
    min-height: 44px;
    font-size: 12px;
  }
  .empty-state {
    padding: 32px 12px;
  }
}

/* Responsive: extra small mobile */
@media (max-width: 320px) {
  .editor-view {
    padding: 8px;
    overflow-x: hidden;
  }
  .page-title {
    font-size: 18px;
  }
  .section-title {
    font-size: 15px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
  .status-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
}

/* Responsive: large desktop */
@media (min-width: 1200px) {
  .editor-view {
    padding: 28px;
  }
  .page-title {
    font-size: 30px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 14px 20px;
  }
}

/* Responsive: full HD */
@media (min-width: 1920px) {
  .editor-view {
    padding: 32px;
  }
  .page-title {
    font-size: 32px;
  }
  .page-subtitle {
    font-size: 16px;
  }
  .section-title {
    font-size: 22px;
  }
  .metrics-table th {
    padding: 14px 24px;
    font-size: 14px;
  }
  .metrics-table td {
    padding: 14px 24px;
    font-size: 15px;
  }
  .btn-action {
    padding: 8px 18px;
    font-size: 14px;
  }
  .empty-state {
    padding: 56px 28px;
    font-size: 16px;
  }
}

/* Responsive: 2K ultra-wide */
@media (min-width: 2560px) {
  .editor-view {
    padding: 40px;
  }
  .page-title {
    font-size: 36px;
  }
  .page-subtitle {
    font-size: 18px;
  }
  .section-title {
    font-size: 24px;
  }
  .section-subtitle {
    font-size: 16px;
  }
  .metrics-table-container {
    border-radius: 16px;
  }
  .metrics-table th {
    padding: 16px 28px;
    font-size: 15px;
  }
  .metrics-table td {
    padding: 16px 28px;
    font-size: 16px;
  }
  .btn-action {
    padding: 10px 22px;
    font-size: 15px;
    border-radius: 10px;
  }
  .status-tag {
    font-size: 14px;
    padding: 4px 14px;
  }
}

/* Responsive: 4K */
@media (min-width: 3840px) {
  .editor-view {
    padding: 48px;
  }
  .page-title {
    font-size: 42px;
  }
  .page-subtitle {
    font-size: 20px;
  }
  .section-title {
    font-size: 28px;
  }
  .section-subtitle {
    font-size: 18px;
  }
  .metrics-table-container {
    border-radius: 20px;
  }
  .metrics-table th {
    padding: 20px 32px;
    font-size: 17px;
  }
  .metrics-table td {
    padding: 20px 32px;
    font-size: 18px;
  }
  .btn-action {
    padding: 12px 26px;
    font-size: 17px;
    border-radius: 12px;
  }
  .status-tag {
    font-size: 16px;
    padding: 4px 16px;
    border-radius: 14px;
  }
  .empty-state {
    padding: 64px 32px;
    font-size: 18px;
    border-radius: 16px;
  }
  .page-header {
    margin-bottom: 40px;
  }
}
</style>

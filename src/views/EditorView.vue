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
                <td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8">
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
  color: #1e3a5f;
  margin: 0 0 5px 0;
}
.page-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}
</style>

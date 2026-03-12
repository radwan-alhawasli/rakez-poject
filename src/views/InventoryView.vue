<template>
  <div class="inventory-view">
    <div class="welcome-header">
      <h1 class="welcome-title">المخزون</h1>
      <p class="welcome-subtitle">عرض عقود ووحدات المخزون.</p>
    </div>

    <LoadingSpinner v-if="loading" text="جاري تحميل البيانات..." />

    <div v-else-if="error" class="error-state">
      <p class="error-text">{{ error }}</p>
      <button type="button" class="retry-btn" @click="fetchContracts">إعادة المحاولة</button>
    </div>

    <div v-else class="table-container">
      <div v-if="items.length === 0" class="empty-state">
        <p>لا توجد عقود لعرضها.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="custom-table table-mobile-stacked">
          <thead>
            <tr>
              <th>#</th>
              <th>العقد / المشروع</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in items" :key="item.id || idx">
              <td data-label="#">{{ (page - 1) * perPage + idx + 1 }}</td>
              <td data-label="العقد / المشروع">{{ item.name ?? item.contract_number ?? item.id ?? '—' }}</td>
              <td data-label="الإجراءات">
                <router-link
                  v-if="item.id"
                  :to="{ name: 'ContractForm', params: { id: item.id } }"
                  class="action-link"
                >
                  عرض
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="total > perPage" class="pagination-row">
        <button type="button" :disabled="page <= 1" @click="page = Math.max(1, page - 1)">
          السابق
        </button>
        <span class="page-info">صفحة {{ page }} من {{ totalPages }}</span>
        <button
          type="button"
          :disabled="page >= totalPages"
          @click="page = Math.min(totalPages, page + 1)"
        >
          التالي
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import inventoryService from '@/services/inventoryService';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const loading = ref(true);
const error = ref('');
const items = ref([]);
const total = ref(0);
const page = ref(1);
const perPage = 20;

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)));

async function fetchContracts() {
  loading.value = true;
  error.value = '';
  try {
    const res = await inventoryService.getContractsAdminIndex({
      page: page.value,
      per_page: perPage,
    });
    items.value = res?.items ?? [];
    total.value = res?.total ?? 0;
  } catch (e) {
    error.value = e?.message ?? 'فشل تحميل بيانات المخزون';
    items.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

watch(page, fetchContracts, { immediate: true });
</script>

<style scoped>
.inventory-view {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.welcome-header {
  margin-bottom: 1.5rem;
}
.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}
.welcome-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}
.error-state {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
}
.retry-btn {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
}
.retry-btn:hover {
  background: #f8fafc;
}
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.table-responsive {
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.custom-table th,
.custom-table td {
  padding: 0.75rem 1rem;
  text-align: right;
  border-bottom: 1px solid #e2e8f0;
}
.custom-table th {
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
}
.action-link {
  color: var(--color-gold, #b8860b);
  text-decoration: none;
}
.action-link:hover {
  text-decoration: underline;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.pagination-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

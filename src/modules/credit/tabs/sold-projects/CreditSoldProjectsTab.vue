<template>
  <div class="management-view">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">المشاريع المباعة</h2>
        <p class="section-subtitle">قائمة بالمشاريع المباعة التي تحتاج إلى معالجة ائتمانية.</p>
      </div>
    </div>
    <div class="metrics-table-container">
      <div class="table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>رقم المشروع</th>
            <th>اسم المشروع</th>
            <th>عدد الوحدات</th>
            <th>القيمة الإجمالية</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in soldProjects" :key="project.id">
            <td data-label="رقم المشروع">{{ project.id }}</td>
            <td data-label="اسم المشروع">{{ project.name || 'غير محدد' }}</td>
            <td data-label="عدد الوحدات">{{ project.units_count || 0 }}</td>
            <td data-label="القيمة الإجمالية">{{ formatCurrency(project.total_value) }}</td>
            <td data-label="الإجراءات">
              <button class="btn-action edit" @click="viewSoldProjectDetail(project)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                عرض
              </button>
            </td>
          </tr>
          <tr v-if="soldProjects.length === 0 && !isLoading">
            <td
              colspan="5"
              style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
            >
              لا توجد مشاريع مباعة
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <Pagination
      v-if="creditTotalItems > 0"
      :current-page="creditCurrentPage"
      :total-items="creditTotalItems"
      :per-page="creditPerPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import { useCreditSoldProjects } from '@/composables/credit/useCreditSoldProjects';

const {
  isLoading,
  soldProjects,
  currentPage: creditCurrentPage,
  perPage: creditPerPage,
  totalItems: creditTotalItems,
  formatCurrency,
  loadSoldProjects,
  viewSoldProjectDetail,
  handlePageChange,
  handlePerPageChange,
} = useCreditSoldProjects();

onMounted(() => {
  loadSoldProjects();
});
</script>

<style scoped>
@media (max-width: 768px) {
  .section-header-compact { padding: 16px; }
  .section-title { font-size: 18px; }
  .section-subtitle { font-size: 13px; }
}
@media (max-width: 576px) {
  .section-header-compact { padding: 12px; }
  .table-responsive { margin: 0 -12px; }
}
</style>

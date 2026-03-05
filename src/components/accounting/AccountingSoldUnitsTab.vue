<template>
  <div class="management-view">
    <SoldUnitDetailView v-if="soldUnitDetailView === 'detail' && selectedSoldUnit" :unit="selectedSoldUnit" @back="handleSoldUnitDetailBack" @create-commission="handleCreateCommission" />
    <template v-else>
      <div class="section-header-compact"><div><h2 class="section-title">الوحدات المباعة</h2><p class="section-subtitle">قائمة بالوحدات المباعة مع معلومات العمولات.</p></div></div>
      <div class="metrics-table-container table-responsive">
        <table class="metrics-table">
          <thead><tr><th>اسم المشروع</th><th>رقم الوحدة</th><th>نوع الوحدة</th><th>سعر البيع النهائي</th><th>السعي</th><th>نسبة السعي</th><th>الفريق</th><th>الإجراءات</th></tr></thead>
          <tbody>
            <tr v-for="unit in soldUnits" :key="unit.id">
              <td>{{ unit.project_name || 'غير محدد' }}</td>
              <td>{{ unit.unit_number || unit.reservation_id || unit.id }}</td>
              <td>{{ unit.unit_type || '—' }}</td>
              <td>{{ formatCurrency(unit.final_sale_price || unit.total_value) }}</td>
              <td>{{ unit.commission_source === 'owner' ? 'من المالك' : unit.commission_source === 'buyer' ? 'من المشتري' : '—' }}</td>
              <td>{{ unit.commission_percentage ? unit.commission_percentage + '%' : '—' }}</td>
              <td>{{ unit.team_name || '—' }}</td>
              <td><button class="btn-action edit" @click="viewSoldUnitDetail(unit)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>عرض</button></td>
            </tr>
            <tr v-if="soldUnits.length === 0 && !isLoading"><td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8">لا توجد وحدات مباعة</td></tr>
          </tbody>
        </table>
      </div>
      <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import SoldUnitDetailView from '@/components/accounting/SoldUnitDetailView.vue';
import { useAccountingSoldUnits } from '@/composables/accounting/useAccountingSoldUnits';

const {
  isLoading,
  soldUnits,
  soldUnitDetailView,
  selectedSoldUnit,
  currentPage,
  perPage,
  totalItems,
  loadSoldUnits,
  viewSoldUnitDetail,
  handleSoldUnitDetailBack,
  handleCreateCommission,
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
} = useAccountingSoldUnits();

onMounted(() => {
  loadSoldUnits();
});
</script>

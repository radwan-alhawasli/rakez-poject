<template>
  <div class="management-view accounting-sold-units-tab">
    <SoldUnitDetailView v-if="soldUnitDetailView === 'detail' && selectedSoldUnit" :unit="selectedSoldUnit" @back="handleSoldUnitDetailBack" />
    <template v-else>
      <header class="welcome-header sold-units-hero" aria-labelledby="acct-sold-units-title">
        <div class="sold-units-hero-inner">
          <span class="title-icon-wrap" aria-hidden="true">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          <div class="sold-units-hero-text">
            <h1 id="acct-sold-units-title" class="welcome-title">الوحدات المباعة</h1>
            <p class="welcome-subtitle">قائمة بالوحدات المكتملة البيع مع السعي والفريق والإجراءات.</p>
          </div>
        </div>
        <div class="sold-units-hero-actions">
          <button type="button" class="btn-refresh-sold-units" :disabled="isLoading" @click="loadSoldUnits">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            تحديث
          </button>
        </div>
      </header>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner" aria-hidden="true"></div>
        <p>جاري تحميل الوحدات المباعة...</p>
      </div>

      <div v-else-if="soldUnits.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <p>لا توجد وحدات مباعة في القائمة الحالية.</p>
      </div>

      <template v-else>
        <div class="sold-units-table-wrap">
          <div class="metrics-table-container table-responsive">
            <table class="metrics-table table-mobile-stacked">
              <thead>
                <tr>
                  <th>اسم المشروع</th>
                  <th>رقم الوحدة</th>
                  <th>نوع الوحدة</th>
                  <th>سعر البيع النهائي</th>
                  <th>السعي</th>
                  <th>نسبة السعي</th>
                  <th>الفريق</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="unit in soldUnits" :key="unit.id">
                  <td data-label="اسم المشروع">{{ unit.project_name || 'غير محدد' }}</td>
                  <td data-label="رقم الوحدة">{{ unit.unit_number || unit.reservation_id || unit.id }}</td>
                  <td data-label="نوع الوحدة">
                    <span v-if="unit.unit_type">{{ unit.unit_type }}</span>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="سعر البيع النهائي">{{ formatCurrency(pickFinalSalePriceFromUnit(unit) ?? 0) }}</td>
                  <td data-label="السعي">
                    <template v-if="unit.commission_source === 'owner'">من المالك</template>
                    <template v-else-if="unit.commission_source === 'buyer'">من المشتري</template>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="نسبة السعي">
                    <span v-if="unit.commission_percentage">{{ unit.commission_percentage }}%</span>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="الفريق">
                    <span v-if="unit.team_name">{{ unit.team_name }}</span>
                    <span v-else class="cell-placeholder">—</span>
                  </td>
                  <td data-label="الإجراءات">
                    <button type="button" class="btn-action edit" @click="viewSoldUnitDetail(unit)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      عرض
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <Pagination v-if="totalItems > 0" :current-page="currentPage" :total-items="totalItems" :per-page="perPage" @page-change="handlePageChange" @per-page-change="handlePerPageChange" />
      </template>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import SoldUnitDetailView from '@/modules/accounting/components/SoldUnitDetailView.vue';
import { useAccountingSoldUnits } from '@/composables/accounting/useAccountingSoldUnits';
import { pickFinalSalePriceFromUnit } from '@/utils/accountingSoldUnitFields';

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
  handlePageChange,
  handlePerPageChange,
  formatCurrency,
} = useAccountingSoldUnits();

onMounted(() => {
  loadSoldUnits();
});
</script>

<style scoped src="./styles/AccountingSoldUnitsTab.scoped.s1.css"></style>

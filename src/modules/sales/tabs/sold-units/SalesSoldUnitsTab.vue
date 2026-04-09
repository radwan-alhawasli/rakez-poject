<template>
  <div class="sold-units-tab">
    <header class="welcome-header sold-units-hero" aria-labelledby="sold-units-title">
      <div class="sold-units-hero-inner">
        <span class="title-icon-wrap" aria-hidden="true">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <div class="sold-units-hero-text">
          <h1 id="sold-units-title" class="welcome-title">الوحدات المباعة</h1>
          <p class="welcome-subtitle">سجل الوحدات المكتملة البيع وملخصات العمولات</p>
        </div>
      </div>
      <button type="button" class="btn-refresh" :disabled="isLoadingSoldUnits" @click="loadSoldUnits">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        تحديث
      </button>
    </header>

    <div v-if="isLoadingSoldUnits" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الوحدات المباعة...</p>
    </div>

    <div v-else-if="soldUnits.length === 0" class="empty-state">
      <svg
        viewBox="0 0 24 24"
        width="48"
        height="48"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <p>لا توجد وحدات مباعة بعد.</p>
    </div>

    <div v-else>
      <!-- Commission detail panel -->
      <div v-if="selectedSoldUnit" class="commission-panel">
        <div class="commission-panel-header">
          <button class="btn-back" @click="clearSelectedUnit">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            رجوع
          </button>
          <h3>ملخص عمولة الوحدة: {{ selectedSoldUnit.unit_number || selectedSoldUnit.id }}</h3>
        </div>
        <div v-if="isLoadingCommission" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل ملخص العمولة...</p>
        </div>
        <div v-else-if="soldUnitCommission" class="commission-details">
          <div class="detail-grid">
            <div class="detail-card">
              <span class="detail-label">إجمالي العمولة</span>
              <span class="detail-value">{{
                formatCurrency(soldUnitCommission.total_commission || 0)
              }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">العمولة المدفوعة</span>
              <span class="detail-value success">{{
                formatCurrency(soldUnitCommission.paid_commission || 0)
              }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">العمولة المعلقة</span>
              <span class="detail-value warning">{{
                formatCurrency(soldUnitCommission.pending_commission || 0)
              }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">الموظف</span>
              <span class="detail-value">{{ soldUnitCommission.employee_name || '—' }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state"><p>لا توجد بيانات عمولة لهذه الوحدة.</p></div>
      </div>

      <!-- Sold units table -->
      <div class="sold-units-table-wrap table-container table-responsive">
        <table class="data-table table-mobile-stacked">
          <thead>
            <tr>
              <th>#</th>
              <th>رقم الوحدة</th>
              <th>المشروع</th>
              <th>العميل</th>
              <th>سعر البيع</th>
              <th>تاريخ البيع</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(unit, idx) in soldUnits" :key="unit.id">
              <td data-label="#">{{ (soldUnitsPage - 1) * soldUnitsPerPage + idx + 1 }}</td>
              <td data-label="رقم الوحدة">{{ unit.unit_number || unit.id }}</td>
              <td data-label="المشروع">{{ unit.project_name || unit.contract_name || '—' }}</td>
              <td data-label="العميل">{{ unit.client_name || '—' }}</td>
              <td data-label="سعر البيع">{{ formatCurrency(unit.sale_price || unit.price || 0) }}</td>
              <td data-label="تاريخ البيع">{{ formatDate(unit.sold_at || unit.created_at) }}</td>
              <td data-label="الحالة">
                <span class="badge badge-sold">مباعة</span>
              </td>
              <td data-label="إجراءات">
                <button
                  class="btn-icon-sm"
                  title="ملخص العمولة"
                  @click="viewSoldUnitCommission(unit)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <Pagination
          v-if="soldUnitsTotal > soldUnitsPerPage"
          :current-page="soldUnitsPage"
          :total-items="soldUnitsTotal"
          :per-page="soldUnitsPerPage"
          @page-change="handleSoldUnitsPageChange"
          @per-page-change="handleSoldUnitsPerPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Pagination from '@/components/Pagination.vue';
import { useSalesSoldUnits } from '@/composables/sales/useSalesSoldUnits';

const {
  soldUnits, isLoadingSoldUnits, selectedSoldUnit, soldUnitCommission,
  isLoadingCommission, soldUnitsPage, soldUnitsPerPage, soldUnitsTotal,
  formatCurrency, formatDate,
  loadSoldUnits, viewSoldUnitCommission, clearSelectedUnit,
  handleSoldUnitsPageChange, handleSoldUnitsPerPageChange,
} = useSalesSoldUnits();

loadSoldUnits();
</script>

<style scoped src="./styles/SalesSoldUnitsTab.scoped.s1.css"></style>
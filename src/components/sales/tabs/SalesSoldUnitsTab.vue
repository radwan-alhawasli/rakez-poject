<template>
  <div class="sold-units-tab">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø¹Ø©</h1>
        <p class="page-subtitle">Ø³Ø¬Ù„ Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø© Ø§Ù„Ø¨ÙŠØ¹ ÙˆÙ…Ù„Ø®ØµØ§Øª Ø§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª</p>
      </div>
      <button class="btn-primary" @click="loadSoldUnits">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        ØªØ­Ø¯ÙŠØ«
      </button>
    </div>

    <div v-if="isLoadingSoldUnits" class="loading-state">
      <div class="spinner"></div>
      <p>Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø¹Ø©...</p>
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
      <p>Ù„Ø§ ØªÙˆØ¬Ø¯ ÙˆØ­Ø¯Ø§Øª Ù…Ø¨Ø§Ø¹Ø© Ø¨Ø¹Ø¯.</p>
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
            Ø±Ø¬ÙˆØ¹
          </button>
          <h3>Ù…Ù„Ø®Øµ Ø¹Ù…ÙˆÙ„Ø© Ø§Ù„ÙˆØ­Ø¯Ø©: {{ selectedSoldUnit.unit_number || selectedSoldUnit.id }}</h3>
        </div>
        <div v-if="isLoadingCommission" class="loading-state">
          <div class="spinner"></div>
          <p>Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ù…Ù„Ø®Øµ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©...</p>
        </div>
        <div v-else-if="soldUnitCommission" class="commission-details">
          <div class="detail-grid">
            <div class="detail-card">
              <span class="detail-label">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©</span>
              <span class="detail-value">{{
                formatCurrency(soldUnitCommission.total_commission || 0)
              }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Ø§Ù„Ø¹Ù…ÙˆÙ„Ø© Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø©</span>
              <span class="detail-value success">{{
                formatCurrency(soldUnitCommission.paid_commission || 0)
              }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Ø§Ù„Ø¹Ù…ÙˆÙ„Ø© Ø§Ù„Ù…Ø¹Ù„Ù‚Ø©</span>
              <span class="detail-value warning">{{
                formatCurrency(soldUnitCommission.pending_commission || 0)
              }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">Ø§Ù„Ù…ÙˆØ¸Ù</span>
              <span class="detail-value">{{ soldUnitCommission.employee_name || 'â€”' }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state"><p>Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù…ÙˆÙ„Ø© Ù„Ù‡Ø°Ù‡ Ø§Ù„ÙˆØ­Ø¯Ø©.</p></div>
      </div>

      <!-- Sold units table -->
      <div v-else class="table-container table-responsive">
        <table class="data-table table-mobile-stacked">
          <thead>
            <tr>
              <th>#</th>
              <th>Ø±Ù‚Ù… Ø§Ù„ÙˆØ­Ø¯Ø©</th>
              <th>Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</th>
              <th>Ø§Ù„Ø¹Ù…ÙŠÙ„</th>
              <th>Ø³Ø¹Ø± Ø§Ù„Ø¨ÙŠØ¹</th>
              <th>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨ÙŠØ¹</th>
              <th>Ø§Ù„Ø­Ø§Ù„Ø©</th>
              <th>Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(unit, idx) in soldUnits" :key="unit.id">
              <td data-label="#">{{ (soldUnitsPage - 1) * soldUnitsPerPage + idx + 1 }}</td>
              <td data-label="رقم الوحدة">{{ unit.unit_number || unit.id }}</td>
              <td data-label="المشروع">{{ unit.project_name || unit.contract_name || 'â€”' }}</td>
              <td data-label="العميل">{{ unit.client_name || 'â€”' }}</td>
              <td data-label="سعر البيع">{{ formatCurrency(unit.sale_price || unit.price || 0) }}</td>
              <td data-label="تاريخ البيع">{{ formatDate(unit.sold_at || unit.created_at) }}</td>
              <td data-label="الحالة">
                <span class="badge badge-sold">Ù…Ø¨Ø§Ø¹Ø©</span>
              </td>
              <td data-label="إجراءات">
                <button
                  class="btn-icon-sm"
                  title="Ù…Ù„Ø®Øµ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø©"
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

<style scoped>
/* Ã¢â€â‚¬Ã¢â€â‚¬ Sold Units / Deposits / Analytics shared Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
.sold-units-tab,
.deposits-tab,
.analytics-tab {
  animation: fadeInUp 0.3s ease;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--color-medium-gray);
  padding-bottom: 0;
}

.sub-tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-dark-gray);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.sub-tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.sub-tab-btn:hover:not(.active) {
  color: #334155;
}

.commission-panel {
  background: var(--color-white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.commission-panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.commission-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-charcoal);
}

.commission-details .detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.detail-card {
  background: var(--color-light-gray);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: var(--color-dark-gray);
  font-weight: 500;
}

.detail-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-charcoal);
}

.detail-value.success {
  color: #10b981;
}
.detail-value.warning {
  color: #f59e0b;
}

.report-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.analytics-grid {
  margin-bottom: 24px;
}

.badge-sold {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-danger {
  background: #fee2e2;
  color: #dc2626;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.btn-icon-sm {
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.btn-icon-sm:hover {
  background: var(--color-medium-gray);
  color: var(--color-charcoal);
}
</style>

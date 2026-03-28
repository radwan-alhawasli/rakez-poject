<template>
  <div class="deposits-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">الودائع</h1>
        <p class="welcome-subtitle">إدارة ودائع المبيعات ومتابعة المستحقات</p>
      </div>
    </div>

    <!-- Sub-tabs -->
    <div class="sub-tabs">
      <button
        class="sub-tab-btn"
        :class="{ active: depositsSubTab === 'management' }"
        @click="switchSubTab('management')"
      >
        إدارة الودائع
      </button>
      <button
        class="sub-tab-btn"
        :class="{ active: depositsSubTab === 'follow-up' }"
        @click="switchSubTab('follow-up')"
      >
        متابعة الودائع
      </button>
    </div>

    <!-- Management sub-tab -->
    <div v-if="depositsSubTab === 'management'">
      <div v-if="isLoadingDepositsManagement" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات الودائع...</p>
      </div>
      <div v-else-if="depositsManagement.length === 0" class="empty-state">
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
        <p>لا توجد ودائع لإدارتها حالياً.</p>
      </div>
      <div v-else class="table-container table-responsive">
        <table class="data-table table-mobile-stacked">
          <thead>
            <tr>
              <th>#</th>
              <th>الوحدة</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>تاريخ الإيداع</th>
              <th>تاريخ الاستحقاق</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dep, idx) in depositsManagement" :key="dep.id || idx">
              <td data-label="#">{{ idx + 1 }}</td>
              <td data-label="الوحدة">{{ dep.unit_number || dep.unit_id || '—' }}</td>
              <td data-label="العميل">{{ dep.client_name || '—' }}</td>
              <td data-label="المبلغ">{{ formatCurrency(dep.amount || 0) }}</td>
              <td data-label="تاريخ الإيداع">{{ formatDate(dep.deposit_date || dep.created_at) }}</td>
              <td data-label="تاريخ الاستحقاق">{{ dep.due_date ? formatDate(dep.due_date) : '—' }}</td>
              <td>
                <span
                  :class="[
                    'badge',
                    dep.status === 'paid'
                      ? 'badge-success'
                      : dep.status === 'overdue'
                      ? 'badge-danger'
                      : 'badge-warning',
                  ]"
                >
                  {{
                    dep.status === 'paid'
                      ? 'مدفوع'
                      : dep.status === 'overdue'
                      ? 'متأخر'
                      : 'معلق'
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Follow-up sub-tab -->
    <div v-else-if="depositsSubTab === 'follow-up'">
      <div v-if="isLoadingDepositsFollowUp" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات المتابعة...</p>
      </div>
      <div v-else-if="depositsFollowUp.length === 0" class="empty-state">
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p>لا توجد ودائع تحتاج متابعة حالياً.</p>
      </div>
      <div v-else class="table-container table-responsive">
        <table class="data-table table-mobile-stacked">
          <thead>
            <tr>
              <th>#</th>
              <th>الوحدة</th>
              <th>العميل</th>
              <th>المبلغ المستحق</th>
              <th>تاريخ الاستحقاق</th>
              <th>أيام التأخير</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dep, idx) in depositsFollowUp" :key="dep.id || idx">
              <td data-label="#">{{ idx + 1 }}</td>
              <td data-label="الوحدة">{{ dep.unit_number || dep.unit_id || '—' }}</td>
              <td data-label="العميل">{{ dep.client_name || '—' }}</td>
              <td data-label="المبلغ المستحق">{{ formatCurrency(dep.amount || dep.outstanding_amount || 0) }}</td>
              <td data-label="تاريخ الاستحقاق">{{ dep.due_date ? formatDate(dep.due_date) : '—' }}</td>
              <td>
                <span
                  :class="[
                    'badge',
                    (dep.overdue_days || 0) > 0 ? 'badge-danger' : 'badge-warning',
                  ]"
                >
                  {{ dep.overdue_days || 0 }} يوم
                </span>
              </td>
              <td data-label="الحالة">
                <span class="badge badge-warning">
                  {{ dep.follow_up_status || 'بانتظار المتابعة' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSalesDeposits } from '@/composables/sales/useSalesDeposits';

const {
  depositsSubTab, depositsManagement, depositsFollowUp,
  isLoadingDepositsManagement, isLoadingDepositsFollowUp,
  loadDepositsManagement, switchSubTab,
  formatCurrency, formatDate,
} = useSalesDeposits();

loadDepositsManagement();
</script>

<style scoped>
/* ─── Sold Units / Deposits / Analytics shared ────────────────────────────── */
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

<template>
  <div class="analytics-tab">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">التحليلات والتقارير</h1>
        <p class="page-subtitle">تقارير المبيعات والودائع والعمولات الشهرية</p>
      </div>
      <div class="date-filters">
        <input
          type="date"
          :value="analyticsFilters.from"
          class="date-input"
          placeholder="من تاريخ"
          @input="analyticsFilters.from = $event.target.value"
        />
        <span>إلى</span>
        <input
          type="date"
          :value="analyticsFilters.to"
          class="date-input"
          placeholder="إلى تاريخ"
          @input="analyticsFilters.to = $event.target.value"
        />
        <button class="btn-primary" @click="loadAnalyticsDashboard">
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
          تحديث
        </button>
      </div>
    </div>

    <div class="sub-tabs">
      <button
        class="sub-tab-btn"
        :class="{ active: activeSubTab === 'overview' }"
        @click="activeSubTab = 'overview'; loadAnalyticsDashboard()"
      >
        نظرة عامة
      </button>
      <button
        class="sub-tab-btn"
        :class="{ active: activeSubTab === 'commissions' }"
        @click="activeSubTab = 'commissions'; loadAnalyticsMonthlyReport()"
      >
        تقرير العمولات الشهري
      </button>
    </div>

    <div v-if="activeSubTab === 'overview'">
      <div v-if="isLoadingAnalytics" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات التحليلات...</p>
      </div>
      <div v-else-if="!analyticsDashboard" class="empty-state">
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <p>لا توجد بيانات تحليلية. اضغط "تحديث" لتحميلها.</p>
      </div>
      <div v-else class="stats-grid analytics-grid">
        <div class="stat-card animate-fade-in-up hover-lift">
          <div class="stat-content">
            <span class="stat-label">إجمالي الوحدات المباعة</span>
            <span class="stat-value number">{{ analyticsDashboard.total_sold_units || 0 }}</span>
          </div>
          <div class="stat-icon-bg confirmed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up hover-lift">
          <div class="stat-content">
            <span class="stat-label">إجمالي العمولات</span>
            <span class="stat-value number">{{
              formatCurrency(analyticsDashboard.total_commissions || 0)
            }}</span>
          </div>
          <div class="stat-icon-bg deposits">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up hover-lift">
          <div class="stat-content">
            <span class="stat-label">الودائع المعلقة</span>
            <span class="stat-value number">{{
              formatCurrency(analyticsDashboard.pending_deposits || 0)
            }}</span>
          </div>
          <div class="stat-icon-bg reserved">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>
        <div class="stat-card animate-fade-in-up hover-lift">
          <div class="stat-content">
            <span class="stat-label">نسبة إتمام المبيعات</span>
            <span class="stat-value number">{{ analyticsDashboard.completion_rate || 0 }}%</span>
          </div>
          <div class="stat-icon-bg ratio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeSubTab === 'commissions'">
      <div v-if="isLoadingMonthlyReport" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل تقرير العمولات...</p>
      </div>
      <div v-else-if="!analyticsMonthlyReport" class="empty-state">
        <p>لا توجد بيانات. اضغط على "تقرير العمولات الشهري" لتحميله.</p>
      </div>
      <div v-else class="table-container table-responsive">
        <div class="report-summary">
          <div class="detail-card">
            <span class="detail-label">إجمالي العمولات الشهرية</span>
            <span class="detail-value">{{
              formatCurrency(analyticsMonthlyReport.total || 0)
            }}</span>
          </div>
          <div class="detail-card">
            <span class="detail-label">عدد المعاملات</span>
            <span class="detail-value">{{ analyticsMonthlyReport.count || 0 }}</span>
          </div>
        </div>
        <table
          class="data-table"
          v-if="analyticsMonthlyReport.items && analyticsMonthlyReport.items.length"
        >
          <thead>
            <tr>
              <th>الموظف</th>
              <th>المشروع</th>
              <th>العمولة</th>
              <th>الشهر</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in analyticsMonthlyReport.items" :key="idx">
              <td>{{ row.employee_name || '—' }}</td>
              <td>{{ row.project_name || '—' }}</td>
              <td>{{ formatCurrency(row.commission || 0) }}</td>
              <td>{{ row.month || row.period || '—' }}</td>
              <td>
                <span
                  :class="['badge', row.status === 'paid' ? 'badge-success' : 'badge-warning']"
                >
                  {{ row.status === 'paid' ? 'مدفوع' : 'معلق' }}
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
import { useSalesAnalytics } from '@/composables/sales/useSalesAnalytics';

const {
  analyticsDashboard, analyticsFilters, isLoadingAnalytics,
  analyticsSubTab: activeSubTab, analyticsMonthlyReport, isLoadingMonthlyReport,
  loadAnalyticsDashboard, loadAnalyticsMonthlyReport, formatCurrency,
} = useSalesAnalytics();
</script>

<style scoped>
/* تنسيقات التحليلات — من الأب SalesViewExtended */
.analytics-tab {
  width: 100%;
  direction: rtl;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  padding: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
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

.date-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid var(--color-medium-gray);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-charcoal);
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: var(--color-dark-gray);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-medium-gray);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-dark-gray);
  text-align: center;
}

.empty-state svg {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 14px;
  padding: 20px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 58, 95, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 4px;
  min-width: 0;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-dark-gray);
}

.stat-value {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  color: var(--color-charcoal);
  line-height: 1.2;
  direction: ltr;
  unicode-bidi: embed;
}

.stat-icon-bg {
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-bg svg {
  width: 24px;
  height: 24px;
  color: white;
}

.stat-icon-bg.confirmed {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.stat-icon-bg.deposits {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon-bg.reserved {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.stat-icon-bg.ratio {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
}

.report-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.detail-card {
  background: var(--color-light-gray);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
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

.table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--color-light-gray);
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid var(--color-medium-gray);
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.data-table tr:hover {
  background: var(--color-light-gray);
}

.badge {
  padding: 3px 10px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #dcfce7;
  color: #16a34a;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

@media (max-width: 576px) {
  .date-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div>
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">التقارير التسويقية</h1>
        <p class="welcome-subtitle">تحليل أداء المشاريع والموظفين والميزانيات</p>
      </div>
      <div style="display: flex; gap: 8px">
          <button class="btn-secondary" @click="exportReportsExcel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-left: 6px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Excel
          </button>
          <button class="btn-secondary" @click="exportReportsPdf">PDF</button>
        </div>
    </div>

    <div class="overview-section" style="margin-bottom: 24px">
      <div class="section-header" style="margin-bottom: 14px">
        <h3 class="section-title-chart">فلترة التقارير</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px">
        <div class="form-group">
          <label>المشروع</label>
          <select v-model="reportFilters.project_id" class="form-input">
            <option value="">-- جميع المشاريع --</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.project_name || p.name || 'Project #' + p.id }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>الموظف</label>
          <select v-model="reportFilters.user_id" class="form-input">
            <option value="">-- جميع الموظفين --</option>
            <option v-for="e in marketingEmployees" :key="e.id" :value="e.id">{{ e.name || e.full_name }}</option>
          </select>
        </div>
      </div>
      <button class="btn-primary" @click="loadReports" :disabled="isLoadingReports">
        {{ isLoadingReports ? 'جاري التحميل...' : 'تحميل التقارير' }}
      </button>
    </div>

    <div v-if="isLoadingReports" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل التقارير...</p>
    </div>

    <div v-else-if="reportRows.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
      <p>لا توجد بيانات تقارير. اختر مشروعاً أو موظفاً وأعد التحميل.</p>
    </div>

    <div v-else>
      <div class="overview-section" style="margin-bottom: 24px">
        <div class="section-header" style="margin-bottom: 14px">
          <h3 class="section-title-chart">ملخص التقارير</h3>
        </div>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">أداء المشاريع</span>
            <span class="detail-value">{{ reportSummary.projectPerformance }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">تحليل الميزانية</span>
            <span class="detail-value">{{ reportSummary.budgetAnalysis }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">إحصائيات الحجوزات</span>
            <span class="detail-value">{{ reportSummary.bookingStats }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">أداء الموظفين</span>
            <span class="detail-value">{{ reportSummary.employeePerformance }}</span>
          </div>
        </div>
      </div>

      <div class="leads-table-container table-responsive">
        <table class="luxury-table table-mobile-stacked">
          <thead>
            <tr>
              <th>القسم</th>
              <th>البند</th>
              <th>القيمة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in reportRows" :key="idx" class="hover-row">
              <td data-label="القسم">{{ row.section }}</td>
              <td data-label="البند">{{ row.name }}</td>
              <td data-label="القيمة">{{ row.summary }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMarketingReports } from '@/composables/marketing/useMarketingReports';

const {
  reportRows,
  reportSummary,
  reportFilters,
  isLoadingReports,
  projects,
  marketingEmployees,
  loadReports,
  exportReportsExcel,
  exportReportsPdf,
} = useMarketingReports();
</script>
